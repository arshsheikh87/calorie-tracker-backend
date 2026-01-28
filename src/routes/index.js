// Import Express Router
const express = require('express');
const router = express.Router();

// Basic route example
router.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is working!',
    version: '1.0.0'
  });
});

// Export the router
module.exports = router;

