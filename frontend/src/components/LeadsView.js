import React, { useState, useEffect } from 'react';
import LeadsService from '../services/leadsService';
import InventoryService from '../services/inventoryService';
import OrdersService from '../services/ordersService';
import LeadForm from './forms/LeadForm';
import PaymentForm from './forms/PaymentForm';
import { LEAD_STATUSES, SALES_TEAM, formatCurrency } from '../constants';

const LeadsView = ({ user, hasPermission, uploadFile, getFileUrl }) => {
  const [leads, setLeads] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [currentLeadForChoice, setCurrentLeadForChoice] = useState(null);
  const [choiceOptions, setChoiceOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState('all');

  useEffect(() => {
    loadLeads();
    loadInventory();
    
    // Add keyboard shortcuts
    const handleKeyPress = (e) => {
      // Check if user is not typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch(e.key.toLowerCase()) {
        case 'a':
          if (hasPermission('leads', 'write')) {
            setShowForm(true);
          }
          break;
        case 's':
          if (selectedLead && hasPermission('leads', 'assign')) {
            handleAssignLead(selectedLead);
          }
          break;
        case 'p':
          if (selectedLead && selectedLead.status === 'converted') {
            handlePaymentReceived(selectedLead);
          }
          break;
        case 'n':
          if (selectedLead) {
            handleProgressLead(selectedLead);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedLead, hasPermission]);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await LeadsService.getLeads();
      setLeads(data);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInventory = async () => {
    try {
      const data = await InventoryService.getInventory();
      setInventory(data);
    } catch (error) {
      console.error("Error loading inventory:", error);
    }
  };

  const handleSubmit = async (leadData) => {
    try {
      if (editingLead) {
        await LeadsService.updateLead(editingLead.id, leadData);
      } else {
        // Set initial status based on assignment
        const initialData = {
          ...leadData,
          status: leadData.assigned_to ? 'assigned' : 'unassigned',
          created_by: user.name
        };
        await LeadsService.createLead(initialData);
      }
      setShowForm(false);
      setEditingLead(null);
      loadLeads();
    } catch (error) {
      console.error('Error saving lead:', error);
      alert('Failed to save lead');
    }
  };

  const handleAssignLead = async (lead) => {
    const assignedTo = prompt(`Assign lead to (${SALES_TEAM.join(', ')}):`);
    if (assignedTo && SALES_TEAM.includes(assignedTo)) {
      try {
        await LeadsService.updateLead(lead.id, {
          ...lead,
          assigned_to: assignedTo,
          status: 'assigned',
          assigned_date: new Date().toISOString()
        });
        loadLeads();
      } catch (error) {
        console.error('Error assigning lead:', error);
      }
    }
  };

  const handleProgressLead = (lead) => {
    const currentStatus = LEAD_STATUSES[lead.status];
    if (currentStatus && currentStatus.next.length > 0) {
      if (currentStatus.next.length === 1) {
        // Auto progress if only one option
        updateLeadStatus(lead, currentStatus.next[0]);
      } else {
        // Show choice modal
        setCurrentLeadForChoice(lead);
        setChoiceOptions(currentStatus.next);
        setShowChoiceModal(true);
      }
    }
  };

  const updateLeadStatus = async (lead, newStatus) => {
    try {
      await LeadsService.updateLead(lead.id, {
        ...lead,
        status: newStatus,
        [`${newStatus}_date`]: new Date().toISOString()
      });
      setShowChoiceModal(false);
      loadLeads();
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const handlePaymentReceived = (lead) => {
    setSelectedLead(lead);
    setShowPaymentForm(true);
  };

  const handlePaymentSubmit = async (paymentData) => {
    try {
      // Update lead status
      await LeadsService.updateLead(selectedLead.id, {
        ...selectedLead,
        status: 'payment_received',
        payment_date: new Date().toISOString(),
        payment_details: paymentData
      });

      // Create order for finance approval
      const orderData = {
        lead_id: selectedLead.id,
        customer_name: selectedLead.name,
        customer_email: selectedLead.email,
        customer_phone: selectedLead.phone,
        ...paymentData,
        status: 'pending_approval',
        created_by: user.name
      };

      await OrdersService.create(orderData);
      
      setShowPaymentForm(false);
      setSelectedLead(null);
      loadLeads();
      alert('Payment recorded and order sent for approval!');
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Failed to record payment');
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesAssigned = assignedFilter === 'all' || 
                           (assignedFilter === 'unassigned' && !lead.assigned_to) ||
                           lead.assigned_to === assignedFilter;
    
    return matchesSearch && matchesStatus && matchesAssigned;
  });

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Leads Management
        </h1>
        <p style={{ color: '#6b7280' }}>
          Manage your leads and track their progress through the sales pipeline
        </p>
      </div>

      {/* Shortcuts Help */}
      <div style={{
        backgroundColor: '#e5e7eb',
        padding: '0.75rem',
        borderRadius: '0.375rem',
        marginBottom: '1rem',
        fontSize: '0.875rem'
      }}>
        <strong>Keyboard Shortcuts:</strong> 
        <span style={{ marginLeft: '1rem' }}>A - Add Lead</span>
        <span style={{ marginLeft: '1rem' }}>S - Assign Lead</span>
        <span style={{ marginLeft: '1rem' }}>N - Next Status</span>
        <span style={{ marginLeft: '1rem' }}>P - Payment</span>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="Search leads..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            flex: '1',
            minWidth: '200px'
          }}
        />
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem'
          }}
        >
          <option value="all">All Status</option>
          {Object.entries(LEAD_STATUSES).map(([key, status]) => (
            <option key={key} value={key}>{status.label}</option>
          ))}
        </select>

        <select
          value={assignedFilter}
          onChange={(e) => setAssignedFilter(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem'
          }}
        >
          <option value="all">All Assigned</option>
          <option value="unassigned">Unassigned</option>
          {SALES_TEAM.map(member => (
            <option key={member} value={member}>{member}</option>
          ))}
        </select>

        {hasPermission('leads', 'write') && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            + Add Lead
          </button>
        )}
      </div>

      {/* Leads Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading leads...</div>
        ) : filteredLeads.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem' }}>Name</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem' }}>Contact</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem' }}>Source</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem' }}>Assigned To</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem' }}>Value</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead, index) => (
                <tr 
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  style={{
                    borderTop: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    backgroundColor: selectedLead?.id === lead.id ? '#eff6ff' : 'white'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 
                    selectedLead?.id === lead.id ? '#eff6ff' : 'white'}
                >
                  <td style={{ padding: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{lead.name}</div>
                      {lead.company && (
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{lead.company}</div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.875rem' }}>
                      <div>{lead.email}</div>
                      <div style={{ color: '#6b7280' }}>{lead.phone}</div>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                    {lead.source || '-'}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      display: 'inline-block'
                    }}
                    className={LEAD_STATUSES[lead.status]?.color || 'bg-gray-100 text-gray-800'}>
                      {LEAD_STATUSES[lead.status]?.label || lead.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                    {lead.assigned_to || '-'}
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                    ₹{formatCurrency(lead.potential_value || 0)}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {hasPermission('leads', 'progress') && 
                       LEAD_STATUSES[lead.status]?.next?.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProgressLead(lead);
                          }}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            borderRadius: '0.25rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                          title="Progress to next status (N)"
                        >
                          →
                        </button>
                      )}
                      
                      {hasPermission('leads', 'assign') && !lead.assigned_to && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssignLead(lead);
                          }}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            borderRadius: '0.25rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                          title="Assign lead (S)"
                        >
                          Assign
                        </button>
                      )}
                      
                      {lead.status === 'converted' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePaymentReceived(lead);
                          }}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#8b5cf6',
                            color: 'white',
                            borderRadius: '0.25rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                          title="Record payment (P)"
                        >
                          Payment
                        </button>
                      )}
                      
                      {hasPermission('leads', 'write') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingLead(lead);
                            setShowForm(true);
                          }}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            borderRadius: '0.25rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
            No leads found
          </div>
        )}
      </div>

      {/* Lead Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <LeadForm
              lead={editingLead}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingLead(null);
              }}
              salesTeam={SALES_TEAM}
              inventory={inventory}
            />
          </div>
        </div>
      )}

      {/* Choice Modal */}
      {showChoiceModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            width: '90%',
            maxWidth: '400px'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Select Next Status
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {choiceOptions.map(option => (
                <button
                  key={option}
                  onClick={() => updateLeadStatus(currentLeadForChoice, option)}
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <span className={LEAD_STATUSES[option]?.color} style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    {LEAD_STATUSES[option]?.label}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowChoiceModal(false)}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#6b7280',
                color: 'white',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && selectedLead && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <PaymentForm
              lead={selectedLead}
              onSubmit={handlePaymentSubmit}
              onCancel={() => {
                setShowPaymentForm(false);
                setSelectedLead(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsView;
