import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface Theme {
  colors: {
    primary: string;
    primaryDark: string;
    secondary: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    placeholder: string;
    disabled: string;
    white: string;
    black: string;
  };
  isDark: boolean;
}

const lightTheme: Theme = {
  colors: {
    primary: '#2563eb',
    primaryDark: '#1e40af',
    secondary: '#667eea',
    background: '#f5f5f5',
    surface: '#ffffff',
    card: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    border: '#dddddd',
    error: '#ff4444',
    success: '#4caf50',
    warning: '#ff9800',
    info: '#2196f3',
    placeholder: '#999999',
    disabled: '#cccccc',
    white: '#ffffff',
    black: '#000000',
  },
  isDark: false,
};

const darkTheme: Theme = {
  colors: {
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    secondary: '#818cf8',
    background: '#121212',
    surface: '#1e1e1e',
    card: '#2a2a2a',
    text: '#ffffff',
    textSecondary: '#b3b3b3',
    border: '#3a3a3a',
    error: '#ff6b6b',
    success: '#66bb6a',
    warning: '#ffa726',
    info: '#42a5f5',
    placeholder: '#888888',
    disabled: '#555555',
    white: '#ffffff',
    black: '#000000',
  },
  isDark: true,
};

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [currentTheme, setCurrentTheme] = useState<Theme>(lightTheme);

  useEffect(() => {
    loadThemePreference();

    // Listen to system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (themeMode === 'auto') {
        setCurrentTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    updateTheme();
  }, [themeMode]);

  const loadThemePreference = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('themeMode');
      if (savedMode) {
        setThemeModeState(savedMode as ThemeMode);
      } else {
        // Default to auto mode
        const systemTheme = Appearance.getColorScheme();
        setCurrentTheme(systemTheme === 'dark' ? darkTheme : lightTheme);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const updateTheme = () => {
    if (themeMode === 'light') {
      setCurrentTheme(lightTheme);
    } else if (themeMode === 'dark') {
      setCurrentTheme(darkTheme);
    } else {
      // Auto mode - follow system preference
      const systemTheme = Appearance.getColorScheme();
      setCurrentTheme(systemTheme === 'dark' ? darkTheme : lightTheme);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('themeMode', mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    if (themeMode === 'light') {
      setThemeMode('dark');
    } else if (themeMode === 'dark') {
      setThemeMode('auto');
    } else {
      setThemeMode('light');
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme,
        themeMode,
        setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export { lightTheme, darkTheme };
