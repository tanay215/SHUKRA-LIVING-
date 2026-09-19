import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    if (isTokenBlacklisted(token)) {
      return res.status(401).json({ error: 'Token has been revoked.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    res.status(401).json({ error: 'Invalid token.' });
  }
};

export const generateToken = (userId, expiresIn = '24h') => {
  // For admin, use longer expiry with enhanced payload
  const tokenExpiry = userId === 'admin' ? '7d' : expiresIn;
  return jwt.sign({ 
    userId, 
    role: userId === 'admin' ? 'admin' : 'user',
    iat: Math.floor(Date.now() / 1000),
    jti: Math.random().toString(36).substring(2)
  }, process.env.JWT_SECRET, { expiresIn: tokenExpiry });
};

// Token blacklist for logout
const tokenBlacklist = new Set();

export const blacklistToken = (token) => {
  tokenBlacklist.add(token);
};

export const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};