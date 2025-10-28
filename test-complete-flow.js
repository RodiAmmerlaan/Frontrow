const axios = require('axios');

// Test the complete buy ticket flow
const testCompleteFlow = async () => {
  try {
    console.log('Testing complete ticket purchase flow');
    
    // 1. Login
    const loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'admin@frontrow.test',
      password: 'Admin123!'
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('1. Login successful');
    const accessToken = loginResponse.data.data.access_token;
    
    // 2. Get user profile
    const profileResponse = await axios.get('http://localhost:3000/api/v1/auth/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const userId = profileResponse.data.data.id;
    console.log('2. User profile retrieved, ID:', userId);
    
    // 3. Get events
    const eventsResponse = await axios.get('http://localhost:3000/api/v1/events');
    const events = eventsResponse.data.data.events;
    
    if (events.length === 0) {
      console.log('No events found');
      return;
    }
    
    const eventId = events[0].id;
    console.log('3. Events retrieved, using event ID:', eventId);
    
    // 4. Get specific event details
    const eventDetailsResponse = await axios.get(`http://localhost:3000/api/v1/events/${eventId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('4. Event details retrieved:', JSON.stringify(eventDetailsResponse.data.data.event, null, 2));
    
    // 5. Buy tickets
    const buyResponse = await axios.post('http://localhost:3000/api/v1/orders/buy-tickets', {
      event_id: eventId,
      user_id: userId,
      total_amount: 1
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('5. Tickets purchased successfully:', JSON.stringify(buyResponse.data, null, 2));
    
    console.log('All steps completed successfully!');
    
  } catch (error) {
    if (error.response) {
      console.log('Request failed with status:', error.response.status);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
};

testCompleteFlow();