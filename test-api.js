/**
 * API Diagnostic Test Script
 * Run this to test your API configuration and identify issues
 */

require('dotenv').config();
const axios = require('axios');

const BASE_URL = `http://localhost:${process.env.PORT || 5000}`;

async function runDiagnostics() {
  console.log('🔍 Running API Diagnostics...\n');
  
  // Test 1: Check environment variables
  console.log('1 Checking Environment Variables...');
  if (!process.env.GEMINI_API_KEY) {
    console.error('   GEMINI_API_KEY is missing in .env file');
  } else {
    const keyLength = process.env.GEMINI_API_KEY.length;
    const keyPrefix = process.env.GEMINI_API_KEY.substring(0, 8);
    console.log(`   GEMINI_API_KEY found (length: ${keyLength}, starts with: ${keyPrefix}...)`);
    
    if (keyLength < 20) {
      console.warn('    API key seems too short. Double-check your Gemini API key.');
    }
  }
  console.log(`   PORT: ${process.env.PORT || 5000}\n`);

  // Test 2: Check if server is running
  console.log('2️ Checking Server Status...');
  try {
    const healthResponse = await axios.get(`${BASE_URL}/`);
    console.log('    Server is running');
    console.log(`    Health check response: ${JSON.stringify(healthResponse.data)}\n`);
  } catch (error) {
    console.error('    Server is NOT running or not accessible');
    console.error(`   Error: ${error.message}\n`);
    console.log('    Solution: Run "npm run dev" to start the server\n');
    return;
  }

  // Test 3: Test with correct field name
  console.log('3️ Testing API with CORRECT field name (meal_text)...');
  try {
    const response = await axios.post(`${BASE_URL}/api/analyze-meal-text`, {
      meal_text: "apple"
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });
    
    console.log('    Request successful!');
    console.log(`    Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error(`   Request failed with status ${error.response.status}`);
      console.error(`   Error:`, error.response.data);
    } else {
      console.error(`   Request failed: ${error.message}`);
    }
  }
  console.log('');

  // Test 4: Test with alternative field name
  console.log('4️ Testing API with ALTERNATIVE field name (meal-text)...');
  try {
    const response = await axios.post(`${BASE_URL}/api/analyze-meal-text`, {
      'meal-text': "apple"
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });
    
    console.log('    Request successful!');
    console.log(`    Status: ${response.status}`);
  } catch (error) {
    if (error.response) {
      console.error(`    Request failed with status ${error.response.status}`);
      console.error(`    Error:`, error.response.data);
    } else {
      console.error(`    Request failed: ${error.message}`);
    }
  }
  console.log('');

  // Test 5: Test with WRONG field name (to show error)
  console.log('5️ Testing API with WRONG field name (foodText) - This should fail...');
  try {
    const response = await axios.post(`${BASE_URL}/api/analyze-meal-text`, {
      foodText: "apple"
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });
    
    console.log('     Unexpected: Request succeeded (should have failed)');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('    Correctly rejected invalid field name');
      console.log(`    Error message: ${error.response.data.error}`);
    } else {
      console.error(`    Unexpected error:`, error.message);
    }
  }
  console.log('');

  console.log(' Diagnostics complete!\n');
  console.log(' Summary:');
  console.log('   - If Test 3 or 4 succeeded: Your API is working correctly!');
  console.log('   - If all tests failed: Check server logs and .env configuration');
  console.log('   - Use "meal_text" or "meal-text" in your Postman requests\n');
}

// Run diagnostics
runDiagnostics().catch(console.error);
