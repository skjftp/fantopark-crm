// User Roles with permissions
export const USER_ROLES = {
  super_admin: {
    label: 'Super Admin',
    permissions: {
      dashboard: { read: true, write: true },
      leads: { read: true, write: true, delete: true, assign: true },
      inventory: { read: true, write: true, delete: true, allocate: true },
      orders: { read: true, write: true, delete: true, approve: true },
      delivery: { read: true, write: true, delete: true },
      finance: { read: true, write: true, delete: true, approve: true },
      users: { read: true, write: true, delete: true }
    }
  },
  admin: {
    label: 'Administrator',
    permissions: {
      dashboard: { read: true, write: true },
      leads: { read: true, write: true, delete: false, assign: true },
      inventory: { read: true, write: true, delete: false, allocate: true },
      orders: { read: true, write: true, delete: false, approve: false },
      delivery: { read: true, write: true, delete: false },
      finance: { read: true, write: false, delete: false, approve: false },
      users: { read: true, write: true, delete: false }
    }
  },
  sales_manager: {
    label: 'Sales Manager',
    permissions: {
      dashboard: { read: true, write: false },
      leads: { read: true, write: true, delete: false, assign: true },
      inventory: { read: true, write: false, delete: false, allocate: false },
      orders: { read: true, write: true, delete: false, approve: false },
      delivery: { read: true, write: false, delete: false },
      finance: { read: false, write: false, delete: false, approve: false },
      users: { read: false, write: false, delete: false }
    }
  },
  sales_executive: {
    label: 'Sales Executive',
    permissions: {
      dashboard: { read: true, write: false },
      leads: { read: true, write: true, delete: false, assign: false },
      inventory: { read: true, write: false, delete: false, allocate: false },
      orders: { read: true, write: false, delete: false, approve: false },
      delivery: { read: false, write: false, delete: false },
      finance: { read: false, write: false, delete: false, approve: false },
      users: { read: false, write: false, delete: false }
    }
  },
  viewer: {
    label: 'Viewer',
    permissions: {
      dashboard: { read: true, write: false },
      leads: { read: true, write: false, delete: false, assign: false },
      inventory: { read: true, write: false, delete: false, allocate: false },
      orders: { read: true, write: false, delete: false, approve: false },
      delivery: { read: true, write: false, delete: false },
      finance: { read: false, write: false, delete: false, approve: false },
      users: { read: false, write: false, delete: false }
    }
  }
};

export const LEAD_STATUSES = {
  new: { label: 'New Lead', color: 'bg-blue-100 text-blue-800', next: ['contacted'] },
  contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-800', next: ['qualified'] },
  qualified: { label: 'Qualified', color: 'bg-purple-100 text-purple-800', next: ['converted'] },
  converted: { label: 'Converted', color: 'bg-green-100 text-green-800', next: [] }
};

export const SALES_TEAM = ['Varun', 'Pratik', 'Manmeet', 'Ankita'];

export const ORDER_STATUSES = {
  pending_approval: { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' }
};

export const formatCurrency = (amount) => {
  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN');
};
