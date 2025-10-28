const axios = require('axios');

// Test the validation route
const testValidation = async () => {
  try {
    console.log('Testing validation route with email: admin@frontrow.test');
    const response = await axios.post('http://localhost:3000/test-validation', {
      email: 'admin@frontrow.test',
      password: 'testpassword'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Validation successful:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('Validation failed with status:', error.response.status);
      console.log('Response data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
};

testValidation();