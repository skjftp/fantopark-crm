import React, { useState, useEffect } from 'react';
import AuthService from './services/authService';
import { USER_ROLES } from './constants';
import LoginForm from './components/LoginForm';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  const hasPermission = (module, action) => {
    if (!user || !user.role) return false;
    
    const userRole = USER_ROLES[user.role];
    if (!userRole) return false;
    
    const modulePermissions = userRole.permissions[module];
    if (!modulePermissions) return false;
    
    return modulePermissions[action] === true;
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('crm_token');
      if (token) {
        const userData = await AuthService.verifyToken();
        if (userData) {
          setUser(userData);
          setIsLoggedIn(true);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const canAccessTab = (tabId) => {
    if (!user) return false;
    return hasPermission(tabId, 'read');
  };

  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      const response = await AuthService.login(email, password);
      
      if (response.success) {
        setUser(response.user);
        setIsLoggedIn(true);
        localStorage.setItem('crm_token', response.token);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggedIn(false);
      setUser(null);
      setActiveTab('dashboard');
      localStorage.removeItem('crm_token');
    }
  };

  const handleTabChange = (newTab) => {
    console.log('Tab change requested:', newTab);
    console.log('Current tab:', activeTab);
    setActiveTab(newTab);
  };

  const renderContent = () => {
    console.log('Rendering content for tab:', activeTab);
    
    return (
      <div>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          Current Tab: {activeTab}
        </h2>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <p>This is the {activeTab} page</p>
          <p>User: {user?.name}</p>
          <p>Role: {user?.role}</p>
          <div style={{ marginTop: '1rem' }}>
            <button 
              onClick={() => handleTabChange('dashboard')}
              style={{ marginRight: '1rem', padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
            >
              Go to Dashboard
            </button>
            <button 
              onClick={() => handleTabChange('leads')}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
            >
              Go to Leads
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <ErrorBoundary>
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6' }}>
        <Sidebar 
          user={user}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          canAccessTab={canAccessTab}
          onLogout={handleLogout}
        />
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Header user={user} />
          
          <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
            {renderContent()}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
