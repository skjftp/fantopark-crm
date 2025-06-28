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
