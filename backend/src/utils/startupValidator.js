const logger = require('../config/logger');

/**
 * Validates that all required environment variables are defined.
 * If any are missing, prints failure summary and exits process immediately.
 */
const validateEnvironment = () => {
  const requiredVars = [
    'MONGO_URI',
    'REDIS_URL',
    'ACCESS_TOKEN_SECRET',
    'REFRESH_TOKEN_SECRET',
    'SESSION_SECRET',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
  ];

  const missing = [];

  for (const variable of requiredVars) {
    if (!process.env[variable]) {
      missing.push(variable);
    }
  }

  if (missing.length > 0) {
    console.error('====================================');
    console.error('Startup failed:');
    for (const m of missing) {
      console.error(`Missing ${m}`);
    }
    console.error('====================================');
    process.exit(1);
  }
};

module.exports = validateEnvironment;
