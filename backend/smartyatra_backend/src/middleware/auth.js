import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/Responseformatter.js';

export const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return errorResponse(res, 'No authentication token provided', 401);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartyatra_secret_key');
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        return errorResponse(res, 'Invalid or expired token', 401);
    }
};

// Optional: Middleware to verify user is accessing their own data
export const verifyOwnership = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return errorResponse(res, 'No authentication token provided', 401);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartyatra_secret_key');
        const userId = req.params.id;

        // Check if user is accessing their own data or is an admin
        if (decoded.id !== userId && decoded.role !== 'admin') {
            return errorResponse(res, 'You can only access your own data', 403);
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        return errorResponse(res, 'Invalid or expired token', 401);
    }
};
