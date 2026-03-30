import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/Responseformatter.js';
import dotenv from 'dotenv';

dotenv.config();

// 🔒 Get JWT secret from .env (required, no fallback)
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET not configured - tokens cannot be verified!');
}

export const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return errorResponse(res, 'No authentication token provided', 401);
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('❌ Token verification error:', error.message);
        return errorResponse(res, 'Invalid or expired token', 401);
    }
};

// Middleware to verify user is accessing their own data
export const verifyOwnership = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return errorResponse(res, 'No authentication token provided', 401);
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = req.params.id;

        // Check if user is accessing their own data or is an admin
        if (decoded.id !== userId && decoded.role !== 'admin') {
            console.warn(`⚠️ Unauthorized access attempt: user ${decoded.id} trying to access ${userId}`);
            return errorResponse(res, 'You can only access your own data', 403);
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.error('❌ Token verification error:', error.message);
        return errorResponse(res, 'Invalid or expired token', 401);
    }
};
