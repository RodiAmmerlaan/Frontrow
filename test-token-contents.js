const axios = require('axios');
const { jwtDecode } = require('jwt-decode');

// Test to check JWT token contents
const testTokenContents = async () => {
  try {
    console.log('Testing JWT token contents');
    
    // Login to get access token
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
    
    // Decode the JWT token
    const decodedToken = jwtDecode(accessToken);
    console.log('Decoded token:', JSON.stringify(decodedToken, null, 2));
    
    // Also test with regular user
    console.log('\n--- Testing with regular user ---');
    const userLoginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'user@user.test',
      password: 'User123!'
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('User login successful');
    const userAccessToken = userLoginResponse.data.data.access_token;
    console.log('User access token:', userAccessToken);
    
    // Decode the user JWT token
    const decodedUserToken = jwtDecode(userAccessToken);
    console.log('Decoded user token:', JSON.stringify(decodedUserToken, null, 2));
    
  } catch (error) {
    if (error.response) {
      console.log('Request failed with status:', error.response.status);
      console.log('Response data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
};

testTokenContents();