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

// Company details for invoices
export const COMPANY_DETAILS = {
    name: 'Fantopark Travel Private Limited',
    address: 'Sector 44, Gurgaon, Haryana, India',
    email: 'info@fantopark.com',
    phone: '+91 9876543210',
    cin: 'U12345HR2024PTC123456',
    gstin: '06AABCS1234L1ZE',
    pan: 'AABCS1234L',
    hsn: '998555',
    category: 'Travel Services',
    bankDetails: {
        bankName: 'HDFC Bank',
        accountName: 'Fantopark Travel Private Limited',
        accountNumber: '50200012345678',
        ifsc: 'HDFC0001234',
        branch: 'Gurgaon Sector 44'
    }
};

// GST Configuration
export const GST_CONFIG = {
    defaultRate: 18,
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
    companyState: 'Haryana'
};

// Calculate GST
export const calculateGST = (amount, isIntraState, gstRate = GST_CONFIG.defaultRate) => {
    if (isIntraState) {
        // Haryana (intra-state): CGST + SGST
        const cgst = (amount * (gstRate / 2)) / 100;
        const sgst = (amount * (gstRate / 2)) / 100;
        return { cgst, sgst, igst: 0, total: cgst + sgst };
    } else {
        // Inter-state: IGST
        const igst = (amount * gstRate) / 100;
        return { cgst: 0, sgst: 0, igst, total: igst };
    }
};

// Indian states
export const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
    'Lakshadweep', 'Puducherry'
];

// Lead sources
export const LEAD_SOURCES = [
    'Facebook',
    'Instagram', 
    'LinkedIn',
    'Friends and Family',
    'Through Champion',
    'Google Ads',
    'Website',
    'Phone Inquiry',
    'Walk-in',
    'Referral',
    'Exhibition',
    'Email Campaign',
    'Other'
];

// Payment methods
export const PAYMENT_METHODS = [
    'Cash',
    'Bank Transfer',
    'UPI',
    'Credit Card',
    'Debit Card',
    'Cheque',
    'Online Payment'
];

// Supply team
export const SUPPLY_TEAM = ['Akshay', 'Shafeeq', 'Ankit'];

// Finance team
export const FINANCE_TEAM = ['Finance Manager', 'Accounts Head'];

// Delivery statuses
export const DELIVERY_STATUSES = {
    scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
    in_transit: { label: 'In Transit', color: 'bg-yellow-100 text-yellow-800' },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
    failed: { label: 'Failed', color: 'bg-red-100 text-red-800' }
};

// Format date time
export const formatDateTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const LEAD_STATUSES = {
  unassigned: { 
    label: 'Unassigned', 
    color: 'bg-gray-100 text-gray-800', 
    next: ['assigned'] 
  },
  assigned: { 
    label: 'Assigned', 
    color: 'bg-blue-100 text-blue-800', 
    next: ['contacted'] 
  },
  contacted: { 
    label: 'Contacted', 
    color: 'bg-yellow-100 text-yellow-800', 
    next: ['junk', 'qualified'] 
  },
  junk: { 
    label: 'Junk', 
    color: 'bg-red-100 text-red-800', 
    next: [] 
  },
  qualified: { 
    label: 'Qualified', 
    color: 'bg-green-100 text-green-800', 
    next: ['hot', 'warm', 'cold'] 
  },
  hot: { 
    label: 'Hot', 
    color: 'bg-red-500 text-white', 
    next: ['converted', 'dropped'] 
  },
  warm: { 
    label: 'Warm', 
    color: 'bg-orange-100 text-orange-800', 
    next: ['converted', 'dropped'] 
  },
  cold: { 
    label: 'Cold', 
    color: 'bg-blue-200 text-blue-900', 
    next: ['converted', 'dropped'] 
  },
  converted: { 
    label: 'Converted', 
    color: 'bg-green-500 text-white', 
    next: ['payment_received', 'post_service_payment'] 
  },
  dropped: { 
    label: 'Dropped', 
    color: 'bg-gray-500 text-white', 
    next: [] 
  },
  payment_received: { 
    label: 'Payment Received', 
    color: 'bg-green-600 text-white', 
    next: ['service'] 
  },
  post_service_payment: { 
    label: 'Post Service Payment', 
    color: 'bg-purple-100 text-purple-800', 
    next: ['service'] 
  },
  service: { 
    label: 'Service', 
    color: 'bg-indigo-100 text-indigo-800', 
    next: ['delivery'] 
  },
  delivery: { 
    label: 'Delivery', 
    color: 'bg-teal-100 text-teal-800', 
    next: ['completed'] 
  },
  completed: { 
    label: 'Completed', 
    color: 'bg-gray-600 text-white', 
    next: [] 
  }
};
