// Test script to verify API endpoints
const testAPI = async () => {
  const token = localStorage.getItem('token');
  console.log('Token:', token ? 'Found' : 'Not found');
  
  if (!token) {
    console.log('Please login first');
    return;
  }
  
  try {
    // Test return request
    const response = await fetch('http://localhost:30011/api/returns/request/test123', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reason: 'Test reason' })
    });
    
    console.log('Return API Response:', response.status);
    const data = await response.json();
    console.log('Return API Data:', data);
  } catch (error) {
    console.error('API Test Error:', error);
  }
};

// Run test
testAPI();