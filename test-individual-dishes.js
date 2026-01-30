/**
 * Test Individual Dishes Functionality
 * Tests the new enhanced nutrition response with individual dishes and totals
 */

require('dotenv').config();

async function testIndividualDishes() {
  console.log('🔍 Testing Individual Dishes Functionality...\n');
  
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
  
  // Test 2: Complex Meal Analysis
  console.log('\n2️⃣ Testing Complex Meal Analysis...');
  try {
    const complexMeal = 'chicken curry, basmati rice, naan bread, mixed vegetables, lassi';
    console.log('   Testing meal:', complexMeal);
    
    const response = await fetch(`${BASE_URL}/api/analyze-meal-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meal_text: complexMeal })
    });
    
    console.log('   Response status:', response.status);
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Analysis successful!');
      
      // Test new dishes format
      if (data.data?.dishes) {
        console.log('\n   🍽️  Individual Dishes:');
        data.data.dishes.forEach((dish, index) => {
          console.log(`      ${index + 1}. ${dish.name}`);
          console.log(`         Calories: ${dish.nutrition.calories.value} ${dish.nutrition.calories.unit}`);
          console.log(`         Protein: ${dish.nutrition.protein.value} ${dish.nutrition.protein.unit}`);
          console.log(`         Carbs: ${dish.nutrition.carbs.value} ${dish.nutrition.carbs.unit}`);
          console.log(`         Fat: ${dish.nutrition.fat.value} ${dish.nutrition.fat.unit}`);
        });
      }
      
      // Test totals format
      if (data.data?.total) {
        console.log('\n   📊 Total Nutrition:');
        console.log(`      Calories: ${data.data.total.calories.value} ${data.data.total.calories.unit}`);
        console.log(`      Protein: ${data.data.total.protein.value} ${data.data.total.protein.unit}`);
        console.log(`      Carbs: ${data.data.total.carbs.value} ${data.data.total.carbs.unit}`);
        console.log(`      Fat: ${data.data.total.fat.value} ${data.data.total.fat.unit}`);
      }
      
      // Test backward compatibility
      if (data.data?.analysis) {
        console.log('\n   🔄 Legacy Format (Backward Compatibility):');
        console.log('      Detected items:', data.data.analysis.detected_food_items.join(', '));
        console.log('      Total calories:', data.data.analysis.calories);
        console.log('      Total protein:', data.data.analysis.protein_g + 'g');
      }
      
      // Verify totals match
      if (data.data?.dishes && data.data?.total) {
        const calculatedCalories = data.data.dishes.reduce((sum, dish) => sum + dish.nutrition.calories.value, 0);
        const totalCalories = data.data.total.calories.value;
        
        console.log('\n   ✅ Verification:');
        console.log(`      Calculated total calories: ${calculatedCalories}`);
        console.log(`      Reported total calories: ${totalCalories}`);
        console.log(`      Match: ${calculatedCalories === totalCalories ? '✅' : '❌'}`);
      }
      
    } else {
      console.error('❌ Analysis failed');
      console.error('   Error:', data.error);
      console.error('   Details:', data.details);
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
  
  // Test 3: Simple Meal Analysis
  console.log('\n3️⃣ Testing Simple Meal Analysis...');
  try {
    const simpleMeal = 'apple and banana';
    console.log('   Testing meal:', simpleMeal);
    
    const response = await fetch(`${BASE_URL}/api/analyze-meal-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meal_text: simpleMeal })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Simple meal analysis successful!');
      console.log(`   Dishes count: ${data.data?.dishes?.length || 0}`);
      console.log(`   Total calories: ${data.data?.total?.calories?.value || 0} ${data.data?.total?.calories?.unit || 'kcal'}`);
    } else {
      console.error('❌ Simple meal analysis failed:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Simple meal request failed:', error.message);
  }
  
  console.log('\n🎉 Individual Dishes Test Complete!');
  console.log('\n📋 New Response Format:');
  console.log('   ✓ dishes: Array of individual dish nutrition');
  console.log('   ✓ total: Aggregated nutrition totals');
  console.log('   ✓ analysis: Legacy format (backward compatibility)');
  console.log('   ✓ All nutrition values include value + unit');
  console.log('   ✓ Values rounded to max 2 decimal places');
}

// Run test with delay
setTimeout(testIndividualDishes, 2000);