import { BaseService } from './baseService';

class DeliveryService extends BaseService {
  static async getDeliveries(filters = {}) {
    return Promise.resolve([]);
  }
}

export default DeliveryService;
