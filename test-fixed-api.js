/**
 * Test the fixed API endpoint
 */

async function testFixedAPI() {
  try {
    console.log(' Testing fixed API endpoint...');
    
    const response = await fetch('http://localhost:5000/api/analyze-meal-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        meal_text: '2 roti, rice, dal, curd'
      })
    });
    
    console.log(' Response status:', response.status);
    console.log(' Response status text:', response.statusText);
    
    const data = await response.json();
    console.log(' Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log(' API test successful! The 500 error is fixed.');
    } else {
      console.log(' API test failed');
    }
    
  } catch (error) {
    console.error(' Test failed:', error.message);
  }
}

testFixedAPI();