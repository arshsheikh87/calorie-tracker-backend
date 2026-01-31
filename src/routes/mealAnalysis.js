/**
 * Meal Analysis Routes
 * Handles text and image-based meal analysis endpoints
 */

const express = require('express');
const multer = require('multer');
const { analyzeMealText, analyzeMealImage } = require('../services/geminiService');
const Entry = require('../models/Entry');

const router = express.Router();

// Configure multer for image uploads
// Store in memory (no disk storage needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// GET route to fetch all saved meal entries
router.get('/entries', async (req, res) => {
  try {
    console.log(' Fetching all entries from database...');

    const entries = await Entry.find({ type: 'meal' })
      .sort({ createdAt: -1 }) // Most recent first
      .limit(50); // Limit to 50 entries

    console.log(` Found ${entries.length} meal entries`);

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries,
      message: 'Entries retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching entries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch entries',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});


router.post('/entries', async (req, res) => {
  try {
    const date = req.query.date;
    console.log("date :",date);
    // Validate format dd-mm-yy using regex
    const dateRegex = /^\d{2}-\d{2}-\d{2}$/;
    if(!dateRegex.test(date)){
      console.error("invalid date format.");
      return res.status(400).json({error: "invalid date format. use dd-mm-yy format"})
    }
    // Validate request body - accept both 'meal_text' and 'meal-text' for flexibility
    const mealText = req.body.meal_text || req.body['meal-text'];

    // Enhanced error message with helpful debugging info
    if (!mealText || typeof mealText !== 'string' || mealText.trim().length === 0) {
      const receivedKeys = Object.keys(req.body);
      return res.status(400).json({
        success: false,
        error: 'Invalid request: meal_text (or meal-text) is required and must be a non-empty string',
        received_fields: receivedKeys.length > 0 ? receivedKeys : ['none'],
        hint: receivedKeys.length > 0
          ? `You sent: ${JSON.stringify(receivedKeys)}. Expected: "meal_text" or "meal-text"`
          : 'Request body is empty. Make sure you are sending JSON with Content-Type: application/json',
      });
    }

    console.log(' Processing meal analysis request for:', mealText.trim());

    // Analyze the meal text using Gemini AI
    const nutritionData = await analyzeMealText(mealText.trim());
    console.log(' Gemini analysis completed:', nutritionData);

    // Defensive check for required nutrition data
    if (!nutritionData.total || !nutritionData.total.calories || typeof nutritionData.total.calories.value !== 'number') {
      throw new Error('Calories missing in normalized Gemini response');
    }

    // Prepare data for database save using the new normalized structure
    const entryData = {
      name: nutritionData.detected_food_items.join(', '), // Join food items as meal name
      type: 'meal',
      calories: nutritionData.total.calories.value,
      protein: nutritionData.total.protein.value,
      carbs: nutritionData.total.carbs.value,
      fats: nutritionData.total.fat.value,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    };

    console.log(' Saving to database:', entryData);

    // Save to MongoDB
    const savedEntry = await Entry.create(entryData);
    console.log(' Successfully saved to database with ID:', savedEntry._id);

    // Return successful response with both analysis and saved data
    res.status(201).json({
      success: true,
      data: {
        // Enhanced nutrition data with individual dishes and totals
        dishes: nutritionData.dishes,
        total: nutritionData.total,
        // Legacy analysis format for backward compatibility
        analysis: {
          detected_food_items: nutritionData.detected_food_items,
          calories: nutritionData.calories,
          protein_g: nutritionData.protein_g,
          carbs_g: nutritionData.carbs_g,
          fat_g: nutritionData.fat_g
        },
        saved_entry: {
          id: savedEntry._id,
          name: savedEntry.name,
          type: savedEntry.type,
          calories: savedEntry.calories,
          protein: savedEntry.protein,
          carbs: savedEntry.carbs,
          fats: savedEntry.fats,
          date: savedEntry.date,
          created_at: savedEntry.createdAt
        }
      },
      message: 'Meal analyzed and saved successfully',
    });
  } catch (error) {
    console.error('Error in /analyze-meal-text:', error);

    const status = error?.status ?? error?.cause?.status;
    const code = error?.code ?? error?.cause?.code;
    const message = error?.message ?? '';

    // Handle database save errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Database validation error: ' + error.message,
      });
    }

    // Handle specific error types
    if (status === 401 || code === 'invalid_api_key' || code === 'missing_api_key' || message.toLowerCase().includes('api key')) {
      return res.status(401).json({
        success: false,
        error: 'Gemini authentication failed (missing/invalid API key). Update GEMINI_API_KEY in your .env and restart the server.',
      });
    }

    // AI provider can return 429 for both rate limits and insufficient quota
    if (status === 429 || code === 'insufficient_quota' || message.toLowerCase().includes('rate limit') || message.toLowerCase().includes('quota')) {
      return res.status(429).json({
        success: false,
        error: 'Gemini request blocked (rate limit or quota). Check your Google AI usage/billing, then try again.',
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Failed to analyze meal text',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});


router.post('/analyze-meal-image', upload.single('meal_image'), async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: meal_image file is required',
      });
    }

    // Get image data and MIME type
    const imageBuffer = req.file.buffer;
    const imageMimeType = req.file.mimetype;

    console.log(' Processing meal image analysis, file size:', imageBuffer.length, 'bytes');

    // Analyze the meal image using Gemini AI
    const nutritionData = await analyzeMealImage(imageBuffer, imageMimeType);
    console.log(' Gemini image analysis completed:', nutritionData);

    // Defensive check for required nutrition data
    if (!nutritionData.total || !nutritionData.total.calories || typeof nutritionData.total.calories.value !== 'number') {
      throw new Error('Calories missing in normalized Gemini response');
    }

    // Prepare data for database save using the new normalized structure
    const entryData = {
      name: nutritionData.detected_food_items.join(', '), // Join food items as meal name
      type: 'meal',
      calories: nutritionData.total.calories.value,
      protein: nutritionData.total.protein.value,
      carbs: nutritionData.total.carbs.value,
      fats: nutritionData.total.fat.value,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    };

    console.log(' Saving image analysis to database:', entryData);

    // Save to MongoDB
    const savedEntry = await Entry.create(entryData);
    console.log(' Successfully saved image analysis to database with ID:', savedEntry._id);

    // Return successful response with both analysis and saved data
    res.status(201).json({
      success: true,
      data: {
        // Enhanced nutrition data with individual dishes and totals
        dishes: nutritionData.dishes,
        total: nutritionData.total,
        // Legacy analysis format for backward compatibility
        analysis: {
          detected_food_items: nutritionData.detected_food_items,
          calories: nutritionData.calories,
          protein_g: nutritionData.protein_g,
          carbs_g: nutritionData.carbs_g,
          fat_g: nutritionData.fat_g
        },
        saved_entry: {
          id: savedEntry._id,
          name: savedEntry.name,
          type: savedEntry.type,
          calories: savedEntry.calories,
          protein: savedEntry.protein,
          carbs: savedEntry.carbs,
          fats: savedEntry.fats,
          date: savedEntry.date,
          created_at: savedEntry.createdAt
        }
      },
      message: 'Meal image analyzed and saved successfully',
    });
  } catch (error) {
    console.error('Error in /analyze-meal-image:', error);

    const status = error?.status ?? error?.cause?.status;
    const code = error?.code ?? error?.cause?.code;
    const message = error?.message ?? '';

    // Handle database save errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Database validation error: ' + error.message,
      });
    }

    // Handle multer errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File too large. Maximum size is 10MB.',
        });
      }
      return res.status(400).json({
        success: false,
        error: `File upload error: ${error.message}`,
      });
    }

    // Handle specific error types
    if (error.message.includes('Only image files')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file type. Only image files are allowed.',
      });
    }

    // Gemini auth / missing key
    if (status === 401 || code === 'invalid_api_key' || code === 'missing_api_key' || message.toLowerCase().includes('api key')) {
      return res.status(401).json({
        success: false,
        error: 'Gemini authentication failed (missing/invalid API key). Update GEMINI_API_KEY in your .env and restart the server.',
      });
    }

    if (status === 429 || code === 'insufficient_quota' || message.toLowerCase().includes('rate limit') || message.toLowerCase().includes('exceeded your current quota')) {
      return res.status(429).json({
        success: false,
        error: 'Gemini request blocked (rate limit or quota). Check your Google AI usage/billing, then try again.',
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Failed to analyze meal image',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
