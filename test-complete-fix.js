/**
 * Complete Fix Verification Test
 * Tests the entire API after fixes
 */

require('dotenv').config();

async function testCompleteAPI() {
  console.log(' Testing Complete API Fix...\n');
  
  const BASE_URL = `http://localhost:${process.env.PORT || 5000}`;
  
  // Test 1: Health Check
  console.log('1️ Testing Health Check...');
  try {
    const response = await fetch(`${BASE_URL}/`);
    const data = await response.json();
    console.log(' Health check passed');
    console.log('   Status:', response.status);
    console.log('   Message:', data.message);
  } catch (error) {
    console.error(' Health check failed:', error.message);
    console.log(' Make sure server is running: npm run dev');
    return;
  }
  
  // Test 2: Meal Analysis API
  console.log('\n2️ Testing Meal Analysis API...');
  try {
    const response = await fetch(`${BASE_URL}/api/analyze-meal-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        meal_text: '2 roti, rice, dal, curd'
      })
    });
    
    console.log('   Response status:', response.status);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(' Meal analysis API working!');
      console.log('  Success:', data.success);
      console.log('   Detected foods:', data.data?.detected_food_items);
      console.log('   Calories:', data.data?.calories);
      console.log('   Protein:', data.data?.protein_g + 'g');
    } else {
      console.error(' Meal analysis failed');
      console.error('   Error:', data.error);
      console.error('   Details:', data.details);
    }
    
  } catch (error) {
    console.error(' API request failed:', error.message);
  }
  
  console.log('\n Test complete!');
}

// Add a small delay to ensure server is ready
setTimeout(testCompleteAPI, 2000);