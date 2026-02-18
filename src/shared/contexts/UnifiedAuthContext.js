// UnifiedAuthContext.js - Shared authentication across all apps
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { verifyToken, getCurrentUser } from '../services/unifiedAuthService';

const UnifiedAuthContext = createContext();

// Storage keys
const UNIFIED_AUTH_KEY = 'UNIFIED_AUTH';
const LEGACY_KEYS = {
  bbscart: 'auth_user',
  globalhealth: 'bbsUser',
  thiamobile: { token: 'THIAWORLD_TOKEN', user: 'THIAWORLD_USER' },
};

export const UnifiedAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeApp, setActiveApp] = useState(null); // Track which app user logged in from

  // Initialize: Check for existing auth on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);

      // First, try unified auth key
      const unifiedAuth = await AsyncStorage.getItem(UNIFIED_AUTH_KEY);
      if (unifiedAuth) {
        const parsed = JSON.parse(unifiedAuth);
        if (parsed?.token && parsed?.user) {
          // Validate token with server
          const appName = parsed.activeApp || 'bbscart'; // Default to bbscart if not specified
          const validationResult = await verifyToken(appName, parsed.token);
          
          if (validationResult.success && validationResult.valid) {
            // Token is valid - optionally refresh user data
            try {
              const userResult = await getCurrentUser(appName, parsed.token);
              if (userResult.success && userResult.user) {
                await setUnifiedAuth(parsed.token, userResult.user, appName);
              } else {
                setToken(parsed.token);
                setUser(parsed.user);
                setIsAuthenticated(true);
                setActiveApp(appName);
              }
            } catch (userError) {
              console.warn('Could not refresh user data, using stored:', userError);
              setToken(parsed.token);
              setUser(parsed.user);
              setIsAuthenticated(true);
              setActiveApp(appName);
            }
          } else {
            // Token is invalid or expired - clear auth
            await AsyncStorage.removeItem(UNIFIED_AUTH_KEY);
            await AsyncStorage.multiRemove([
              LEGACY_KEYS.bbscart,
              LEGACY_KEYS.globalhealth,
              LEGACY_KEYS.thiamobile.token,
              LEGACY_KEYS.thiamobile.user,
            ]);
            setIsAuthenticated(false);
            setUser(null);
            setToken(null);
            setActiveApp(null);
          }
          setLoading(false);
          return;
        }
      }

      // Fallback: Check legacy keys and migrate
      await migrateLegacyAuth();

    } catch (error) {
      console.error('Auth initialization error:', error);
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  // Migrate legacy auth keys to unified format
  const migrateLegacyAuth = async () => {
    try {
      // Check BBSCART
      const bbscartAuth = await AsyncStorage.getItem(LEGACY_KEYS.bbscart);
      if (bbscartAuth) {
        const parsed = JSON.parse(bbscartAuth);
        if (parsed?.token) {
          // Validate token before migrating
          const validationResult = await verifyToken('bbscart', parsed.token);
          if (validationResult.success && validationResult.valid) {
            await setUnifiedAuth(parsed.token, parsed.user || {}, 'bbscart');
            return;
          } else {
            // Invalid token - clear it
            await AsyncStorage.removeItem(LEGACY_KEYS.bbscart);
          }
        }
      }

      // Check GlobalHealth
      const globalhealthAuth = await AsyncStorage.getItem(LEGACY_KEYS.globalhealth);
      if (globalhealthAuth) {
        const parsed = JSON.parse(globalhealthAuth);
        if (parsed?.token) {
          // Validate token before migrating
          const validationResult = await verifyToken('globalhealth', parsed.token);
          if (validationResult.success && validationResult.valid) {
            await setUnifiedAuth(parsed.token, parsed.user || {}, 'globalhealth');
            return;
          } else {
            // Invalid token - clear it
            await AsyncStorage.removeItem(LEGACY_KEYS.globalhealth);
          }
        }
      }

      // Check ThiaMobile
      const thiaToken = await AsyncStorage.getItem(LEGACY_KEYS.thiamobile.token);
      const thiaUser = await AsyncStorage.getItem(LEGACY_KEYS.thiamobile.user);
      if (thiaToken) {
        // Validate token before migrating
        const validationResult = await verifyToken('thiamobile', thiaToken);
        if (validationResult.success && validationResult.valid) {
          const userData = thiaUser ? JSON.parse(thiaUser) : {};
          await setUnifiedAuth(thiaToken, userData, 'thiamobile');
          return;
        } else {
          // Invalid token - clear it
          await AsyncStorage.multiRemove([
            LEGACY_KEYS.thiamobile.token,
            LEGACY_KEYS.thiamobile.user,
          ]);
        }
      }

      // No auth found or all tokens invalid
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Legacy auth migration error:', error);
      setIsAuthenticated(false);
    }
  };

  // Set unified auth and sync to all legacy keys for backward compatibility
  const setUnifiedAuth = async (authToken, userData, appName = null) => {
    try {
      const unifiedAuth = {
        token: authToken,
        user: userData,
        activeApp: appName,
        timestamp: Date.now(),
      };

      // Store unified auth
      await AsyncStorage.setItem(UNIFIED_AUTH_KEY, JSON.stringify(unifiedAuth));

      // Sync to legacy keys for backward compatibility
      // BBSCART format
      await AsyncStorage.setItem(
        LEGACY_KEYS.bbscart,
        JSON.stringify({ token: authToken, user: userData })
      );

      // GlobalHealth format
      await AsyncStorage.setItem(
        LEGACY_KEYS.globalhealth,
        JSON.stringify({ token: authToken, user: userData })
      );

      // ThiaMobile format
      await AsyncStorage.setItem(LEGACY_KEYS.thiamobile.token, authToken);
      await AsyncStorage.setItem(
        LEGACY_KEYS.thiamobile.user,
        JSON.stringify(userData)
      );

      // Update state
      setToken(authToken);
      setUser(userData);
      setIsAuthenticated(true);
      setActiveApp(appName);
    } catch (error) {
      console.error('Error setting unified auth:', error);
      throw error;
    }
  };

  // Login function
  const login = useCallback(async (authToken, userData, appName) => {
    try {
      await setUnifiedAuth(authToken, userData, appName);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Logout function - clears all auth data
  const logout = useCallback(async () => {
    try {
      // Clear unified auth
      await AsyncStorage.removeItem(UNIFIED_AUTH_KEY);

      // Clear all legacy keys
      await AsyncStorage.multiRemove([
        LEGACY_KEYS.bbscart,
        LEGACY_KEYS.globalhealth,
        LEGACY_KEYS.thiamobile.token,
        LEGACY_KEYS.thiamobile.user,
      ]);

      // Clear app-specific storage (optional, based on requirements)
      await AsyncStorage.multiRemove([
        'deliveryPincode',
        'assignedStore',
      ]);

      // Reset state
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      setActiveApp(null);

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Update user data
  const updateUser = useCallback(async (updatedUserData) => {
    try {
      const newUser = { ...user, ...updatedUserData };
      await setUnifiedAuth(token, newUser, activeApp);
      return { success: true };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: error.message };
    }
  }, [user, token, activeApp]);

  // Get auth headers for API calls
  const getAuthHeaders = useCallback(() => {
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }, [token]);

  // Check if user is authenticated
  const checkAuth = useCallback(async () => {
    try {
      const unifiedAuth = await AsyncStorage.getItem(UNIFIED_AUTH_KEY);
      if (unifiedAuth) {
        const parsed = JSON.parse(unifiedAuth);
        if (parsed?.token) {
          return { isAuthenticated: true, token: parsed.token, user: parsed.user };
        }
      }
      return { isAuthenticated: false };
    } catch (error) {
      console.error('Check auth error:', error);
      return { isAuthenticated: false };
    }
  }, []);

  const value = {
    // State
    isAuthenticated,
    user,
    token,
    loading,
    activeApp,

    // Actions
    login,
    logout,
    updateUser,
    getAuthHeaders,
    checkAuth,
    initializeAuth,
  };

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

export const useUnifiedAuth = () => {
  const context = useContext(UnifiedAuthContext);
  if (!context) {
    throw new Error('useUnifiedAuth must be used within UnifiedAuthProvider');
  }
  return context;
};

export default UnifiedAuthContext;
