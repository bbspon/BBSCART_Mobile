import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Default theme values
const defaultTheme = {
  theme: 'light',
  isDark: false,
  colors: {
    background: '#fdfaf5',
    surface: '#ffffff',
    text: '#000000',
    textSecondary: '#666666',
    border: '#e0e0e0',
    header: '#ffffff',
    card: '#ffffff',
    primary: '#B8860B',
    secondary: '#ffe082',
    error: '#d32f2f',
    success: '#388e3c',
  },
  toggleTheme: () => {},
  setTheme: () => {},
  isLoading: false,
};

// ✅ Create context with default value to prevent errors
const ThemeContext = createContext(defaultTheme);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('THIAWORLD_THEME');
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setTheme(savedTheme);
        }
      } catch (error) {
        console.log('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  // Save theme to storage when it changes
  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('THIAWORLD_THEME', newTheme);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const setThemeValue = async (newTheme) => {
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('THIAWORLD_THEME', newTheme);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const isDark = theme === 'dark';

  const colors = {
    light: {
      background: '#fdfaf5',
      surface: '#ffffff',
      text: '#000000',
      textSecondary: '#666666',
      border: '#e0e0e0',
      header: '#ffffff',
      card: '#ffffff',
      primary: '#B8860B',
      secondary: '#ffe082',
      error: '#d32f2f',
      success: '#388e3c',
    },
    dark: {
      background: '#121212',
      surface: '#1e1e1e',
      text: '#ffffff',
      textSecondary: '#b0b0b0',
      border: '#333333',
      header: '#1e1e1e',
      card: '#2a2a2a',
      primary: '#DAA520',
      secondary: '#8B6914',
      error: '#f44336',
      success: '#4caf50',
    },
  };

  const currentColors = colors[theme];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        colors: currentColors,
        toggleTheme,
        setTheme: setThemeValue,
        isLoading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  // ✅ Context will always have a value (either from Provider or defaultTheme)
  // Since we provided defaultTheme to createContext, context will never be null
  const context = useContext(ThemeContext);
  return context;
};
