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

export default DashboardView;
