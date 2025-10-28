const axios = require('axios');

// Test profile endpoint functionality
const testProfile = async () => {
  try {
    console.log('Testing profile endpoint functionality');
    
    // First, login to get access token
    const loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'admin@frontrow.test',
      password: 'Admin123!'
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful');
    const accessToken = loginResponse.data.data.access_token;
    console.log('Access token:', accessToken);
    
    // Now test profile endpoint
    const profileResponse = await axios.get('http://localhost:3000/api/v1/auth/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Profile request successful:', profileResponse.data);
  } catch (error) {
    if (error.response) {
      console.log('Profile request failed with status:', error.response.status);
      console.log('Response data:', error.response.data);
      console.log('Response headers:', error.response.headers);
    } else {
      console.log('Error:', error.message);
    }
  }
};

testProfile();