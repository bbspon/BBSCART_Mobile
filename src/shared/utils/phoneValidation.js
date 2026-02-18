// phoneValidation.js - Phone number validation utilities

/**
 * Validates a phone number (supports country codes)
 * @param {string} phone - Phone number to validate
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum length including country code (default: 10)
 * @param {number} options.maxLength - Maximum length including country code (default: 15)
 * @param {boolean} options.allowCountryCode - Allow country code with + prefix (default: true)
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validatePhoneNumber = (phone, options = {}) => {
  const {
    minLength = 10,
    maxLength = 15,
    allowCountryCode = true,
  } = options;

  if (!phone || phone.trim() === '') {
    return {
      isValid: false,
      error: 'Phone number is required',
    };
  }

  // Check if phone starts with + (country code)
  const hasCountryCode = phone.trim().startsWith('+');
  
  if (hasCountryCode && !allowCountryCode) {
    return {
      isValid: false,
      error: 'Country code not allowed',
    };
  }

  // Remove spaces and dashes, but keep + if present
  let cleanedPhone = phone.trim().replace(/[\s-]/g, '');
  
  // Validate format: + followed by digits, or just digits
  if (hasCountryCode) {
    // Must be + followed by digits only
    if (!/^\+[0-9]+$/.test(cleanedPhone)) {
      return {
        isValid: false,
        error: 'Invalid phone number format. Use + followed by country code and number',
      };
    }
    
    // Remove + for length check
    const digitsOnly = cleanedPhone.substring(1);
    
    if (digitsOnly.length < minLength) {
      return {
        isValid: false,
        error: `Phone number must be at least ${minLength} digits (including country code)`,
      };
    }
    
    if (digitsOnly.length > maxLength) {
      return {
        isValid: false,
        error: `Phone number must be at most ${maxLength} digits (including country code)`,
      };
    }
    
    // Country code should be 1-3 digits, rest is the number
    // Minimum: +1 + 7 digits = 8 total (for very short numbers)
    // Maximum: +999 + 12 digits = 15 total (E.164 standard)
    if (digitsOnly.length < 8) {
      return {
        isValid: false,
        error: 'Phone number too short. Include country code (e.g., +1 for US, +91 for India)',
      };
    }
  } else {
    // No country code - validate as local number
    const digitsOnly = cleanedPhone.replace(/[^0-9]/g, '');
    
    if (digitsOnly.length < minLength) {
      return {
        isValid: false,
        error: `Phone number must be at least ${minLength} digits`,
      };
    }
    
    if (digitsOnly.length > maxLength) {
      return {
        isValid: false,
        error: `Phone number must be at most ${maxLength} digits`,
      };
    }
    
    if (!/^\d+$/.test(digitsOnly)) {
      return {
        isValid: false,
        error: 'Phone number must contain only digits',
      };
    }
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Formats a phone number for display
 * @param {string} phone - Phone number to format
 * @param {string} format - Format type ('xxx-xxx-xxxx', '(xxx) xxx-xxxx', etc.)
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phone, format = 'xxx-xxx-xxxx') => {
  const numericPhone = phone.replace(/[^0-9]/g, '');
  
  if (format === 'xxx-xxx-xxxx' && numericPhone.length === 10) {
    return `${numericPhone.slice(0, 3)}-${numericPhone.slice(3, 6)}-${numericPhone.slice(6)}`;
  }
  
  if (format === '(xxx) xxx-xxxx' && numericPhone.length === 10) {
    return `(${numericPhone.slice(0, 3)}) ${numericPhone.slice(3, 6)}-${numericPhone.slice(6)}`;
  }
  
  return numericPhone;
};

/**
 * Cleans a phone number (removes non-numeric characters, keeps +)
 * @param {string} phone - Phone number to clean
 * @returns {string} - Cleaned phone number (digits and + only)
 */
export const cleanPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Keep + if present, remove all other non-numeric characters
  const hasPlus = phone.trim().startsWith('+');
  const cleaned = phone.replace(/[^0-9+]/g, '');
  
  // Ensure + is only at the start
  if (hasPlus && !cleaned.startsWith('+')) {
    return '+' + cleaned.replace(/\+/g, '');
  }
  
  return cleaned.replace(/\+/g, '').replace(/^/, hasPlus ? '+' : '');
};

export default {
  validatePhoneNumber,
  formatPhoneNumber,
  cleanPhoneNumber,
};
