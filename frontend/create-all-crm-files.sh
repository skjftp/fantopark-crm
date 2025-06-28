#!/bin/bash

echo "Creating all CRM component files..."

# Create directories if they don't exist
mkdir -p src/config src/constants src/services src/components/forms src/components/modals

# Create API config
cat > src/config/api.js << 'EOFILE'
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://crm-backend-150582227311.us-central1.run.app',
  UPLOAD_URL: process.env.REACT_APP_UPLOAD_URL || 'https://asia-south1-enduring-wharf-464005-h7.cloudfunctions.net/getSignedUploadUrl',
  READ_URL: process.env.REACT_APP_READ_URL || 'https://asia-south1-enduring-wharf-464005-h7.cloudfunctions.net/getSignedReadUrl',
  TIMEOUT: 30000,
};
EOFILE

# Create constants
cat > src/constants/index.js << 'EOFILE'
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
EOFILE

echo "✓ Basic files created"
echo ""
echo "Next: Run './create-all-crm-files.sh part2' to create service files"

