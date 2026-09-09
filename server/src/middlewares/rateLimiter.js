const rateLimit = require('express-rate-limit');

const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15, // limit auth attempts to 15 per 15 minutes
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.'
  }
});

module.exports = { globalRateLimiter, authRateLimiter };
