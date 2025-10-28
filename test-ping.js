const axios = require('axios');

// Test if the server is responding
const testPing = async () => {
  try {
    console.log('Testing server connectivity');
    const response = await axios.get('http://localhost:3000/api/v1/auth/login');
    
    console.log('Server responded:', response.status);
    console.log('Response data:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('Server responded with status:', error.response.status);
      console.log('Response data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
};

testPing();