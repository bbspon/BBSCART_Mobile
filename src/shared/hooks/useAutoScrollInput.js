// useAutoScrollInput.js - Hook to make any TextInput auto-scroll when focused
import { useRef } from 'react';
import { useKeyboardAware } from '../contexts/KeyboardAwareContext';
import { Platform } from 'react-native';

/**
 * useAutoScrollInput - Hook to enable auto-scroll for TextInput
 * 
 * Usage:
 * ```javascript
 * const inputRef = useAutoScrollInput();
 * 
 * <TextInput
 *   ref={inputRef}
 *   // ... other props
 * />
 * ```
 * 
 * @returns {RefObject} - Ref to attach to TextInput
 */
export const useAutoScrollInput = () => {
  const inputRef = useRef(null);
  const { scrollToInput } = useKeyboardAware() || {};

  // Enhanced ref that auto-scrolls on focus
  const enhancedRef = useRef({
    current: null,
    focus: (...args) => {
      if (inputRef.current?.focus) {
        inputRef.current.focus(...args);
      }
      // Auto-scroll after focus
      if (scrollToInput && inputRef.current) {
        setTimeout(() => {
          scrollToInput(inputRef);
        }, Platform.OS === 'ios' ? 50 : 100);
      }
    },
    blur: (...args) => {
      if (inputRef.current?.blur) {
        inputRef.current.blur(...args);
      }
    },
    clear: (...args) => {
      if (inputRef.current?.clear) {
        inputRef.current.clear(...args);
      }
    },
    isFocused: () => {
      return inputRef.current?.isFocused?.() || false;
    },
    setNativeProps: (...args) => {
      if (inputRef.current?.setNativeProps) {
        inputRef.current.setNativeProps(...args);
      }
    },
  });

  // Set the actual ref
  enhancedRef.current.current = inputRef.current;

  return inputRef;
};

export default useAutoScrollInput;
