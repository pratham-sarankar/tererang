// backend/utils/generateToken.js
import jwt from 'jsonwebtoken';

/**
 * Generate JWT token for user
 * NOTE: Token has no expiration - it remains valid until user logs out or JWT_SECRET changes.
 * This design choice means tokens won't expire automatically, addressing the issue where
 * logged-in users lost access to cart/orders due to token expiry.
 * @param {string} userId - User ID
 * @returns {string} JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'fallback_secret');
};
