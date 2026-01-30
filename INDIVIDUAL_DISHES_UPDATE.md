# Individual Dishes Nutrition Analysis Update

## Overview
Updated the meal analysis API to return nutrition data for individual dishes separately, along with aggregated totals, while maintaining backward compatibility.

## Files Changed

### 1. `src/services/geminiService.js`
**Changes Made:**
- **Updated `buildNutritionPrompt()`**: Modified the AI prompt to request individual dish nutrition data instead of just aggregated totals
- **Enhanced `validateAndNormalizeNutritionData()`**: Complete rewrite to handle the new response format with individual dishes and totals

**Key Features:**
- Processes individual dish nutrition data from AI response
- Calculates totals from individual dishes if not provided
- Maintains backward compatibility with legacy format
- Rounds all values to max 2 decimal places
- Adds proper units to all nutrition values

### 2. `src/routes/mealAnalysis.js`
**Changes Made:**
- **Updated response format** in both `/analyze-meal-text` and `/analyze-meal-image` routes
- Added new `dishes` and `total` fields to response
- Maintained `analysis` field for backward compatibility

## New Response Format

### Enhanced Format
```json
{
  "success": true,
  "data": {
    "dishes": [
      {
        "name": "chicken curry",
        "nutrition": {
          "calories": { "value": 250, "unit": "kcal" },
          "protein": { "value": 25.5, "unit": "g" },
          "carbs": { "value": 8.2, "unit": "g" },
          "fat": { "value": 12.3, "unit": "g" }
        }
      },
      {
        "name": "basmati rice",
        "nutrition": {
          "calories": { "value": 200, "unit": "kcal" },
          "protein": { "value": 4.1, "unit": "g" },
          "carbs": { "value": 45.0, "unit": "g" },
          "fat": { "value": 0.5, "unit": "g" }
        }
      }
    ],
    "total": {
      "calories": { "value": 450, "unit": "kcal" },
      "protein": { "value": 29.6, "unit": "g" },
      "carbs": { "value": 53.2, "unit": "g" },
      "fat": { "value": 12.8, "unit": "g" }
    },
    "analysis": {
      "detected_food_items": ["chicken curry", "basmati rice"],
      "calories": 450,
      "protein_g": 29.6,
      "carbs_g": 53.2,
      "fat_g": 12.8
    },
    "saved_entry": { ... }
  },
  "message": "Meal analyzed and saved successfully"
}
```

### Backward Compatibility
The `analysis` field maintains the original format:
```json
{
  "detected_food_items": ["dish1", "dish2"],
  "calories": 450,
  "protein_g": 29.6,
  "carbs_g": 53.2,
  "fat_g": 12.8
}
```

## Nutrition Units
- **Calories**: `kcal`
- **Protein**: `g` (grams)
- **Carbohydrates**: `g` (grams)
- **Fat**: `g` (grams)

## Edge Case Handling

### 1. Missing or Invalid Dishes
- If AI doesn't return valid dishes, creates fallback dish named "Unidentified food items"
- Uses any available total nutrition data for the fallback dish

### 2. Missing Totals
- If AI doesn't provide totals, calculates them by summing individual dish nutrition
- Ensures totals always match the sum of individual dishes

### 3. Invalid Nutrition Values
- All nutrition values are validated and converted to numbers
- Negative values are converted to 0
- Missing values default to 0
- All values rounded to max 2 decimal places

### 4. Empty Dish Names
- Filters out dishes with empty or invalid names
- Trims whitespace from dish names

## Testing

### Run Tests
```bash
# Start the server
npm run dev

# Test the new functionality
node test-individual-dishes.js
```

### Test Cases Covered
1. **Complex meals** with multiple dishes
2. **Simple meals** with few items
3. **Backward compatibility** verification
4. **Total calculation** accuracy
5. **Unit formatting** validation

## API Endpoints Affected
- `POST /api/analyze-meal-text`
- `POST /api/analyze-meal-image`

Both endpoints now return the enhanced format while maintaining full backward compatibility.

## Benefits
1. **Individual dish tracking**: Users can see nutrition for each dish separately
2. **Better meal planning**: Helps identify high-calorie or high-protein dishes
3. **Detailed analysis**: More granular nutrition information
4. **Backward compatibility**: Existing clients continue to work
5. **Proper units**: All nutrition values include appropriate units
6. **Accurate totals**: Totals are calculated and verified for accuracy