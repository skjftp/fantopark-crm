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
