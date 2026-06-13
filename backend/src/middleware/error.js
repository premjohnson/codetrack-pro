const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled Error: %o', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    data: process.env.NODE_ENV === 'development' ? { stack: err.stack, error: err } : {},
    meta: {}
  });
};

module.exports = errorHandler;
