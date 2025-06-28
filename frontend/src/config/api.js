export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://crm-backend-150582227311.us-central1.run.app',
  UPLOAD_URL: process.env.REACT_APP_UPLOAD_URL || 'https://asia-south1-enduring-wharf-464005-h7.cloudfunctions.net/getSignedUploadUrl',
  READ_URL: process.env.REACT_APP_READ_URL || 'https://asia-south1-enduring-wharf-464005-h7.cloudfunctions.net/getSignedReadUrl',
  TIMEOUT: 30000,
};
