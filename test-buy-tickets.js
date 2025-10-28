const axios = require('axios');

// Test buy tickets functionality
const testBuyTickets = async () => {
  try {
    console.log('Testing buy tickets functionality');
    
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
    
    // Get user ID from profile
    const profileResponse = await axios.get('http://localhost:3000/api/v1/auth/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const userId = profileResponse.data.data.id;
    console.log('User ID:', userId);
    
    // Get events to find a valid event ID
    const eventsResponse = await axios.get('http://localhost:3000/api/v1/events');
    const events = eventsResponse.data.data.events;
    
    if (events.length === 0) {
      console.log('No events found');
      return;
    }
    
    const eventId = events[0].id;
    console.log('Event ID:', eventId);
    
    // Now test buy tickets endpoint
    const buyResponse = await axios.post('http://localhost:3000/api/v1/orders/buy-tickets', {
      event_id: eventId,
      user_id: userId,
      total_amount: 2
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Buy tickets request successful:', JSON.stringify(buyResponse.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.log('Buy tickets request failed with status:', error.response.status);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
      console.log('Response headers:', error.response.headers);
    } else {
      console.log('Error:', error.message);
    }
  }
};

testBuyTickets();