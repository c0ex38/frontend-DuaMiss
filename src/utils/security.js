/**
 * Security Utility Functions
 * Protection against XSS, SQL Injection, and other security threats
 */

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - User input string
 * @returns {string} - Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove HTML tags and script tags
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove inline event handlers
    .replace(/javascript:/gi, ''); // Remove javascript: protocol

  return sanitized.trim();
};

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
export const escapeHtml = (text) => {
  if (typeof text !== 'string') return text;
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Validate and sanitize SQL-dangerous characters
 * Prevents SQL injection attempts in user inputs
 * @param {string} input - User input
 * @returns {string} - Sanitized input
 */
export const sanitizeSqlInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove SQL injection patterns
  let sanitized = input
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi, '')
    .replace(/;/g, '') // Remove semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove multi-line comment start
    .replace(/\*\//g, '') // Remove multi-line comment end
    .replace(/xp_/gi, '') // Remove extended stored procedures
    .replace(/sp_/gi, '') // Remove stored procedures
    .replace(/0x[0-9a-f]+/gi, ''); // Remove hexadecimal
  
  return sanitized.trim();
};

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} - Is valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate username (alphanumeric, underscore, dash)
 * @param {string} username - Username
 * @returns {boolean} - Is valid username
 */
export const isValidUsername = (username) => {
  // 3-20 characters, alphanumeric, underscore, dash only
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * Validate password strength
 * @param {string} password - Password
 * @returns {object} - { isValid: boolean, message: string, strength: number }
 */
export const validatePasswordStrength = (password) => {
  const result = {
    isValid: false,
    message: '',
    strength: 0, // 0-4
  };

  if (!password) {
    result.message = 'Şifre gerekli';
    return result;
  }

  if (password.length < 8) {
    result.message = 'Şifre en az 8 karakter olmalı';
    return result;
  }

  let strength = 0;
  
  // Check for different character types
  if (/[a-z]/.test(password)) strength++; // lowercase
  if (/[A-Z]/.test(password)) strength++; // uppercase
  if (/[0-9]/.test(password)) strength++; // numbers
  if (/[^a-zA-Z0-9]/.test(password)) strength++; // special chars

  result.strength = strength;

  if (strength < 2) {
    result.message = 'Şifre çok zayıf. En az harf ve rakam kullanın.';
    return result;
  }

  if (strength < 3) {
    result.message = 'Şifre orta güçte. Büyük harf veya özel karakter ekleyin.';
  } else if (strength < 4) {
    result.message = 'Şifre güçlü.';
    result.isValid = true;
  } else {
    result.message = 'Şifre çok güçlü!';
    result.isValid = true;
  }

  return result;
};

/**
 * Validate numeric input
 * @param {*} value - Value to validate
 * @param {object} options - { min, max, allowDecimals }
 * @returns {boolean} - Is valid number
 */
export const isValidNumber = (value, options = {}) => {
  const { min = -Infinity, max = Infinity, allowDecimals = true } = options;
  
  const num = parseFloat(value);
  
  if (isNaN(num)) return false;
  if (num < min || num > max) return false;
  if (!allowDecimals && num % 1 !== 0) return false;
  
  return true;
};

/**
 * Sanitize object recursively
 * @param {object} obj - Object to sanitize
 * @returns {object} - Sanitized object
 */
export const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? sanitizeInput(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
  }
  
  return sanitized;
};

/**
 * Validate file upload
 * @param {File} file - File object
 * @param {object} options - { maxSize, allowedTypes }
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
  } = options;

  if (!file) {
    return { isValid: false, message: 'Dosya seçilmedi' };
  }

  if (file.size > maxSize) {
    return { 
      isValid: false, 
      message: `Dosya boyutu ${(maxSize / 1024 / 1024).toFixed(1)}MB'den küçük olmalı` 
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      message: 'Desteklenmeyen dosya tipi' 
    };
  }

  return { isValid: true, message: 'Dosya geçerli' };
};

/**
 * Rate limiting helper (client-side)
 * @param {string} key - Unique identifier for the action
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - Is allowed
 */
export const checkRateLimit = (key, maxAttempts = 5, windowMs = 60000) => {
  const now = Date.now();
  const storageKey = `rateLimit_${key}`;
  
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || '{"attempts":[],"blocked":false}');
    
    // Remove old attempts outside the window
    data.attempts = data.attempts.filter(time => now - time < windowMs);
    
    // Check if blocked
    if (data.blocked && data.blockedUntil && now < data.blockedUntil) {
      return false;
    }
    
    // Check attempts
    if (data.attempts.length >= maxAttempts) {
      data.blocked = true;
      data.blockedUntil = now + windowMs * 2; // Block for 2x the window
      localStorage.setItem(storageKey, JSON.stringify(data));
      return false;
    }
    
    // Add current attempt
    data.attempts.push(now);
    data.blocked = false;
    localStorage.setItem(storageKey, JSON.stringify(data));
    
    return true;
  } catch (error) {
    console.error('Rate limit check error:', error);
    return true; // Allow on error
  }
};

/**
 * Get remaining rate limit time
 * @param {string} key - Unique identifier
 * @returns {number} - Seconds remaining, or 0 if not blocked
 */
export const getRateLimitRemaining = (key) => {
  const storageKey = `rateLimit_${key}`;
  
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || '{}');
    
    if (data.blocked && data.blockedUntil) {
      const remaining = Math.ceil((data.blockedUntil - Date.now()) / 1000);
      return Math.max(0, remaining);
    }
    
    return 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Prevent clickjacking by checking if page is in iframe
 * @returns {boolean} - Is in iframe
 */
export const isInIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

/**
 * Generate CSRF token for forms
 * @returns {string} - CSRF token
 */
export const generateCSRFToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Validate CSRF token
 * @param {string} token - Token to validate
 * @returns {boolean} - Is valid
 */
export const validateCSRFToken = (token) => {
  const storedToken = sessionStorage.getItem('csrf_token');
  return token === storedToken;
};

/**
 * Sanitize URL to prevent open redirect attacks
 * @param {string} url - URL to sanitize
 * @param {string} defaultUrl - Default safe URL
 * @returns {string} - Safe URL
 */
export const sanitizeRedirectUrl = (url, defaultUrl = '/dashboard') => {
  if (!url) return defaultUrl;
  
  // Only allow relative URLs or same-origin URLs
  try {
    const urlObj = new URL(url, window.location.origin);
    
    // Check if same origin
    if (urlObj.origin !== window.location.origin) {
      console.warn('Blocked redirect to external URL:', url);
      return defaultUrl;
    }
    
    return urlObj.pathname + urlObj.search + urlObj.hash;
  } catch (error) {
    // If URL parsing fails, return relative path if it starts with /
    if (url.startsWith('/') && !url.startsWith('//')) {
      return url;
    }
    
    return defaultUrl;
  }
};

/**
 * Secure localStorage wrapper
 */
export const secureStorage = {
  set: (key, value) => {
    try {
      const encrypted = btoa(JSON.stringify(value)); // Simple encoding, use crypto for production
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Secure storage set error:', error);
    }
  },
  
  get: (key) => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      return JSON.parse(atob(encrypted));
    } catch (error) {
      console.error('Secure storage get error:', error);
      return null;
    }
  },
  
  remove: (key) => {
    localStorage.removeItem(key);
  }
};
