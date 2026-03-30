import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// 🔒 SECURITY: JWT_SECRET MUST be set in .env - no hardcoded default!
if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET is not configured in .env file');
  console.error('Set JWT_SECRET=your_random_secret_key in .env');
  process.exit(1); // Exit immediately - never start without secret
}

const jwtConfig = {
  secret: process.env.JWT_SECRET, // ✅ Required from .env, no fallback
  expiresIn: process.env.JWT_EXPIRES_IN || '15m', // ⬆️ Changed from 7d to 15m
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
};

export const generateToken = (payload) => {
  return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.refreshExpiresIn });
};

export const verifyToken = (token) => {
  return jwt.verify(token, jwtConfig.secret);
};

export default {
  jwtConfig,
  generateToken,
  generateRefreshToken,
  verifyToken,
};
