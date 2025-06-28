import React, { useState, useEffect } from 'react';
import LeadsService from '../services/leadsService';
import { LEAD_STATUSES, formatDate } from '../constants';
import LoadingSpinner from './LoadingSpinner';

const LeadsView = ({ user, hasPermission }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    lead_for_event: '',
    number_of_people: '',
    event_start_date: '',
    event_end_date: '',
    location_preference: '',
    annual_income_bracket: '',
    source: '',
    first_touch_base_done_by: '',
    date_of_enquiry: '',
    status: 'new',
    last_quoted_price: '',
    quoted_date: '',
    follow_up_date: '',
    notes: ''
  });

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await LeadsService.getLeads();
      setLeads(data);
    } catch (error) {
      console.error('Failed to load leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      lead_for_event: '',
      number_of_people: '',
      event_start_date: '',
      event_end_date: '',
      location_preference: '',
      annual_income_bracket: '',
      source: '',
      first_touch_base_done_by: '',
      date_of_enquiry: '',
      status: 'new',
      last_quoted_price: '',
      quoted_date: '',
      follow_up_date: '',
      notes: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (showEditForm && currentLead) {
        // Update existing lead
        const updated = await LeadsService.updateLead(currentLead.id, formData);
        setLeads(prev => prev.map(lead => lead.id === currentLead.id ? updated : lead));
        alert('Lead updated successfully!');
      } else {
        // Create new lead
        const newLead = await LeadsService.createLead({
          ...formData,
          created_date: new Date().toISOString().split('T')[0]
        });
        setLeads(prev => [...prev, newLead]);
        alert('Lead added successfully!');
      }
      setShowAddForm(false);
      setShowEditForm(false);
      setCurrentLead(null);
      resetForm();
    } catch (error) {
      alert('Failed to save lead');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const openEditForm = (lead) => {
    setCurrentLead(lead);
    setFormData(lead);
    setShowEditForm(true);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.company || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderForm = () => {
    const isEdit = showEditForm && currentLead;
    
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowAddForm(false);
            setShowEditForm(false);
            setCurrentLead(null);
            resetForm();
          }
        }}
      >
        <div 
          style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            {isEdit ? `Edit Lead: ${currentLead.name}` : 'Add New Lead'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            {/* Basic Information Section */}
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#4b5563' }}>
              Basic Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Company
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>
            </div>

            {/* Event Details Section */}
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#4b5563' }}>
              Event Details
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Event Interest
                </label>
                <input
                  type="text"
                  value={formData.lead_for_event}
                  onChange={(e) => handleInputChange('lead_for_event', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                  placeholder="e.g., IPL Finals 2024"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Number of People
                </label>
                <input
                  type="number"
                  value={formData.number_of_people}
                  onChange={(e) => handleInputChange('number_of_people', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                  min="1"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Event Start Date
                </label>
                <input
                  type="date"
                  value={formData.event_start_date}
                  onChange={(e) => handleInputChange('event_start_date', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Event End Date
                </label>
                <input
                  type="date"
                  value={formData.event_end_date}
                  onChange={(e) => handleInputChange('event_end_date', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Location Preference
                </label>
                <input
                  type="text"
                  value={formData.location_preference}
                  onChange={(e) => handleInputChange('location_preference', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>
            </div>

            {/* Lead Source Section */}
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#4b5563' }}>
              Lead Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Annual Income Bracket
                </label>
                <select
                  value={formData.annual_income_bracket}
                  onChange={(e) => handleInputChange('annual_income_bracket', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                >
                  <option value="">Select Income Bracket</option>
                  <option value="< 10 Lakhs">Less than 10 Lakhs</option>
                  <option value="10-25 Lakhs">10-25 Lakhs</option>
                  <option value="25-50 Lakhs">25-50 Lakhs</option>
                  <option value="50 Lakhs - 1 Cr">50 Lakhs - 1 Cr</option>
                  <option value="> 1 Cr">More than 1 Cr</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Lead Source
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => handleInputChange('source', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                >
                  <option value="">Select Source</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Email Campaign">Email Campaign</option>
                  <option value="Phone">Phone</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  First Touch Base Done By
                </label>
                <input
                  type="text"
                  value={formData.first_touch_base_done_by}
                  onChange={(e) => handleInputChange('first_touch_base_done_by', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Date of Enquiry
                </label>
                <input
                  type="date"
                  value={formData.date_of_enquiry}
                  onChange={(e) => handleInputChange('date_of_enquiry', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>
            </div>

            {/* Status and Follow-up Section (only for edit) */}
            {isEdit && (
              <>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#4b5563' }}>
                  Status & Follow-up
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem'
                      }}
                    >
                      {Object.entries(LEAD_STATUSES).map(([key, status]) => (
                        <option key={key} value={key}>{status.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                      Last Quoted Price
                    </label>
                    <input
                      type="number"
                      value={formData.last_quoted_price}
                      onChange={(e) => handleInputChange('last_quoted_price', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                      Quoted Date
                    </label>
                    <input
                      type="date"
                      value={formData.quoted_date}
                      onChange={(e) => handleInputChange('quoted_date', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                      Follow-up Date
                    </label>
                    <input
                      type="date"
                      value={formData.follow_up_date}
                      onChange={(e) => handleInputChange('follow_up_date', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem'
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Notes Section */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  minHeight: '80px'
                }}
                rows={3}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setShowEditForm(false);
                  setCurrentLead(null);
                  resetForm();
                }}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {isEdit ? 'Update Lead' : 'Add Lead'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>Leads Management</h2>
        {hasPermission('leads', 'write') && (
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            + Add New Lead
          </button>
        )}
      </div>

      {/* Form Modal */}
      {(showAddForm || showEditForm) && renderForm()}

      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          gap: '1rem'
        }}>
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          >
            <option value="all">All Status</option>
            {Object.entries(LEAD_STATUSES).map(([key, status]) => (
              <option key={key} value={key}>{status.label}</option>
            ))}
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Name</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Contact</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Event Interest</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Assigned To</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                    No leads found. Click "+ Add New Lead" to create one.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: '500', color: '#111827' }}>{lead.name}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{lead.company}</div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.875rem' }}>
                        <div>{lead.email}</div>
                        <div style={{ color: '#6b7280' }}>{lead.phone}</div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                      {lead.lead_for_event || '-'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        borderRadius: '9999px',
                        backgroundColor: lead.status === 'new' ? '#dbeafe' :
                                        lead.status === 'contacted' ? '#fef3c7' :
                                        lead.status === 'qualified' ? '#e9d5ff' :
                                        lead.status === 'converted' ? '#d1fae5' : '#f3f4f6',
                        color: lead.status === 'new' ? '#1e40af' :
                               lead.status === 'contacted' ? '#92400e' :
                               lead.status === 'qualified' ? '#6b21a8' :
                               lead.status === 'converted' ? '#065f46' : '#374151'
                      }}>
                        {LEAD_STATUSES[lead.status]?.label || lead.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                      {lead.assigned_to || '-'}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      {formatDate(lead.created_date)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          title="View Details"
                          style={{ color: '#2563eb', cursor: 'pointer', border: 'none', background: 'none', fontSize: '1.2rem' }}
                        >
                          👁️
                        </button>
                        {hasPermission('leads', 'write') && (
                          <button
                            onClick={() => openEditForm(lead)}
                            title="Edit"
                            style={{ color: '#10b981', cursor: 'pointer', border: 'none', background: 'none', fontSize: '1.2rem' }}
                          >
                            ✏️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeadsView;
