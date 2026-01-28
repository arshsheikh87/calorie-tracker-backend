// Load environment variables
require('dotenv').config();

// Import the Express app
const app = require('./app');

// Read PORT from environment variables or use default
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/`);
  console.log(` Started at: ${new Date().toISOString()}`);
});

