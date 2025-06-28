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
import { USER_ROLES } from './constants';

function App() {
 const [isLoggedIn, setIsLoggedIn] = useState(false);
 const [user, setUser] = useState(null);
 const [activeTab, setActiveTab] = useState('dashboard');
 const [loading, setLoading] = useState(true);

 const [dashboardStats, setDashboardStats] = useState({
   totalLeads: 0,
   activeDeals: 0,
   thisMonthRevenue: 0,
   pendingDeliveries: 0,
   inventoryValue: 0
 });

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

 useEffect(() => {
   if (isLoggedIn && hasPermission('dashboard', 'read')) {
     loadDashboardStats();
   }
 }, [isLoggedIn]);

 const loadDashboardStats = async () => {
   try {
     const [leads, orders, inventory] = await Promise.all([
       LeadsService.getLeads(),
       OrdersService.getOrders(),
       InventoryService.getInventory()
     ]);

     const totalLeads = leads.length;
     const activeDeals = leads.filter(lead => 
       ['contacted', 'qualified', 'hot', 'warm', 'cold', 'converted'].includes(lead.status)
     ).length;
     
     const thisMonthRevenue = orders
       .filter(order => order.status === 'completed')
       .reduce((sum, order) => sum + (order.total_amount || 0), 0);
     
     const pendingDeliveries = orders.filter(order => 
       order.status === 'service_assigned'
     ).length;
     
     const inventoryValue = inventory.reduce((sum, item) => 
       sum + ((item.selling_price || 0) * (item.available_tickets || 0)), 0);

     setDashboardStats({
       totalLeads,
       activeDeals,
       thisMonthRevenue,
       pendingDeliveries,
       inventoryValue
     });
   } catch (error) {
     console.error('Failed to load dashboard stats:', error);
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

 const renderContent = () => {
   if (!canAccessTab(activeTab)) {
     return (
       <div style={{
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center',
         height: '100%'
       }}>
         <div style={{ textAlign: 'center' }}>
           <span style={{ fontSize: '4rem', marginBottom: '1rem', display: 'block' }}>🚫</span>
           <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
             Access Denied
           </h2>
           <p style={{ color: '#6b7280' }}>You don't have permission to view this section.</p>
         </div>
       </div>
     );
   }

   switch (activeTab) {
     case 'dashboard':
       return <DashboardView stats={dashboardStats} user={user} hasPermission={hasPermission} />;
     case 'leads':
       return <LeadsView user={user} hasPermission={hasPermission} />;
     case 'inventory':
       return <InventoryView user={user} hasPermission={hasPermission} />;
      case 'orders':
        return <OrdersView user={user} hasPermission={hasPermission} />;
      case 'delivery':
        return <DeliveryView user={user} hasPermission={hasPermission} />;
      case 'finance':
        return <FinanceView user={user} hasPermission={hasPermission} />;
      default:
       return <DashboardView stats={dashboardStats} user={user} hasPermission={hasPermission} />;
   }
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
         setActiveTab={setActiveTab}
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
