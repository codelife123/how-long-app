import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DARK_COLORS,
  ZEN_COLORS,
  DARK_SHADOWS,
  ZEN_SHADOWS,
  ThemeColors,
  ThemeShadows,
} from './theme';

export type ThemeMode = 'dark' | 'zen';

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  shadows: ThemeShadows;
  toggleMode: () => void;
}

const STORAGE_KEY = '@howlong_theme';

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'dark',
  colors: DARK_COLORS,
  shadows: DARK_SHADOWS,
  toggleMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'zen' || stored === 'dark') {
        setMode(stored);
      }
    });
  }, []);

  const toggleMode = () => {
    const next: ThemeMode = mode === 'dark' ? 'zen' : 'dark';
    setMode(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  };

  const colors = mode === 'dark' ? DARK_COLORS : ZEN_COLORS;
  const shadows = mode === 'dark' ? DARK_SHADOWS : ZEN_SHADOWS;

  return (
    <ThemeContext.Provider value={{ mode, colors, shadows, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
