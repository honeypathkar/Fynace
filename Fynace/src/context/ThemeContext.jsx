import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildPaperTheme } from '../theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', 'system'

  useEffect(() => {
    loadThemeMode();
  }, []);

  const loadThemeMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('user_theme_mode');
      if (savedMode) {
        setThemeMode(savedMode);
      }
    } catch (e) {
      console.error('Failed to load theme mode', e);
    }
  };

  const updateThemeMode = async (mode) => {
    try {
      setThemeMode(mode);
      await AsyncStorage.setItem('user_theme_mode', mode);
    } catch (e) {
      console.error('Failed to save theme mode', e);
    }
  };

  const activeScheme = useMemo(() => {
    if (themeMode === 'system') return systemScheme;
    return themeMode;
  }, [themeMode, systemScheme]);

  const paperTheme = useMemo(() => buildPaperTheme(activeScheme), [activeScheme]);

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode: updateThemeMode, activeScheme, paperTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
