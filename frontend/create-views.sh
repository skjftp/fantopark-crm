#!/bin/bash

echo "Creating view components..."

# DashboardView Component
cat > src/components/DashboardView.js << 'EOFILE'
import React from 'react';
import { formatCurrency } from '../constants';

const DashboardView = ({ stats, user, hasPermission }) => {
  const cardStyle = {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  };

  const DashboardCard = ({ title, value, icon, color }) => (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>{title}</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '0.25rem' }}>
            {value}
          </p>
        </div>
        <div style={{
          padding: '0.75rem',
          borderRadius: '50%',
          backgroundColor: color === 'blue' ? '#dbeafe' : 
                          color === 'green' ? '#d1fae5' :
                          color === 'purple' ? '#e9d5ff' :
                          color === 'orange' ? '#fed7aa' : '#e0e7ff',
          color: color === 'blue' ? '#2563eb' :
                 color === 'green' ? '#10b981' :
                 color === 'purple' ? '#8b5cf6' :
                 color === 'orange' ? '#f97316' : '#6366f1'
        }}>
          <span style={{ fontSize: '1.5rem' }}>{icon}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>Dashboard Overview</h2>
        {hasPermission('leads', 'write') && (
          <button style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer'
          }}>
            + Quick Add Lead
          </button>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem'
      }}>
        <DashboardCard
          title="Total Leads"
          value={stats.totalLeads}
          icon="👥"
          color="blue"
        />
        
        <DashboardCard
          title="Active Deals"
          value={stats.activeDeals}
          icon="🤝"
          color="green"
        />
        
        {hasPermission('finance', 'read') && (
          <DashboardCard
            title="This Month Revenue"
            value={`₹${formatCurrency(stats.thisMonthRevenue)}`}
            icon="💰"
            color="purple"
          />
        )}
        
        <DashboardCard
          title="Pending Deliveries"
          value={stats.pendingDeliveries}
          icon="📦"
          color="orange"
        />
        
        {hasPermission('inventory', 'read') && (
          <DashboardCard
            title="Inventory Value"
            value={`₹${formatCurrency(stats.inventoryValue)}`}
            icon="🏷️"
            color="indigo"
          />
        )}
      </div>

      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div style={cardStyle}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { label: 'Add New Lead', icon: '➕', permission: ['leads', 'write'] },
              { label: 'Create Order', icon: '📋', permission: ['orders', 'write'] },
              { label: 'Add Inventory', icon: '📦', permission: ['inventory', 'write'] },
              { label: 'View Reports', icon: '📊', permission: ['finance', 'read'] }
            ].map((action, index) => {
              const canPerform = hasPermission(action.permission[0], action.permission[1]);
              return (
                <button
                  key={index}
                  disabled={!canPerform}
                  style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    backgroundColor: 'white',
                    cursor: canPerform ? 'pointer' : 'not-allowed',
                    opacity: canPerform ? 1 : 0.5
                  }}
                >
                  <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>
                    {action.icon}
                  </span>
                  <span style={{ fontSize: '0.875rem' }}>{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { type: 'lead', message: 'New lead added: John Doe', time: '2 hours ago', icon: '👤' },
              { type: 'order', message: 'Order #1234 approved', time: '3 hours ago', icon: '✅' },
              { type: 'delivery', message: 'Delivery scheduled for Order #1233', time: '5 hours ago', icon: '🚚' },
              { type: 'inventory', message: 'IPL Finals tickets added', time: '1 day ago', icon: '🎫' }
            ].map((activity, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem' }}>{activity.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.875rem', color: '#111827' }}>{activity.message}</p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for formatting currency
export const formatCurrency = (amount) => {
  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export default DashboardView;
EOFILE

# Update constants to include formatCurrency
cat >> src/constants/index.js << 'EOFILE'

export const ORDER_STATUSES = {
  pending_approval: { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' }
};

export const formatCurrency = (amount) => {
  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN');
};
EOFILE

# LeadsView Component
cat > src/components/LeadsView.js << 'EOFILE'
import React, { useState, useEffect } from 'react';
import LeadsService from '../services/leadsService';
import { LEAD_STATUSES, formatDate } from '../constants';
import LoadingSpinner from './LoadingSpinner';

const LeadsView = ({ user, hasPermission }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>Leads Management</h2>
        {hasPermission('leads', 'write') && (
          <button style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer'
          }}>
            + Add New Lead
          </button>
        )}
      </div>

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
              {filteredLeads.map((lead) => (
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
                      {LEAD_STATUSES[lead.status]?.label}
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
                        style={{ color: '#2563eb', cursor: 'pointer', border: 'none', background: 'none' }}
                        title="View Details"
                      >
                        👁️
                      </button>
                      {hasPermission('leads', 'write') && (
                        <>
                          <button
                            style={{ color: '#10b981', cursor: 'pointer', border: 'none', background: 'none' }}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          {!lead.assigned_to && hasPermission('leads', 'assign') && (
                            <button
                              style={{ color: '#8b5cf6', cursor: 'pointer', border: 'none', background: 'none' }}
                              title="Assign"
                            >
                              👤
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeadsView;
EOFILE

# Create placeholder components for other views
for view in InventoryView OrdersView DeliveryView FinanceView; do
cat > src/components/${view}.js << EOFILE
import React from 'react';

const ${view} = ({ user, hasPermission }) => {
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>
        ${view/View/ Management}
      </h2>
      <div style={{
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
          ${view/View/ } module coming soon...
        </p>
      </div>
    </div>
  );
};

export default ${view};
EOFILE
done

echo "✓ All view components created"

