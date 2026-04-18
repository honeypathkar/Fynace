import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import themeConfig, { palette, spacing, typography } from './theme.js';

const buildTheme = (scheme = 'dark') => {
  // Always use DarkTheme base for the "True Black" experience requested by user
  const baseTheme = MD3DarkTheme;

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
      onSurface: palette.text, // Map standard onSurface to our text color
      onSurfaceVariant: palette.subtext,
      outline: palette.outline,
      error: palette.error,
      success: palette.success,
      warning: palette.warning,
      info: palette.primary,
      text: palette.text,
      subtext: palette.subtext,
      chartActive: palette.chartActive || palette.secondary,
      chartInactive: palette.chartInactive || 'rgba(255,255,255,0.15)',
      outlineVariant: palette.outline,
      elevation: {
        ...baseTheme.colors.elevation,
        level1: palette.surfaceVariant,
        level2: palette.border,
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
