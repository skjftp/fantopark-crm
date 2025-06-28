import './App.css';
import React, { useState, useEffect } from 'react';
import AuthService from './services/authService';
import LeadsService from './services/leadsService';
import InventoryService from './services/inventoryService';
import OrdersService from './services/ordersService';
import DashboardView from './components/DashboardView';
import LeadsView from './components/LeadsView';
import OrdersView from './components/OrdersView';
import DeliveryView from './components/DeliveryView';
import FinanceView from './components/FinanceView';
import InventoryView from './components/InventoryView';
import LoginForm from './components/LoginForm';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import UserManagement from './components/UserManagement';
import GSTInvoice from './components/GSTInvoice';
import FileUploadService from './services/fileUploadService';
import { USER_ROLES } from './constants';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [showGSTInvoice, setShowGSTInvoice] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  
  const [dashboardStats, setDashboardStats] = useState({
    totalLeads: 0,
    activeDeals: 0,
    thisMonthRevenue: 0,
    pendingDeliveries: 0,
    inventoryValue: 0,
    totalReceivables: 0,
    overdueReceivables: 0
  });

  const hasPermission = (module, action) => {
    if (!user || !user.role) return false;
    
    const userRole = USER_ROLES[user.role];
    if (!userRole) return false;
    
    const modulePermissions = userRole.permissions[module];
    if (!modulePermissions) return false;
    
    return modulePermissions[action] === true;
  };

  const canAccessTab = (tabId) => {
    if (!user || !user.role) return false;
    return hasPermission(tabId, 'read');
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const userData = await AuthService.getCurrentUser();
        setUser(userData);
        setIsLoggedIn(true);
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [leadsCount, ordersData] = await Promise.all([
        LeadsService.getLeads(),
        OrdersService.getOrders()
      ]);

      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      const thisMonthOrders = ordersData.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === thisMonth && orderDate.getFullYear() === thisYear;
      });

      const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => 
        sum + (order.total_amount || 0), 0
      );

      const pendingDeliveries = ordersData.filter(order => 
        order.status === 'approved' && !order.delivery_status
      ).length;

      // Calculate receivables
      const pendingPayments = ordersData.filter(order => 
        order.payment_status === 'pending' || order.payment_status === 'partial'
      );

      const totalReceivables = pendingPayments.reduce((sum, order) => 
        sum + ((order.total_amount || 0) - (order.amount_paid || 0)), 0
      );

      const overdueReceivables = pendingPayments.filter(order => {
        if (!order.payment_due_date) return false;
        const dueDate = new Date(order.payment_due_date);
        return dueDate < now;
      }).reduce((sum, order) => 
        sum + ((order.total_amount || 0) - (order.amount_paid || 0)), 0
      );

      setDashboardStats({
        totalLeads: leadsCount.length,
        activeDeals: leadsCount.filter(lead => ['contacted', 'qualified'].includes(lead.status)).length,
        thisMonthRevenue,
        pendingDeliveries,
        inventoryValue: 0,
        totalReceivables,
        overdueReceivables
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await AuthService.login(email, password);
      setUser(response.user);
      setIsLoggedIn(true);
      await loadDashboardData();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsLoggedIn(false);
      setActiveTab('dashboard');
      localStorage.removeItem('authToken');
    }
  };

  const showInvoice = (order, invoice) => {
    setCurrentOrder(order);
    setCurrentInvoice(invoice);
    setShowGSTInvoice(true);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const uploadFile = async (file, documentType) => {
    try {
      const result = await FileUploadService.uploadFile(file, documentType);
      return result;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  };

  const getFileUrl = async (filePath) => {
    try {
      const url = await FileUploadService.getFileViewUrl(filePath);
      return url;
    } catch (error) {
      console.error('Error getting file URL:', error);
      return null;
    }
  };

  const renderContent = () => {
    if (!canAccessTab(activeTab)) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#9ca3af'
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔒</p>
            <p>You don't have permission to access this section.</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardView 
          stats={dashboardStats} 
          user={user} 
          hasPermission={hasPermission}
          onRefresh={loadDashboardData}
        />;
      
      case 'leads':
        return <LeadsView 
          user={user} 
          hasPermission={hasPermission}
          uploadFile={uploadFile}
          getFileUrl={getFileUrl}
        />;
      
      case 'inventory':
        return <InventoryView 
          user={user} 
          hasPermission={hasPermission} 
        />;
      
      case 'orders':
        return <OrdersView 
          user={user} 
          hasPermission={hasPermission}
          showInvoice={showInvoice}
          uploadFile={uploadFile}
          getFileUrl={getFileUrl}
        />;
      
      case 'delivery':
        return <DeliveryView 
          user={user} 
          hasPermission={hasPermission} 
        />;
      
      case 'finance':
        return <FinanceView 
          user={user} 
          hasPermission={hasPermission}
          showInvoice={showInvoice}
        />;
      
      case 'users':
        return <UserManagement 
          onClose={() => setActiveTab('dashboard')} 
        />;
      
      default:
        return <DashboardView 
          stats={dashboardStats} 
          user={user} 
          hasPermission={hasPermission}
          onRefresh={loadDashboardData}
        />;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <ErrorBoundary>
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6' }}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          user={user}
          canAccessTab={canAccessTab}
          hasPermission={hasPermission}
          onLogout={handleLogout}
        />
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Header user={user} />
          
          <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
            {renderContent()}
          </main>
        </div>
      </div>

      {/* GST Invoice Modal */}
      {showGSTInvoice && currentOrder && currentInvoice && (
        <GSTInvoice
          order={currentOrder}
          invoice={currentInvoice}
          onClose={() => {
            setShowGSTInvoice(false);
            setCurrentOrder(null);
            setCurrentInvoice(null);
          }}
          onPrint={handlePrintInvoice}
        />
      )}
    </ErrorBoundary>
  );
}

export default App;
