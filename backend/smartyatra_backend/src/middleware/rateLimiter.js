import rateLimit from 'express-rate-limit';

// Rate limiter for OTP endpoints - Strict: 3 requests per 10 minutes per IP
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // 3 requests per windowMs
  message: 'Too many OTP requests from this IP, please try again after 10 minutes',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req, res) => {
    // Skip rate limiting for authenticated admin requests (optional)
    return false;
  },
  keyGenerator: (req, res) => {
    // Rate limit by IP + phone number (if provided) for better security
    return req.ip + (req.body?.phone || '');
  }
});

// Rate limiter for OTP verification - Moderate: 5 attempts per 15 minutes
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 verification attempts per windowMs
  message: 'Too many OTP verification attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.ip + (req.body?.phone || '');
  }
});

// Rate limiter for login attempts - Moderate: 5 attempts per 15 minutes
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per windowMs
  message: 'Too many login attempts, please try again in 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.ip + (req.body?.email || '');
  }
});

// Rate limiter for registration - Moderate: 3 registrations per hour per IP
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour
  message: 'Too many accounts created from this IP, please try again in an hour',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.ip;
  }
});

// Rate limiter for geofence queries - Relaxed: 100 per minute (reasonable for map app)
export const geofenceLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many geofence requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.ip;
  }
});

// Rate limiter for profile updates - Moderate: 10 per hour
export const profileUpdateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 updates per hour
  message: 'Too many profile updates, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // Rate limit by user ID if authenticated
    return req.user?.id || req.ip;
  }
});

// General API limiter - Very high: 1000 per hour (catch-all)
export const generalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per hour
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.ip;
  }
});
