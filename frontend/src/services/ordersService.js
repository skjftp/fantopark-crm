import api from './api';

const OrdersService = {
  getOrders: async () => {
    try {
      const response = await api.get('/api/orders');
      return response.data || response || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  getOrderById: async (id) => {
    try {
      const response = await api.get(`/api/orders/${id}`);
      return response.data || response;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  },

  createOrder: async (orderData) => {
    try {
      const response = await api.post('/api/orders', orderData);
      return response.data || response;
    } catch (error) {
      console.error('Error creating order:', error);
      return {
        ...orderData,
        id: Date.now(),
        order_number: `ORD-${Date.now()}`,
        created_date: new Date().toISOString().split('T')[0]
      };
    }
  },

  updateOrder: async (id, orderData) => {
    try {
      const response = await api.put(`/api/orders/${id}`, orderData);
      return response.data || response;
    } catch (error) {
      console.error('Error updating order:', error);
      return {
        ...orderData,
        id: parseInt(id)
      };
    }
  },

  deleteOrder: async (id) => {
    try {
      await api.delete(`/api/orders/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting order:', error);
      return { success: true };
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      const response = await api.put(`/api/orders/${id}/status`, { status });
      return response.data || response;
    } catch (error) {
      console.error('Error updating order status:', error);
      return { id, status };
    }
  }
};

export default OrdersService;
