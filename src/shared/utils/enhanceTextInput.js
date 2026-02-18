// enhanceTextInput.js - Utility to enhance TextInput with auto-scroll
import React from 'react';
import { TextInput } from 'react-native';

/**
 * Enhance a TextInput component with auto-scroll on focus
 * 
 * @param {React.Component} TextInputComponent - TextInput component to enhance
 * @param {Function} scrollHandler - Function to call when input is focused
 * @returns {React.Component} - Enhanced TextInput component
 */
export const enhanceTextInput = (TextInputComponent, scrollHandler) => {
  return React.forwardRef((props, ref) => {
    const handleFocus = (event) => {
      // Call original onFocus if exists
      if (props.onFocus) {
        props.onFocus(event);
      }
      
      // Auto-scroll to input
      if (scrollHandler && event?.target) {
        scrollHandler(event.target);
      }
    };

    return (
      <TextInputComponent
        {...props}
        ref={ref}
        onFocus={handleFocus}
      />
    );
  });
};

export default enhanceTextInput;
