import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import themeConfig, { palette, spacing, typography } from './theme.js';

const buildTheme = (scheme = 'light') => {
  const baseTheme = scheme === 'dark' ? MD3DarkTheme : MD3LightTheme;

  return {
    ...baseTheme,
    roundness: 14,
    colors: {
      ...baseTheme.colors,
      primary: palette.primary,
      onPrimary: palette.onPrimary,
      primaryContainer: palette.primaryContainer,
      onPrimaryContainer: palette.onPrimaryContainer,
      secondary: palette.secondary,
      onSecondary: palette.onSecondary,
      background: palette.background,
      surface: palette.surface,
      surfaceVariant: palette.surfaceVariant,
      outline: palette.outline,
      error: palette.error,
      success: palette.success,
      warning: palette.warning,
      info: palette.primary,
      outlineVariant: '#CBD5F5',
      elevation: {
        ...baseTheme.colors.elevation,
        level1: '#FFFFFF',
        level2: '#F8FAFF',
      },
    },
    fonts: {
      ...baseTheme.fonts,
      displayLarge: {
        ...baseTheme.fonts.displayLarge,
        fontFamily: typography.family.regular,
      },
      titleLarge: {
        ...baseTheme.fonts.titleLarge,
        fontFamily: typography.family.medium,
      },
      bodyLarge: {
        ...baseTheme.fonts.bodyLarge,
        fontFamily: typography.family.regular,
      },
    },
  };
};

export const buildPaperTheme = buildTheme;

export const themeAssets = {
  palette,
  spacing,
  typography,
  config: themeConfig,
};

