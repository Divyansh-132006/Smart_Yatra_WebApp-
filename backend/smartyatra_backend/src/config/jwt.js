import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const jwtConfig = {
  secret: process.env.JWT_SECRET || 'smartyatra_secret_key',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
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
