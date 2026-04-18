import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import themeConfig, { darkPalette, lightPalette, spacing, typography } from './theme.js';

const buildTheme = (scheme = 'dark') => {
  const isDark = scheme === 'dark';
  const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;
  const activePalette = isDark ? darkPalette : lightPalette;

  return {
    ...baseTheme,
    roundness: 14,
    colors: {
      ...baseTheme.colors,
      primary: activePalette.primary,
      onPrimary: activePalette.onPrimary,
      primaryContainer: activePalette.primaryContainer,
      onPrimaryContainer: activePalette.onPrimaryContainer,
      secondary: activePalette.secondary,
      onSecondary: activePalette.onSecondary,
      background: activePalette.background,
      surface: activePalette.surface,
      surfaceVariant: activePalette.surfaceVariant,
      onSurface: activePalette.text, 
      onSurfaceVariant: activePalette.subtext,
      outline: activePalette.outline,
      error: activePalette.error,
      success: activePalette.success,
      warning: activePalette.warning,
      info: activePalette.primary,
      text: activePalette.text,
      subtext: activePalette.subtext,
      chartActive: activePalette.chartActive || activePalette.secondary,
      chartInactive: activePalette.chartInactive || (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'),
      chartPrimary: activePalette.chartPrimary,
      chartSecondary: activePalette.chartSecondary,
      outlineVariant: activePalette.outline,
      placeholder: activePalette.placeholder,
      elevation: {
        ...baseTheme.colors.elevation,
        level1: activePalette.surfaceVariant,
        level2: activePalette.border,
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
  palette: darkPalette,
  spacing,
  typography,
  config: themeConfig,
};
