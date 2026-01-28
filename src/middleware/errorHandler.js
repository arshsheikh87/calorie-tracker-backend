/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

/**
 * Global error handler middleware
 * Should be added as the last middleware in app.js
 */
function errorHandler(err, req, res, next) {
  console.error('Unhandled error:', err);

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
