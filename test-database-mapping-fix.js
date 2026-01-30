/**
 * Test Database Mapping Fix
 * Verifies that the nutrition data is correctly mapped from the new normalized structure to the database
 */

require('dotenv').config();

async function testDatabaseMappingFix() {
  console.log('🔍 Testing Database Mapping Fix...\n');
  
  const BASE_URL = `http://localhost:${process.env.PORT || 5000}`;
  
  // Test 1: Server Health Check
  console.log('1️⃣ Server Health Check...');
  try {
    const response = await fetch(`${BASE_URL}/`);
    const data = await response.json();
    console.log('✅ Server is running');
  } catch (error) {
    console.error('❌ Server not accessible:', error.message);
    console.log('💡 Start server with: npm run dev');
    return;
  }
  
  // Test 2: Test Meal Analysis with Database Save
  console.log('\n2️⃣ Testing Meal Analysis + Database Save...');
  try {
    const testMeal = 'grilled chicken breast, brown rice, steamed broccoli';
    console.log('   Testing meal:', testMeal);
    
    const response = await fetch(`${BASE_URL}/api/analyze-meal-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meal_text: testMeal })
    });
    
    console.log('   Response status:', response.status);
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Analysis and database save successful!');
      
      // Verify the saved entry has proper values
      if (data.data?.saved_entry) {
        const entry = data.data.saved_entry;
        console.log('\n   💾 Saved Database Entry:');
        console.log(`      ID: ${entry.id}`);
        console.log(`      Name: ${entry.name}`);
        console.log(`      Calories: ${entry.calories} (should be a number, not undefined)`);
        console.log(`      Protein: ${entry.protein}g`);
        console.log(`      Carbs: ${entry.carbs}g`);
        console.log(`      Fats: ${entry.fats}g`);
        console.log(`      Date: ${entry.date}`);
        
        // Verify values are not undefined
        const validationResults = {
          calories: entry.calories !== undefined && typeof entry.calories === 'number',
          protein: entry.protein !== undefined && typeof entry.protein === 'number',
          carbs: entry.carbs !== undefined && typeof entry.carbs === 'number',
          fats: entry.fats !== undefined && typeof entry.fats === 'number'
        };
        
        console.log('\n   ✅ Database Validation:');
        console.log(`      Calories valid: ${validationResults.calories ? '✅' : '❌'}`);
        console.log(`      Protein valid: ${validationResults.protein ? '✅' : '❌'}`);
        console.log(`      Carbs valid: ${validationResults.carbs ? '✅' : '❌'}`);
        console.log(`      Fats valid: ${validationResults.fats ? '✅' : '❌'}`);
        
        const allValid = Object.values(validationResults).every(v => v);
        console.log(`      Overall: ${allValid ? '✅ All fields valid' : '❌ Some fields invalid'}`);
      }
      
      // Verify the enhanced response format
      if (data.data?.total) {
        console.log('\n   📊 Enhanced Response Format:');
        console.log(`      Total calories: ${data.data.total.calories.value} ${data.data.total.calories.unit}`);
        console.log(`      Total protein: ${data.data.total.protein.value} ${data.data.total.protein.unit}`);
        console.log(`      Dishes count: ${data.data.dishes?.length || 0}`);
      }
      
    } else {
      console.error('❌ Analysis failed');
      console.error('   Status:', response.status);
      console.error('   Error:', data.error);
      console.error('   Details:', data.details);
      
      // Check if it's a validation error
      if (data.error && data.error.includes('validation')) {
        console.error('\n   🚨 This looks like the database mapping bug!');
        console.error('   The nutrition values are probably undefined when saving to MongoDB.');
      }
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
  
  // Test 3: Retrieve Entries to Verify Database State
  console.log('\n3️⃣ Checking Database Entries...');
  try {
    const response = await fetch(`${BASE_URL}/api/entries`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Entries retrieved successfully');
      console.log(`   Total entries: ${data.count}`);
      
      if (data.count > 0) {
        const latestEntry = data.data[0];
        console.log('\n   📋 Latest Entry from Database:');
        console.log(`      Name: ${latestEntry.name}`);
        console.log(`      Calories: ${latestEntry.calories}`);
        console.log(`      Protein: ${latestEntry.protein}`);
        console.log(`      Carbs: ${latestEntry.carbs}`);
        console.log(`      Fats: ${latestEntry.fats}`);
        
        // Check if values are properly saved
        const hasValidData = latestEntry.calories !== undefined && 
                           latestEntry.calories !== null && 
                           !isNaN(latestEntry.calories);
        
        console.log(`      Data integrity: ${hasValidData ? '✅ Valid' : '❌ Invalid'}`);
      }
    } else {
      console.error('❌ Failed to retrieve entries:', data.error);
    }
  } catch (error) {
    console.error('❌ Entries request failed:', error.message);
  }
  
  console.log('\n🎉 Database Mapping Test Complete!');
  console.log('\n📋 Expected Results:');
  console.log('   ✓ No "calories: Path `calories` is required" errors');
  console.log('   ✓ All nutrition values saved as numbers (not undefined)');
  console.log('   ✓ Database entries contain valid nutrition data');
  console.log('   ✓ Enhanced response format with dishes and totals');
}

// Run test with delay
setTimeout(testDatabaseMappingFix, 2000);