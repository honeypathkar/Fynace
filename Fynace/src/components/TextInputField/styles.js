import { StyleSheet } from 'react-native';
import { themeAssets } from '../../theme';
import Fonts from '../../../assets/fonts';

// Build a lightweight adapter so the provided style tokens map to our theme
const theme = {
  colors: {
    textWhite: '#E8F0FF',
    textSubtle: '#A7B3CC',
    textMuted: '#94A3B8',
    secondary: themeAssets.palette.primary,
    inputBackground: 'rgba(255,255,255,0.12)',
    surfaceBadge: 'rgba(255,255,255,0.08)',
    inputBorder: 'rgba(255,255,255,0.18)',
    dividerLight: 'rgba(255,255,255,0.14)',
    sheetBackdrop: 'rgba(2,6,23,0.6)',
    sheetBackground: 'rgba(20,25,38,1)',
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 28,
    xxxl: 32,
  },
  sizes: {
    badge: 36,
  },
  borderRadius: {
    sm: 12,
    md: 14,
    lg: 18,
  },
  borderWidth: {
    hairline: StyleSheet.hairlineWidth,
  },
  fontSizes: {
    sm: 14,
    md: 16,
    lg: 18,
    xxl: 28,
  },
  fontWeights: {
    semibold: 600,
    bold: 800,
  },
  letterSpacing: {
    normal: 0,
    wide: 0.2,
  },
  lineHeights: {
    md: 20,
  },
  shadows: {
    button: {
      color: '#000',
      opacity: 0.2,
      radius: 12,
      offset: { width: 0, height: 8 },
      elevation: 2,
    },
    sheet: {
      color: '#000',
      opacity: 0.25,
      radius: 22,
      offset: { width: 0, height: -10 },
      elevation: 4,
    },
  },
};

const styles = StyleSheet.create({
  shadowWrapper: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    shadowColor: theme.shadows.button.color,
    shadowOpacity: theme.shadows.button.opacity,
    shadowRadius: theme.shadows.button.radius,
    shadowOffset: theme.shadows.button.offset,
    elevation: theme.shadows.button.elevation,
    borderWidth: theme.borderWidth.hairline,
  },
  gradient: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xxxl,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    rowGap: theme.spacing.xs,
  },
  inputLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.sm,
    fontFamily: Fonts.semibold,
    letterSpacing: theme.letterSpacing.normal,
    marginBottom: theme.spacing.xs,
  },
  inputField: {
    flex: 1,
    color: theme.colors.textWhite,
    fontSize: theme.fontSizes.md,
  },
  inputFieldContainer: {
    width: '100%',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.inputBackground,
    color: theme.colors.textWhite,
    borderWidth: theme.borderWidth.hairline,
    borderColor: theme.colors.inputBorder,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: theme.spacing.sm,
  },
  inputFieldFocused: {
    borderColor: theme.colors.secondary,
  },
  inputToggle: {
    paddingLeft: theme.spacing.sm,
  },
});

export default styles;


