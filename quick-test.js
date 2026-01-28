// Quick test to verify setup
require('dotenv').config();
console.log('Environment check:');
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('PORT:', process.env.PORT || 5000);

// Test model import
try {
  const Entry = require('./src/models/Entry');
  console.log('Entry model imported successfully');
} catch (error) {
  console.error('Entry model import failed:', error.message);
}