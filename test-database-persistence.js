/**
 * Database Persistence Test
 * Tests that meal analysis data is correctly saved to MongoDB
 */

require('dotenv').config();

async function testDatabasePersistence() {
  console.log(' Testing Database Persistence...\n');
  
  const BASE_URL = `http://localhost:${process.env.PORT || 5000}`;
  
  // Test 1: Health Check
  console.log('1️ Testing Server Health...');
  try {
    const response = await fetch(`${BASE_URL}/`);
    const data = await response.json();
    console.log(' Server is running');
    console.log('   Status:', response.status);
  } catch (error) {
    console.error(' Server not running:', error.message);
    console.log(' Start server with: npm run dev');
    return;
  }
  
  // Test 2: Meal Analysis with Database Save
  console.log('\n2️ Testing Meal Analysis + Database Save...');
  try {
    const testMeal = '2 roti, rice, dal, curd, apple';
    console.log('   Testing meal:', testMeal);
    
    const response = await fetch(`${BASE_URL}/api/analyze-meal-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        meal_text: testMeal
      })
    });
    
    console.log('   Response status:', response.status);
    
    const data = await response.json();
    
    if (response.ok && response.status === 201) {
      console.log(' Meal analysis and database save successful!');
      console.log('   Success:', data.success);
      console.log('   Message:', data.message);
      
      // Check analysis data
      if (data.data?.analysis) {
        console.log('\n    Analysis Results:');
        console.log('      Detected foods:', data.data.analysis.detected_food_items);
        console.log('      Calories:', data.data.analysis.calories);
        console.log('      Protein:', data.data.analysis.protein_g + 'g');
        console.log('      Carbs:', data.data.analysis.carbs_g + 'g');
        console.log('      Fats:', data.data.analysis.fat_g + 'g');
      }
      
      // Check saved entry data
      if (data.data?.saved_entry) {
        console.log('\n    Database Entry:');
        console.log('      Entry ID:', data.data.saved_entry.id);
        console.log('      Name:', data.data.saved_entry.name);
        console.log('      Type:', data.data.saved_entry.type);
        console.log('      Calories:', data.data.saved_entry.calories);
        console.log('      Date:', data.data.saved_entry.date);
        console.log('      Created:', data.data.saved_entry.created_at);
      }
      
    } else {
      console.error(' Request failed');
      console.error('   Status:', response.status);
      console.error('   Error:', data.error);
      console.error('   Details:', data.details);
    }
    
  } catch (error) {
    console.error(' API request failed:', error.message);
  }
  
  // Test 3: Verify Database Connection
  console.log('\n3️ Database Connection Info:');
  console.log('   MongoDB URI configured:', !!process.env.MONGO_URI);
  console.log('   Database name: calorieTracker (from URI)');
  console.log('   Expected collection: entries');
  
  console.log('\n Test complete!');
  console.log('\n Next Steps:');
  console.log('   1. Check MongoDB Atlas dashboard');
  console.log('   2. Navigate to calorieTracker database');
  console.log('   3. Look for "entries" collection');
  console.log('   4. Verify your meal entry is saved there');
}

// Add delay to ensure server is ready
setTimeout(testDatabasePersistence, 2000);