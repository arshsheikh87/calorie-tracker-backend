/**
 * Simple Gemini Connection Test
 * Tests the Gemini API connection directly
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiConnection() {
  console.log(' Testing Gemini API Connection...\n');
  
  // Check environment
  console.log('1️ Environment Check:');
  console.log('   GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
  console.log('   API key length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
  console.log('   API key starts with:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 8) + '...' : 'N/A');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error(' GEMINI_API_KEY is missing in .env file');
    return;
  }
  
  try {
    console.log('\n2️ Testing Gemini API:');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    console.log('   Sending test request...');
    const result = await model.generateContent('Say "Hello, API is working!" in JSON format with a success field.');
    const response = result.response;
    const text = response.text();
    
    console.log(' Gemini API is working!');
    console.log('   Response:', text);
    
  } catch (error) {
    console.error(' Gemini API test failed:');
    console.error('   Error message:', error.message);
    console.error('   Error status:', error.status);
    console.error('   Error code:', error.code);
    
    if (error.message.includes('API key')) {
      console.error('\n Solution: Check your GEMINI_API_KEY in .env file');
      console.error('   Get a new key from: https://aistudio.google.com/app/apikey');
    }
  }
}

testGeminiConnection();