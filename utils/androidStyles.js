// Android-compatible styles utility
import { StyleSheet } from 'react-native';

export const androidStyles = StyleSheet.create({
  // Gradient alternatives for Android compatibility
  blueGradient: {
    backgroundColor: '#3b82f6', // Primary blue
  },
  purpleGradient: {
    backgroundColor: '#8b5cf6', // Primary purple
  },
  greenGradient: {
    backgroundColor: '#10b981', // Primary green
  },
  blueToPurpleGradient: {
    backgroundColor: '#6366f1', // Blend of blue and purple
  },
  purpleToPinkGradient: {
    backgroundColor: '#a855f7', // Blend of purple and pink
  },
  greenToBlueGradient: {
    backgroundColor: '#059669', // Blend of green and blue
  },
  
  // Shadow alternatives for Android
  cardShadow: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  // Border alternatives
  roundedBorder: {
    borderRadius: 12,
  },
  roundedLarge: {
    borderRadius: 16,
  },
  roundedXL: {
    borderRadius: 20,
  },
  
  // Text styles that work well on Android
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  bodyText: {
    fontSize: 16,
    color: '#4b5563',
  },
  captionText: {
    fontSize: 14,
    color: '#6b7280',
  }
});

// Color constants for consistent theming
export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

// Helper function to get Android-safe gradient background
export const getGradientBackground = (type) => {
  switch (type) {
    case 'blue-purple':
      return { backgroundColor: colors.primary[500] };
    case 'purple-pink':
      return { backgroundColor: colors.secondary[500] };
    case 'green-blue':
      return { backgroundColor: colors.success };
    default:
      return { backgroundColor: colors.primary[500] };
  }
};

export default androidStyles;
