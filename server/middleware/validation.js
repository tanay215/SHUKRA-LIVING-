import validator from 'validator';
import rateLimit from 'express-rate-limit';

// Input sanitization and validation
export const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    // Don't escape URLs as it breaks them (converts / to &#x2F;)
    if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('data:image')) {
      return str.trim();
    }
    return validator.escape(str.trim());
  };

  const sanitizeObject = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return sanitizeString(obj);
  };

  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  
  next();
};

// Validation schemas
export const validateEmail = (email) => {
  return validator.isEmail(email) && email.length <= 254;
};

export const validatePhone = (phone) => {
  return validator.isMobilePhone(phone, 'en-IN') || /^[6-9]\d{9}$/.test(phone);
};

export const validatePassword = (password) => {
  return password && password.length >= 6 && password.length <= 128;
};

export const validateName = (name) => {
  return name && name.length >= 2 && name.length <= 50 && /^[a-zA-Z\s]+$/.test(name);
};

export const validateUserId = (userId) => {
  return userId && /^[a-zA-Z0-9_]{3,20}$/.test(userId);
};

// Request validation middleware
export const validateUserRegistration = (req, res, next) => {
  const { firstName, lastName, email, phone } = req.body;
  const errors = [];

  if (!validateName(firstName)) errors.push('Invalid first name');
  if (!validateName(lastName)) errors.push('Invalid last name');
  if (!validateEmail(email)) errors.push('Invalid email format');
  if (!validatePhone(phone)) errors.push('Invalid phone number');

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  next();
};

export const validateLogin = (req, res, next) => {
  const { userId, password } = req.body;
  const errors = [];

  if (!validateUserId(userId)) errors.push('Invalid user ID format');
  if (!validatePassword(password)) errors.push('Invalid password');

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  next();
};

export const validateProduct = (req, res, next) => {
  const { name, price, category, brand } = req.body;
  const errors = [];

  if (!name || name.length < 2 || name.length > 200) errors.push('Invalid product name');
  if (!price || price < 0 || price > 10000000) errors.push('Invalid price');
  if (!category || category.length < 2) errors.push('Invalid category');
  if (!brand || brand.length < 2) errors.push('Invalid brand');

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  next();
};

// CSRF Protection
export const csrfProtection = (req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const token = req.headers['x-csrf-token'];
    const sessionToken = req.session?.csrfToken;
    
    if (!token || token !== sessionToken) {
      return res.status(403).json({ error: 'CSRF token validation failed' });
    }
  }
  next();
};

// Rate limiting for specific endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts',
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 OTP requests per minute
  message: 'Too many OTP requests',
  standardHeaders: true,
  legacyHeaders: false,
});