import api from './api';

// Demo data for fallback
const demoLeads = [
  {
    id: 1,
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 9876543210',
    company: 'Tech Solutions Ltd',
    lead_for_event: 'IPL Finals 2024',
    status: 'new',
    created_date: '2024-01-15',
    source: 'Website',
    annual_income_bracket: '₹10-25 Lakhs'
  },
  {
    id: 2,
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '+91 9876543211',
    company: 'Global Enterprises',
    lead_for_event: 'ICC World Cup 2024',
    status: 'contacted',
    created_date: '2024-01-14',
    assigned_to: 'Varun',
    source: 'Referral',
    annual_income_bracket: '₹25-50 Lakhs'
  }
];

const LeadsService = {
  getLeads: async () => {
    try {
      const response = await api.get('/leads');
      return response.data || response;
    } catch (error) {
      console.error('Error fetching leads, using demo data:', error);
      return demoLeads;
    }
  },

  getLeadById: async (id) => {
    try {
      const response = await api.get(`/leads/${id}`);
      return response.data || response;
    } catch (error) {
      console.error('Error fetching lead:', error);
      return demoLeads.find(lead => lead.id === parseInt(id));
    }
  },

  createLead: async (leadData) => {
    try {
      const response = await api.post('/leads', leadData);
      return response.data || response;
    } catch (error) {
      console.error('Error creating lead, using local storage:', error);
      // Fallback to local storage
      const newLead = {
        ...leadData,
        id: Date.now(),
        created_date: new Date().toISOString().split('T')[0]
      };
      
      const existingLeads = JSON.parse(localStorage.getItem('crm_leads') || '[]');
      existingLeads.push(newLead);
      localStorage.setItem('crm_leads', JSON.stringify(existingLeads));
      
      return newLead;
    }
  },

  updateLead: async (id, leadData) => {
    try {
      const response = await api.put(`/leads/${id}`, leadData);
      return response.data || response;
    } catch (error) {
      console.error('Error updating lead, using local storage:', error);
      // Fallback to local storage
      const existingLeads = JSON.parse(localStorage.getItem('crm_leads') || '[]');
      const index = existingLeads.findIndex(lead => lead.id === parseInt(id));
      
      if (index !== -1) {
        existingLeads[index] = { ...existingLeads[index], ...leadData };
        localStorage.setItem('crm_leads', JSON.stringify(existingLeads));
        return existingLeads[index];
      }
      
      throw new Error('Lead not found');
    }
  },

  deleteLead: async (id) => {
    try {
      await api.delete(`/leads/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  }
};

export default LeadsService;
