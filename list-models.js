/**
 * List available Gemini models
 */
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  try {
    console.log(' Connecting to Gemini API...');
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in .env file');
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    console.log(' Listing available models...');
    
    // List models
    const models = await genAI.listModels();
    
    console.log(' Available models:');
    models.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error(' Failed to list models:');
    console.error('Error:', error.message);
    console.error('Status:', error.status);
  }
}

listModels();