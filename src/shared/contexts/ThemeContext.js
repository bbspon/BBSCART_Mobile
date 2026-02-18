import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'APP_THEME_MODE'; // 'light' | 'dark'

const ThemeContext = createContext({
  mode: 'light',
  isDark: false,
  setMode: () => {},
  toggle: () => {},
  ready: false,
});

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light');
  const [ready, setReady] = useState(true); // Start as ready - no blocking

  useEffect(() => {
    // Load theme in background, don't block rendering
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === 'dark' || saved === 'light') setMode(saved);
      } catch (e) {}
    })();
  }, []);

  const toggle = async () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch (e) {}
  };

  const value = useMemo(
    () => ({
      mode,
      isDark: mode === 'dark',
      setMode: async (nextMode) => {
        const next = nextMode === 'dark' ? 'dark' : 'light';
        setMode(next);
        try {
          await AsyncStorage.setItem(STORAGE_KEY, next);
        } catch (e) {}
      },
      toggle,
      ready,
    }),
    [mode, ready],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
