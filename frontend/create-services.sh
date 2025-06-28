#!/bin/bash

echo "Creating service files..."

# Base Service
cat > src/services/baseService.js << 'EOFILE'
import { API_CONFIG } from '../config/api';

export class BaseService {
  static async request(endpoint, options = {}) {
    const token = localStorage.getItem('crm_token');
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('crm_token');
          window.location.href = '/login';
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  static async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  static async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}
EOFILE

# Auth Service
cat > src/services/authService.js << 'EOFILE'
import { BaseService } from './baseService';

class AuthService extends BaseService {
  static async login(email, password) {
    try {
      // For demo purposes, simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          if (email === 'admin@fantopark.com' && password === 'admin123') {
            const user = {
              id: 1,
              name: 'Admin User',
              email: 'admin@fantopark.com',
              role: 'super_admin',
              department: 'Administration'
            };
            resolve({
              success: true,
              user,
              token: 'demo-jwt-token'
            });
          } else {
            resolve({
              success: false,
              message: 'Invalid credentials'
            });
          }
        }, 1000);
      });
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed'
      };
    }
  }

  static async logout() {
    return Promise.resolve();
  }

  static async verifyToken() {
    // For demo, return null (not authenticated)
    return null;
  }
}

export default AuthService;
EOFILE

# Leads Service
cat > src/services/leadsService.js << 'EOFILE'
import { BaseService } from './baseService';

class LeadsService extends BaseService {
  static async getLeads(filters = {}) {
    // Demo data
    return Promise.resolve([
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+91 9876543210',
        company: 'ABC Corp',
        status: 'new',
        lead_for_event: 'IPL Finals 2024',
        created_date: '2024-01-15'
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+91 9876543211',
        company: 'XYZ Ltd',
        status: 'contacted',
        lead_for_event: 'ICC World Cup 2024',
        assigned_to: 'Varun',
        created_date: '2024-01-14'
      }
    ]);
  }

  static async getLead(id) {
    const leads = await this.getLeads();
    return leads.find(lead => lead.id === id);
  }

  static async createLead(leadData) {
    return Promise.resolve({ id: Date.now(), ...leadData });
  }

  static async updateLead(id, leadData) {
    return Promise.resolve({ id, ...leadData });
  }

  static async deleteLead(id) {
    return Promise.resolve({ success: true });
  }
}

export default LeadsService;
EOFILE

# Inventory Service
cat > src/services/inventoryService.js << 'EOFILE'
import { BaseService } from './baseService';

class InventoryService extends BaseService {
  static async getInventory(filters = {}) {
    // Demo data
    return Promise.resolve([
      {
        id: 1,
        event_name: 'IPL Finals 2024',
        event_date: '2024-05-26',
        venue: 'Narendra Modi Stadium, Ahmedabad',
        category: 'Cricket',
        total_tickets: 500,
        available_tickets: 150,
        cost_per_ticket: 3000,
        selling_price: 4500,
        status: 'active'
      },
      {
        id: 2,
        event_name: 'Ed Sheeran Concert',
        event_date: '2024-03-16',
        venue: 'JLN Stadium, Delhi',
        category: 'Concert',
        total_tickets: 1000,
        available_tickets: 0,
        cost_per_ticket: 2500,
        selling_price: 3500,
        status: 'sold_out'
      }
    ]);
  }

  static async createInventoryItem(data) {
    return Promise.resolve({ id: Date.now(), ...data });
  }

  static async updateInventoryItem(id, data) {
    return Promise.resolve({ id, ...data });
  }
}

export default InventoryService;
EOFILE

# Orders Service
cat > src/services/ordersService.js << 'EOFILE'
import { BaseService } from './baseService';

class OrdersService extends BaseService {
  static async getOrders(filters = {}) {
    return Promise.resolve([
      {
        id: 1,
        order_number: 'ORD-2024-001',
        client_name: 'John Doe',
        client_email: 'john@example.com',
        type_of_sale: 'Tour',
        payment_type: 'advance',
        final_amount: 45000,
        advance_amount: 15000,
        status: 'pending_approval',
        created_date: '2024-01-15'
      }
    ]);
  }

  static async createOrder(orderData) {
    return Promise.resolve({ id: Date.now(), ...orderData });
  }

  static async approveOrder(id) {
    return Promise.resolve({ success: true });
  }

  static async rejectOrder(id, notes) {
    return Promise.resolve({ success: true });
  }
}

export default OrdersService;
EOFILE

# Other services
cat > src/services/invoiceService.js << 'EOFILE'
import { BaseService } from './baseService';

class InvoiceService extends BaseService {
  static async getInvoices(filters = {}) {
    return Promise.resolve([]);
  }

  static async getInvoice(id) {
    return Promise.resolve({
      id,
      invoice_number: 'INV-2024-001',
      client_name: 'John Doe',
      final_amount: 45000,
      invoice_date: '2024-01-15'
    });
  }
}

export default InvoiceService;
EOFILE

cat > src/services/deliveryService.js << 'EOFILE'
import { BaseService } from './baseService';

class DeliveryService extends BaseService {
  static async getDeliveries(filters = {}) {
    return Promise.resolve([]);
  }
}

export default DeliveryService;
EOFILE

cat > src/services/usersService.js << 'EOFILE'
import { BaseService } from './baseService';

class UsersService extends BaseService {
  static async getUsers() {
    return Promise.resolve([]);
  }
}

export default UsersService;
EOFILE

cat > src/services/fileUploadService.js << 'EOFILE'
import { API_CONFIG } from '../config/api';

class FileUploadService {
  static async uploadFile(file, documentType) {
    // Demo implementation
    return Promise.resolve({
      success: true,
      filePath: 'demo/path/' + file.name,
      publicUrl: 'https://example.com/demo/' + file.name
    });
  }
}

export default FileUploadService;
EOFILE

echo "✓ All service files created"

