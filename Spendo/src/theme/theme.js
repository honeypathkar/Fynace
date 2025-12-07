export const palette = {
  primary: '#3A6FF8', // Blue from Login button
  onPrimary: '#FFFFFF',
  primaryContainer: '#1E293B', // Darker blue/slate
  onPrimaryContainer: '#FFFFFF',
  secondary: '#F97316', // Orange
  onSecondary: '#FFFFFF',
  background: '#0F172A', // Dark background from Login screen
  surface: '#1E293B', // Card background
  surfaceVariant: '#334155', // Input fields background
  outline: '#475569',
  success: '#22C55E',
  warning: '#FACC15',
  error: '#EF4444',
  text: '#F8FAFC', // White/Light text
  subtext: '#94A3B8', // Gray text
  placeholder: '#64748B',
  border: '#334155',
};

export const spacing = [0, 4, 8, 12, 16, 20, 24, 32];

export const typography = {
  family: {
    regular: 'System',
    medium: 'System',
    light: 'System',
    thin: 'System',
  },
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 20,
    xl: 24,
    display: 32,
  },
};

export const themeAssets = {
  palette,
  spacing,
  typography,
};

export default {
  palette,
  spacing,
  typography,
  themeAssets,
};

