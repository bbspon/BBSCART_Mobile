// keyboardUtils.js - Utility functions for keyboard handling
import { Keyboard, Platform } from 'react-native';

/**
 * Dismiss keyboard programmatically
 */
export const dismissKeyboard = () => {
  Keyboard.dismiss();
};

/**
 * Check if keyboard is currently visible
 * Note: This is a simple check, use useKeyboard hook for real-time state
 */
export const isKeyboardVisible = () => {
  // This is a helper function, actual state should be tracked via useKeyboard hook
  return false; // Placeholder - use hook for actual state
};

/**
 * Get keyboard dismiss behavior based on platform
 */
export const getKeyboardBehavior = () => {
  return Platform.OS === 'ios' ? 'padding' : 'height';
};

/**
 * Get default keyboard vertical offset
 */
export const getKeyboardOffset = (headerHeight = 0) => {
  return Platform.OS === 'ios' ? headerHeight : 0;
};

export default {
  dismissKeyboard,
  isKeyboardVisible,
  getKeyboardBehavior,
  getKeyboardOffset,
};
