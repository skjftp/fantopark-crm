import React from 'react';

const Sidebar = ({ user, activeTab, setActiveTab, canAccessTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'leads', label: 'Leads', icon: '👥' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'orders', label: 'Orders', icon: '📋' },
    { id: 'delivery', label: 'Delivery', icon: '🚚' },
    { id: 'finance', label: 'Finance', icon: '💰' },
  ];

  const handleMenuClick = (tabId) => {
    console.log('Menu clicked:', tabId);
    console.log('Can access?', canAccessTab(tabId));
    if (canAccessTab(tabId)) {
      console.log('Setting active tab to:', tabId);
      setActiveTab(tabId);
    }
  };

  const buttonStyle = (isActive, hasAccess) => ({
    width: '100%',
    textAlign: 'left',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: 'none',
    backgroundColor: isActive ? '#2563eb' : 'transparent',
    color: isActive ? 'white' : (hasAccess ? '#d1d5db' : '#6b7280'),
    cursor: hasAccess ? 'pointer' : 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.2s'
  });

  return (
    <div style={{
      backgroundColor: '#111827',
      color: 'white',
      width: '16rem',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh'
    }}>
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid #374151'
      }}>
        <h1 style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{ marginRight: '0.5rem' }}>🎫</span> FanToPark CRM
        </h1>
      </div>

      <nav style={{ flex: 1, padding: '1rem' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {menuItems.map((item) => {
            const hasAccess = canAccessTab(item.id);
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id} style={{ marginBottom: '0.5rem' }}>
                <button
                  onClick={() => handleMenuClick(item.id)}
                  disabled={!hasAccess}
                  style={buttonStyle(isActive, hasAccess)}
                  onMouseEnter={(e) => {
                    if (hasAccess && !isActive) {
                      e.currentTarget.style.backgroundColor = '#1f2937';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span style={{ marginRight: '0.75rem' }}>{item.icon}</span>
                  {item.label}
                  {!hasAccess && <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>🔒</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Debug info */}
      <div style={{
        padding: '0.5rem',
        fontSize: '0.75rem',
        borderTop: '1px solid #374151',
        color: '#9ca3af'
      }}>
        <div>Active: {activeTab}</div>
        <div>User: {user?.name}</div>
        <div>Role: {user?.role}</div>
      </div>

      <div style={{
        padding: '1rem',
        borderTop: '1px solid #374151'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Signed in as</p>
          <p style={{ fontWeight: '500' }}>{user?.name || 'User'}</p>
        </div>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
