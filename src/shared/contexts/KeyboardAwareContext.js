// KeyboardAwareContext.js - Context for keyboard-aware scrolling
import React, { createContext, useContext } from 'react';

const KeyboardAwareContext = createContext(null);

export const KeyboardAwareProvider = ({ children, scrollViewRef, extraScrollHeight = 20, scrollToInput }) => {
  const value = {
    scrollViewRef,
    scrollToInput,
    extraScrollHeight,
  };

  return (
    <KeyboardAwareContext.Provider value={value}>
      {children}
    </KeyboardAwareContext.Provider>
  );
};

export const useKeyboardAware = () => {
  const context = useContext(KeyboardAwareContext);
  return context;
};

export default KeyboardAwareContext;
