// Test script to check API connectivity
const API_URL = 'https://crm-backend-150582227311.us-central1.run.app';

async function testAPI() {
  console.log('Testing API connection to:', API_URL);
  
  try {
    const response = await fetch(`${API_URL}/api/health`);
    if (response.ok) {
      console.log('✅ API is reachable');
      const data = await response.json();
      console.log('Response:', data);
    } else {
      console.log('❌ API returned status:', response.status);
    }
  } catch (error) {
    console.log('❌ Failed to connect to API:', error.message);
  }
}

// Run this in browser console
testAPI();
