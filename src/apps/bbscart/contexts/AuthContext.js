// AuthContext.js - BBSCART Local Auth Context (synced with UnifiedAuthContext)
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  // This syncs with UnifiedAuthContext for backward compatibility
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check unified auth (priority)
        const unifiedAuth = await AsyncStorage.getItem("UNIFIED_AUTH");
        if (unifiedAuth) {
          const parsed = JSON.parse(unifiedAuth);
          if (parsed?.token) {
            setIsLoggedIn(true);
            setLoading(false);
            return;
          }
        }

        // Fallback to legacy auth_user key
        const stored = await AsyncStorage.getItem("auth_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          // Check if token exists and is valid
          if (parsed?.token) {
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.log("Auth check error:", err);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for changes to unified auth
    const checkUnifiedAuth = async () => {
      try {
        const unifiedAuth = await AsyncStorage.getItem("UNIFIED_AUTH");
        if (unifiedAuth) {
          const parsed = JSON.parse(unifiedAuth);
          setIsLoggedIn(!!parsed?.token);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        // Ignore errors
      }
    };

    // Check every second for unified auth changes (simple polling)
    // This ensures local AuthContext stays in sync with UnifiedAuthContext
    const interval = setInterval(checkUnifiedAuth, 1000);

    return () => clearInterval(interval);
  }, []);

  const login = () => {
    setIsLoggedIn(true);
  };

  const logout = async () => {
    try {
      // Clear all storage
 await AsyncStorage.multiRemove([
  "UNIFIED_AUTH",          // ⭐ CRITICAL FIX
  "auth_user",
  "deliveryPincode",
  "assignedStore",
]);
      setIsLoggedIn(false);
    } catch (err) {
      console.log("Logout error:", err);
      setIsLoggedIn(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
