/**
 * Meal Analysis Routes
 * Handles text and image-based meal analysis endpoints
 */

const express = require('express');
const multer = require('multer');
const { analyzeMealText, analyzeMealImage } = require('../services/geminiService');

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


router.post('/analyze-meal-text', async (req, res) => {
  try {
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

    // Analyze the meal text
    const nutritionData = await analyzeMealText(mealText.trim());

    // Return successful response
    res.status(200).json({
      success: true,
      data: nutritionData,
      message: 'Meal analyzed successfully',
    });
  } catch (error) {
    console.error('Error in /analyze-meal-text:', error);

    const status = error?.status ?? error?.cause?.status;
    const code = error?.code ?? error?.cause?.code;
    const message = error?.message ?? '';

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

    // Analyze the meal image
    const nutritionData = await analyzeMealImage(imageBuffer, imageMimeType);

    // Return successful response
    res.status(200).json({
      success: true,
      data: nutritionData,
      message: 'Meal image analyzed successfully',
    });
  } catch (error) {
    console.error('Error in /analyze-meal-image:', error);

    const status = error?.status ?? error?.cause?.status;
    const code = error?.code ?? error?.cause?.code;
    const message = error?.message ?? '';

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
