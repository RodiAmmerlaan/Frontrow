const axios = require('axios');

// Test login with the reported email
const testLogin = async () => {
  try {
    console.log('Sending login request with email: admin@frontrow.test');
    const response = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'admin@frontrow.test',
      password: 'Admin123!' // Correct password from seed script
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('Login failed with status:', error.response.status);
      console.log('Response data:', error.response.data);
      console.log('Response headers:', error.response.headers);
    } else {
      console.log('Error:', error.message);
    }
  }
};

testLogin();