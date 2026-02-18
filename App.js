// Unified App - Root Navigator
import React, { useEffect } from 'react';
import { LogBox, StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UnifiedAuthProvider } from './src/shared/contexts/UnifiedAuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/shared/components/ErrorBoundary';

// Intercept StyleSheet.create to filter out NaN values
const originalCreate = StyleSheet.create;
StyleSheet.create = function (styles) {
  const cleanedStyles = {};
  for (const key in styles) {
    if (styles.hasOwnProperty(key)) {
      const style = styles[key];
      const cleanedStyle = {};
      for (const prop in style) {
        if (style.hasOwnProperty(prop)) {
          const value = style[prop];
          // Filter out NaN values - skip the property entirely if NaN
          if (typeof value === 'number' && isNaN(value)) {
            continue; // Skip NaN values
          }
          // Recursively clean nested objects (like shadowOffset: { width: 0, height: 6 })
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            const cleanedNested = {};
            let hasValidValues = false;
            for (const nestedKey in value) {
              if (value.hasOwnProperty(nestedKey)) {
                const nestedValue = value[nestedKey];
                if (typeof nestedValue === 'number' && isNaN(nestedValue)) {
                  continue; // Skip NaN
                }
                cleanedNested[nestedKey] = nestedValue;
                hasValidValues = true;
              }
            }
            if (hasValidValues) {
              cleanedStyle[prop] = cleanedNested;
            }
          } else {
            cleanedStyle[prop] = value;
          }
        }
      }
      cleanedStyles[key] = cleanedStyle;
    }
  }
  return originalCreate.call(this, cleanedStyles);
};

// Intercept React Native's native bridge to filter NaN values from style objects only
// This catches NaN values in style props before they reach native code
// IMPORTANT: We only clean style objects, not arrays, to preserve argument counts for WebSocketModule, etc.
let nativeBridgeIntercepted = false;
const interceptNativeBridge = () => {
  if (nativeBridgeIntercepted) return true;
  try {
    // Method 1: Intercept BatchedBridge directly (deep import - RN deprecation warning only)
    const BatchedBridge = require('react-native/Libraries/BatchedBridge/BatchedBridge').default;
    if (BatchedBridge && BatchedBridge.enqueueNativeCall) {
      const originalEnqueueNativeCall = BatchedBridge.enqueueNativeCall;
      BatchedBridge.enqueueNativeCall = function(moduleID, methodID, params, onFail, onSucc) {
        const cleanStyleObject = (obj) => {
          if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
          const cleaned = {};
          for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
              const value = obj[key];
              if (typeof value === 'number' && isNaN(value)) continue;
              if (value && typeof value === 'object' && !Array.isArray(value)) {
                const cleanedNested = cleanStyleObject(value);
                if (cleanedNested && Object.keys(cleanedNested).length > 0) cleaned[key] = cleanedNested;
              } else cleaned[key] = value;
            }
          }
          return cleaned;
        };
        let cleanedParams = params;
        if (params && typeof params === 'object' && !Array.isArray(params)) {
          cleanedParams = cleanStyleObject(params);
        } else if (Array.isArray(params)) {
          cleanedParams = params.map(item => (
            item && typeof item === 'object' && !Array.isArray(item) ? cleanStyleObject(item) : item
          ));
        }
        return originalEnqueueNativeCall.call(this, moduleID, methodID, cleanedParams, onFail, onSucc);
      };
      nativeBridgeIntercepted = true;
      return true;
    }
  } catch (error) {
    // Method 1 (BatchedBridge) failed - do not use Method 2.
    // Method 2 called native bridge with only 3 args (moduleID, methodID, params) but native
    // expects 5 (moduleID, methodID, params, onFail, onSucc). That caused launch crash.
  }

  return false;
};

// Try to intercept immediately
interceptNativeBridge();

// Also try after a delay in case modules aren't loaded yet
setTimeout(() => {
  if (!interceptNativeBridge()) {
    console.warn('⚠️ Native bridge interception may not be active');
  }
}, 100);

// Ignore specific warnings to reduce overlay noise
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'VirtualizedLists should never be nested',
  // Ignore animated node errors (these are often harmless cleanup issues)
  'disconnectAnimatedNodeFromView',
  'Animated node',
  // Ignore NativeEventEmitter warnings from @react-native-voice/voice
  'NativeEventEmitter',
  'addListener',
  'removeListeners',
]);

// Global error handler to catch unhandled errors (only if ErrorUtils is available)
// ErrorUtils might not be available in all React Native versions
try {
  const { ErrorUtils } = require('react-native');
  if (ErrorUtils && typeof ErrorUtils.getGlobalHandler === 'function') {
    const originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      if (isFatal) {
        console.error('🚨 Fatal error:', error);
        // You can add crash reporting here (e.g., Sentry, Crashlytics)
      } else {
        console.warn('⚠️ Non-fatal error:', error);
      }
      // Call original handler
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  }
} catch (error) {
  // Silently fail if ErrorUtils is not available - this is optional
  // The app will still work without it
}

// Handle unhandled promise rejections
if (typeof global !== 'undefined' && global.HermesInternal) {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Filter out expected errors
    const errorString = args.join(' ');
    if (!errorString.includes('401') && 
        !errorString.includes('Invalid credentials') &&
        !errorString.includes('BAD_REQUEST_ERROR')) {
      originalConsoleError(...args);
    }
  };
}

export default function App() {
  // Ensure status bar and system UI stay visible (not hidden by any screen)
  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setHidden(false);
    }
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Platform.OS === 'android' ? '#0B0B0C' : undefined}
          translucent={false}
        />
        <UnifiedAuthProvider>
          <RootNavigator />
        </UnifiedAuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

