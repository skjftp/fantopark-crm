#!/bin/bash

echo "Creating component files..."

# LoginForm Component
cat > src/components/LoginForm.js << 'EOFILE'
import React, { useState } from 'react';

const LoginForm = ({ onLogin, error: propError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(propError || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #ebf8ff, #e0e7ff)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        padding: '2rem',
        maxWidth: '28rem',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '4rem',
            height: '4rem',
            backgroundColor: '#2563eb',
            borderRadius: '50%',
            marginBottom: '1rem'
          }}>
            <span style={{ color: 'white', fontSize: '1.5rem' }}>🎫</span>
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>
            FanToPark CRM
          </h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem'
              }}
              placeholder="admin@fantopark.com"
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem'
              }}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              fontWeight: '500',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <p>Demo Credentials:</p>
          <p style={{ fontFamily: 'monospace', marginTop: '0.25rem' }}>
            admin@fantopark.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
EOFILE

# Sidebar Component
cat > src/components/Sidebar.js << 'EOFILE'
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
            return (
              <li key={item.id} style={{ marginBottom: '0.5rem' }}>
                <button
                  onClick={() => hasAccess && setActiveTab(item.id)}
                  disabled={!hasAccess}
                  style={buttonStyle(activeTab === item.id, hasAccess)}
                  onMouseEnter={(e) => {
                    if (hasAccess && activeTab !== item.id) {
                      e.currentTarget.style.backgroundColor = '#1f2937';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== item.id) {
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
EOFILE

# Header Component
cat > src/components/Header.js << 'EOFILE'
import React from 'react';
import { USER_ROLES } from '../constants';

const Header = ({ user }) => {
  return (
    <header style={{
      backgroundColor: 'white',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      borderBottom: '1px solid #e5e7eb',
      padding: '1rem 1.5rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#111827'
          }}>
            Welcome, {user?.name || 'Admin User'}
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280'
          }}>
            {USER_ROLES[user?.role]?.label} • {user?.department}
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <span style={{ fontSize: '1.125rem' }}>🔔</span>
          <div style={{
            width: '2rem',
            height: '2rem',
            backgroundColor: '#2563eb',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              {(user?.name || 'A')[0]}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
EOFILE

# LoadingSpinner Component
cat > src/components/LoadingSpinner.js << 'EOFILE'
import React from 'react';

const LoadingSpinner = ({ fullScreen = false }) => {
  const spinner = (
    <div style={{
      width: '3rem',
      height: '3rem',
      border: '3px solid #e5e7eb',
      borderTop: '3px solid #2563eb',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
  );

  const containerStyle = fullScreen ? {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6'
  } : {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem'
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={containerStyle}>
        {spinner}
      </div>
    </>
  );
};

export default LoadingSpinner;
EOFILE

# ErrorBoundary Component
cat > src/components/ErrorBoundary.js << 'EOFILE'
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f4f6'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            maxWidth: '28rem'
          }}>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#dc2626',
              marginBottom: '1rem'
            }}>
              Something went wrong
            </h1>
            <p style={{
              color: '#6b7280',
              marginBottom: '1rem'
            }}>
              An unexpected error occurred. Please refresh the page or contact support.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
EOFILE

echo "✓ Basic components created"

