import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Light Theme Colors
const lightTheme = {
  mode: 'light',
  colors: {
    // Primary Colors
    primary: '#3B82F6',       // Blue 500
    primaryLight: '#60A5FA',  // Blue 400
    primaryDark: '#2563EB',   // Blue 600
    
    // Secondary Colors
    secondary: '#8B5CF6',     // Purple 500
    secondaryLight: '#A78BFA', // Purple 400
    secondaryDark: '#7C3AED', // Purple 600
    
    // Accent Colors
    success: '#10B981',       // Green 500
    warning: '#F59E0B',       // Amber 500
    error: '#EF4444',         // Red 500
    info: '#06B6D4',          // Cyan 500
    
    // Background Colors
    background: '#FFFFFF',    // White
    backgroundSecondary: '#F9FAFB', // Gray 50
    backgroundTertiary: '#F3F4F6',  // Gray 100
    
    // Surface Colors
    surface: '#FFFFFF',       // White
    surfaceSecondary: '#F9FAFB', // Gray 50
    card: '#FFFFFF',          // White
    
    // Text Colors
    text: '#111827',          // Gray 900
    textSecondary: '#6B7280', // Gray 500
    textTertiary: '#9CA3AF',  // Gray 400
    textOnPrimary: '#FFFFFF', // White
    textOnSecondary: '#FFFFFF', // White
    
    // Border Colors
    border: '#E5E7EB',        // Gray 200
    borderSecondary: '#D1D5DB', // Gray 300
    
    // Shadow
    shadow: '#000000',
    
    // Status Bar
    statusBarStyle: 'dark-content',
    statusBarBackgroundColor: '#FFFFFF',
    
    // Navigation
    navigationBackground: '#FFFFFF',
    navigationText: '#111827',
    
    // Input
    inputBackground: '#F9FAFB',
    inputBorder: '#D1D5DB',
    inputText: '#111827',
    placeholder: '#9CA3AF',
  }
};

// Dark Theme Colors
const darkTheme = {
  mode: 'dark',
  colors: {
    // Primary Colors
    primary: '#60A5FA',       // Blue 400
    primaryLight: '#93C5FD',  // Blue 300
    primaryDark: '#3B82F6',   // Blue 500
    
    // Secondary Colors
    secondary: '#A78BFA',     // Purple 400
    secondaryLight: '#C4B5FD', // Purple 300
    secondaryDark: '#8B5CF6', // Purple 500
    
    // Accent Colors
    success: '#34D399',       // Green 400
    warning: '#FBBF24',       // Amber 400
    error: '#F87171',         // Red 400
    info: '#22D3EE',          // Cyan 400
    
    // Background Colors
    background: '#111827',    // Gray 900
    backgroundSecondary: '#1F2937', // Gray 800
    backgroundTertiary: '#374151',  // Gray 700
    
    // Surface Colors
    surface: '#1F2937',       // Gray 800
    surfaceSecondary: '#374151', // Gray 700
    card: '#1F2937',          // Gray 800
    
    // Text Colors
    text: '#F9FAFB',          // Gray 50
    textSecondary: '#D1D5DB', // Gray 300
    textTertiary: '#9CA3AF',  // Gray 400
    textOnPrimary: '#111827', // Gray 900
    textOnSecondary: '#111827', // Gray 900
    
    // Border Colors
    border: '#374151',        // Gray 700
    borderSecondary: '#4B5563', // Gray 600
    
    // Shadow
    shadow: '#000000',
    
    // Status Bar
    statusBarStyle: 'light-content',
    statusBarBackgroundColor: '#111827',
    
    // Navigation
    navigationBackground: '#1F2937',
    navigationText: '#F9FAFB',
    
    // Input
    inputBackground: '#374151',
    inputBorder: '#4B5563',
    inputText: '#F9FAFB',
    placeholder: '#9CA3AF',
  }
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system');
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    if (themeMode === 'system') {
      setIsDark(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, themeMode]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@schedax_theme_mode');
      if (savedTheme) {
        setThemeMode(savedTheme);
        if (savedTheme === 'light') {
          setIsDark(false);
        } else if (savedTheme === 'dark') {
          setIsDark(true);
        } else {
          setIsDark(systemColorScheme === 'dark');
        }
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const saveThemePreference = async (mode) => {
    try {
      await AsyncStorage.setItem('@schedax_theme_mode', mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const setTheme = (mode) => {
    setThemeMode(mode);
    saveThemePreference(mode);
    
    if (mode === 'light') {
      setIsDark(false);
    } else if (mode === 'dark') {
      setIsDark(true);
    } else {
      setIsDark(systemColorScheme === 'dark');
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{
      theme,
      isDark,
      themeMode,
      setTheme,
      systemColorScheme
    }}>
      <StatusBar 
        barStyle={theme.colors.statusBarStyle}
        backgroundColor={theme.colors.statusBarBackgroundColor}
      />
      {children}
    </ThemeContext.Provider>
  );
};
