// Load environment variables
require('dotenv').config();

// Import required modules
const express = require('express');
const cors = require('cors');

// Import routes
const mealAnalysisRoutes = require('./routes/mealAnalysis');
const indexRoutes = require('./routes/index');

// Import error handlers
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// Middleware: Enable JSON parsing
app.use(express.json());

// Middleware: Enable CORS
app.use(cors());

// Basic health check karne wala route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    endpoints: {
      'POST /api/analyze-meal-text': 'Analyze meal from text description',
      'POST /api/analyze-meal-image': 'Analyze meal from uploaded image',
    },
  });
});

// API Routes
app.use('/api', indexRoutes);
app.use('/api', mealAnalysisRoutes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Export the app
module.exports = app;

