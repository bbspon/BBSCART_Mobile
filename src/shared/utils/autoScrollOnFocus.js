// autoScrollOnFocus.js - Utility to automatically add scroll behavior to TextInputs
import React from 'react';
import { TextInput } from 'react-native';
import { useKeyboardAware } from '../contexts/KeyboardAwareContext';

/**
 * HOC to enhance TextInput with auto-scroll on focus
 * This automatically adds onFocus handler that scrolls if input would be hidden
 */
export const withAutoScroll = (InputComponent) => {
  return React.forwardRef((props, ref) => {
    const { scrollToInput } = useKeyboardAware() || {};

    const handleFocus = (event) => {
      // Call original onFocus if exists
      if (props.onFocus) {
        props.onFocus(event);
      }

      // Auto-scroll ONLY if input would be hidden by keyboard
      if (scrollToInput && event?.target) {
        // Wait for keyboard to appear, then check if scrolling is needed
        setTimeout(() => {
          scrollToInput(event.target);
        }, 300);
      }
    };

    return (
      <InputComponent
        {...props}
        ref={ref}
        onFocus={handleFocus}
      />
    );
  });
};

export default withAutoScroll;
