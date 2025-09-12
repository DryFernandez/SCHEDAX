import { StyleSheet } from 'react-native';

// Helper function to create theme-aware styles
export const createThemedStyles = (theme) => {
  return StyleSheet.create({
    // Container Styles
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    containerPadded: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 16,
    },
    containerSecondary: {
      flex: 1,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    
    // Card Styles
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: theme.mode === 'light' ? 0.1 : 0.3,
      shadowRadius: 3,
      elevation: 3,
      borderWidth: theme.mode === 'dark' ? 1 : 0,
      borderColor: theme.colors.border,
    },
    cardSecondary: {
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    
    // Text Styles
    textPrimary: {
      color: theme.colors.text,
      fontSize: 16,
    },
    textSecondary: {
      color: theme.colors.textSecondary,
      fontSize: 14,
    },
    textTertiary: {
      color: theme.colors.textTertiary,
      fontSize: 12,
    },
    textTitle: {
      color: theme.colors.text,
      fontSize: 24,
      fontWeight: 'bold',
    },
    textSubtitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: '600',
    },
    textCaption: {
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
    
    // Button Styles
    buttonPrimary: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonSecondary: {
      backgroundColor: theme.colors.secondary,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonOutline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: theme.colors.textOnPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    buttonOutlineText: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    
    // Input Styles
    input: {
      backgroundColor: theme.colors.inputBackground,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      color: theme.colors.inputText,
    },
    inputFocused: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
    
    // Header Styles
    header: {
      backgroundColor: theme.colors.primary,
      paddingTop: 48,
      paddingBottom: 24,
      paddingHorizontal: 20,
    },
    headerTitle: {
      color: theme.colors.textOnPrimary,
      fontSize: 20,
      fontWeight: 'bold',
    },
    headerSubtitle: {
      color: theme.colors.textOnPrimary,
      fontSize: 14,
      opacity: 0.9,
      marginTop: 4,
    },
    
    // List Styles
    listItem: {
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    listItemLast: {
      borderBottomWidth: 0,
    },
    
    // Separator Styles
    separator: {
      height: 1,
      backgroundColor: theme.colors.border,
    },
    
    // Badge/Tag Styles
    badge: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 4,
      paddingHorizontal: 8,
      alignSelf: 'flex-start',
    },
    badgeText: {
      color: theme.colors.textOnPrimary,
      fontSize: 12,
      fontWeight: '600',
    },
    
    // Navigation Styles
    drawerBackground: {
      backgroundColor: theme.colors.navigationBackground,
    },
    drawerItemText: {
      color: theme.colors.navigationText,
    },
    
    // Loading Styles
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    loadingText: {
      color: theme.colors.textSecondary,
      fontSize: 16,
      marginTop: 16,
    },

    // Statistics Screen Styles
    sectionTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: '600',
    },
    
    // Selection Buttons
    selectionButton: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    selectedButton: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
    },
    selectionIcon: {
      fontSize: 32,
      marginBottom: 8,
    },
    selectionTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    selectionDescription: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      textAlign: 'center',
    },
    selectedText: {
      color: theme.colors.primary,
    },

    // Division Buttons
    divisionButton: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      width: '48%',
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    selectedDivisionButton: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
    },
    divisionIcon: {
      fontSize: 24,
      marginBottom: 8,
    },
    divisionTitle: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
    },
    selectedDivisionText: {
      color: theme.colors.primary,
    },

    // Input Group
    inputGroup: {
      marginBottom: 20,
    },
    inputLabel: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 8,
    },
    textInput: {
      backgroundColor: theme.colors.inputBackground,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 16,
      fontSize: 16,
      color: theme.colors.inputText,
    },
    inputHelper: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      marginTop: 4,
    },

    // Primary and Secondary Buttons
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });
};

// Color utility functions
export const getThemeColors = (theme) => theme.colors;

// Opacity helpers
export const withOpacity = (color, opacity) => {
  return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
};

// Status colors based on theme
export const getStatusColor = (theme, status) => {
  switch (status) {
    case 'success':
      return theme.colors.success;
    case 'warning':
      return theme.colors.warning;
    case 'error':
      return theme.colors.error;
    case 'info':
      return theme.colors.info;
    default:
      return theme.colors.primary;
  }
};
