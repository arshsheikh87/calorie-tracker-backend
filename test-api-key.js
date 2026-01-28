/**
 * Test Gemini API key validity with direct HTTP request
 */
require('dotenv').config();

async function testApiKey() {
  try {
    console.log(' Testing Gemini API Key validity...');
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in .env file');
    }
    
    console.log(' API Key found:', apiKey.substring(0, 10) + '...');
    
    // Test with a simple request to list models endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    console.log(' Making request to list models...');
    
    const response = await fetch(url);
    
    console.log(' Response status:', response.status);
    console.log(' Response status text:', response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(' Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('API Key is valid!');
    console.log(' Available models:');
    
    if (data.models && data.models.length > 0) {
      data.models.forEach((model, index) => {
        console.log(`${index + 1}. ${model.name}`);
        console.log(`   Display Name: ${model.displayName || 'N/A'}`);
        console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('No models found in response');
    }
    
  } catch (error) {
    console.error(' API Key test failed:');
    console.error('Error:', error.message);
  }
}

testApiKey();