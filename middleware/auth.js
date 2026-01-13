import jwt from 'jsonwebtoken';
import User from '@/models/User';
import connectDB from '@/lib/db';

/**
 * Middleware to verify JWT token and authenticate user
 * Returns user object if authenticated, or error response
 */
export async function authenticate(request) {
  try {
    // Get token from header
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        error: true,
        status: 401,
        message: 'Access denied. No token provided.'
      };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Connect to database
    await connectDB();

    // Find user
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return {
        error: true,
        status: 401,
        message: 'Invalid token. User not found.'
      };
    }

    // Return user data
    return { error: false, user };
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return {
        error: true,
        status: 401,
        message: 'Invalid token.'
      };
    }
    if (error.name === 'TokenExpiredError') {
      return {
        error: true,
        status: 401,
        message: 'Token expired.'
      };
    }
    return {
      error: true,
      status: 500,
      message: 'Authentication error.'
    };
  }
}

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @returns {string} JWT token
 */
export function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d' // Token valid for 7 days
  });
}

/**
 * Generate password reset token
 * @param {string} userId - User ID
 * @returns {string} Reset token
 */
export function generateResetToken(userId) {
  return jwt.sign({ userId, type: 'reset' }, process.env.JWT_SECRET, {
    expiresIn: '1h' // Reset token valid for 1 hour
  });
}
