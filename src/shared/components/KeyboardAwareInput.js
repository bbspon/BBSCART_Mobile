// KeyboardAwareInput.js - TextInput wrapper with auto-scroll support
import React, { useRef } from 'react';
import { TextInput, Platform } from 'react-native';
import { useKeyboardAware } from '../contexts/KeyboardAwareContext';

/**
 * KeyboardAwareInput - Enhanced TextInput that automatically scrolls into view
 * 
 * This component wraps TextInput and provides automatic scrolling when focused.
 * Must be used inside KeyboardAwareContainer to work properly.
 * 
 * Usage:
 * ```javascript
 * <KeyboardAwareInput
 *   placeholder="Enter text"
 *   value={value}
 *   onChangeText={setValue}
 * />
 * ```
 * 
 * @param {Object} props - All TextInput props
 */
export const KeyboardAwareInput = React.forwardRef((props, ref) => {
  const inputRef = useRef(null);
  const combinedRef = ref || inputRef;
  const { scrollToInput } = useKeyboardAware() || {};

  const handleFocus = (event) => {
    // Call original onFocus if provided
    if (props.onFocus) {
      props.onFocus(event);
    }

    // Auto-scroll to input ONLY if it would be hidden by keyboard
    // The scrollToInput function will check if scrolling is needed
    // ✅ FIX: Extract target before setTimeout to avoid synthetic event pooling issue
    const target = event?.target || event?.nativeEvent?.target;
    if (scrollToInput && target) {
      // Persist the event to prevent React from nullifying it
      if (event.persist) {
        event.persist();
      }
      // Wait for keyboard to appear, then check if scrolling is needed
      setTimeout(() => {
        scrollToInput(target);
      }, Platform.OS === 'ios' ? 150 : 300);
    }
  };

  return (
    <TextInput
      {...props}
      ref={combinedRef}
      onFocus={handleFocus}
    />
  );
});

KeyboardAwareInput.displayName = 'KeyboardAwareInput';

export default KeyboardAwareInput;
