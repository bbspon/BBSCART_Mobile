// unifiedAuthService.js - Unified authentication service for all apps
import axios from 'axios';

// API endpoints for each app
const API_ENDPOINTS = {
  bbscart: {
    base: 'https://bbscart.com/api',
    login: '/auth/login',
    signup: '/auth/register',
    me: '/auth/me',
  },
  globalhealth: {
    base: 'https://healthcare.bbscart.com/api',
    login: '/auth/login',
    signup: '/auth/signup',
    me: '/auth/me',
  },
  thiamobile: {
    base: 'https://thiaworld.bbscart.com/api',
    login: '/auth/login',
    signup: '/auth/signup',
    me: '/auth/me',
  },
};

/**
 * Unified login function
 * @param {string} appName - 'bbscart' | 'globalhealth' | 'thiamobile'
 * @param {object} credentials - { email?, phone?, password }
 * @returns {Promise<{success: boolean, token?: string, user?: object, error?: string}>}
 */
export const unifiedLogin = async (appName, credentials) => {
  try {
    const endpoint = API_ENDPOINTS[appName];
    if (!endpoint) {
      throw new Error(`Invalid app name: ${appName}`);
    }

    const { email, phone, password, otp } = credentials;

    // Validate credentials
    if (!password && !otp) {
      throw new Error('Password or OTP is required');
    }

    if (!email && !phone) {
      throw new Error('Email or phone is required');
    }

    // Build payload based on app requirements
    const payload = { password };
    
    if (email) payload.email = email;
    if (phone) payload.phone = phone;
    if (otp) payload.otp = otp;

    // Add app-specific fields
    if (appName === 'thiamobile') {
      payload.createdFrom = 'thiaworld';
    }

    // Make API call
    const response = await fetch(`${endpoint.base}${endpoint.login}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Login failed');
    }

    if (!data.token) {
      throw new Error('Token not received from server');
    }

    // Extract user data
    const user = data.user || {
      name: data.name || '',
      email: email || data.email || '',
      phone: phone || data.phone || '',
      ...data,
    };

    return {
      success: true,
      token: data.token,
      user,
    };
  } catch (error) {
    // Only log unexpected errors, not invalid credentials (which is expected user behavior)
    const errorMessage = error.message || 'Login failed';
    if (!errorMessage.toLowerCase().includes('invalid') && 
        !errorMessage.toLowerCase().includes('credential') &&
        !errorMessage.toLowerCase().includes('unauthorized')) {
      console.error(`Unified login error (${appName}):`, error);
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Unified signup function
 * @param {string} appName - 'bbscart' | 'globalhealth' | 'thiamobile'
 * @param {object} userData - Signup form data
 * @returns {Promise<{success: boolean, token?: string, user?: object, error?: string}>}
 */
export const unifiedSignup = async (appName, userData) => {
  try {
    const endpoint = API_ENDPOINTS[appName];
    if (!endpoint) {
      throw new Error(`Invalid app name: ${appName}`);
    }

    // Build payload
    const payload = { ...userData };

    // Add app-specific fields
    if (appName === 'thiamobile') {
      payload.createdFrom = 'thiaworld';
    }

    // Make API call
    const response = await fetch(`${endpoint.base}${endpoint.signup}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

let data;

const text = await response.text();

try {
  data = JSON.parse(text);
} catch (err) {
  console.log("❌ Non-JSON response:", text);
  throw new Error("Server did not return valid JSON");
}

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Signup failed');
    }

   // If backend does not return token, fallback to login
if (!data.token) {
  return {
    success: true,
    requiresLogin: true,
    user: data.user,
  };
}

    // Extract user data
    const user = data.user || {
      name: data.name || userData.name || '',
      email: data.email || userData.email || '',
      phone: data.phone || userData.phone || '',
      ...data,
    };

    return {
      success: true,
      token: data.token,
      user,
    };
  } catch (error) {
    console.error(`Unified signup error (${appName}):`, error);
    return {
      success: false,
      error: error.message || 'Signup failed',
    };
  }
};

/**
 * Get current user info
 * @param {string} appName - 'bbscart' | 'globalhealth' | 'thiamobile'
 * @param {string} token - Auth token
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const getCurrentUser = async (appName, token) => {
  try {
    const endpoint = API_ENDPOINTS[appName];
    if (!endpoint) {
      throw new Error(`Invalid app name: ${appName}`);
    }

    if (!token) {
      throw new Error('Token is required');
    }

    const response = await axios.get(`${endpoint.base}${endpoint.me}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      success: true,
      user: response.data,
    };
  } catch (error) {
    if (error.response?.status === 401) {
      return {
        success: false,
        error: 'Token expired or invalid',
        isUnauthorized: true,
      };
    }
    console.error(`Get current user error (${appName}):`, error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to get user info',
    };
  }
};

/**
 * Verify token validity
 * @param {string} appName - 'bbscart' | 'globalhealth' | 'thiamobile'
 * @param {string} token - Auth token
 * @returns {Promise<{success: boolean, valid?: boolean, error?: string}>}
 */
export const verifyToken = async (appName, token) => {
  try {
    const result = await getCurrentUser(appName, token);
    return {
      success: true,
      valid: result.success,
      // Include isUnauthorized flag to distinguish expired tokens from other errors
      isUnauthorized: result.isUnauthorized || false,
    };
  } catch (error) {
    return {
      success: false,
      valid: false,
      error: error.message,
    };
  }
};

export default {
  unifiedLogin,
  unifiedSignup,
  getCurrentUser,
  verifyToken,
  API_ENDPOINTS,
};
