import { BaseService } from './baseService';

class UsersService extends BaseService {
  static async getUsers() {
    return Promise.resolve([]);
  }
}

export default UsersService;
