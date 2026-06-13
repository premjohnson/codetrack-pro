const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    data: {},
    meta: {}
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login/OTP attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login or OTP attempts, please try again after 15 minutes.',
    data: {},
    meta: {}
  }
});

const playgroundLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each student to 10 execution runs per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Playground rate limit exceeded. Please wait a minute before running code again.',
    data: {},
    meta: {}
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  playgroundLimiter,
};
