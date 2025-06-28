import api from './api';

const AuthService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.token) {
        localStorage.setItem('crm_token', response.token);
        localStorage.setItem('crm_user', JSON.stringify(response.user));
      }
      
      return {
        success: true,
        user: response.user,
        token: response.token
      };
    } catch (error) {
      console.error('Login error:', error);
      // Fallback to demo mode if API fails
      if (email === 'admin@fantopark.com' && password === 'admin123') {
        const demoUser = {
          id: 1,
          email: 'admin@fantopark.com',
          name: 'Admin User',
          role: 'super_admin'
        };
        const demoToken = 'demo-token-' + Date.now();
        
        localStorage.setItem('crm_token', demoToken);
        localStorage.setItem('crm_user', JSON.stringify(demoUser));
        
        return {
          success: true,
          user: demoUser,
          token: demoToken
        };
      }
      
      return {
        success: false,
        message: 'Invalid credentials'
      };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_user');
    }
  },

  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.user;
    } catch (error) {
      console.error('Token verification error:', error);
      // Check for demo token
      const token = localStorage.getItem('crm_token');
      const user = localStorage.getItem('crm_user');
      
      if (token && token.startsWith('demo-token-') && user) {
        return JSON.parse(user);
      }
      
      return null;
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('crm_user');
    return user ? JSON.parse(user) : null;
  }
};

export default AuthService;
