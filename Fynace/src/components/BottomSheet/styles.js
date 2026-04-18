import { StyleSheet, Dimensions, Platform, PixelRatio } from 'react-native';
import Fonts from '../../../assets/fonts';
import { palette } from '../../theme/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Standard normalization function for font scaling
const scale = SCREEN_WIDTH / 375;
export const normalize = size => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Map provided logic to project theme
export const getThemeColors = (theme) => ({
  primaryText2: theme.colors.onSurfaceVariant,
  accentPrimary: theme.colors.primary,
  text: theme.colors.text,
  primaryBackground: theme.colors.background,
});

export const spacing = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  m: 12,
  xxl: 24,
};

export const getStyles = (theme) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    backgroundColor: theme.colors.elevation.level1,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingTop: spacing.s,
    paddingBottom: spacing.xxl,
    minHeight: SCREEN_HEIGHT * 0.3,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.l,
    marginTop: spacing.s,
    paddingHorizontal: spacing.xl,
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: normalize(18),
    fontFamily: Fonts.semibold,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceVariant,
  },
  modalContent: {
    gap: 0,
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  modalContentNoFlex: {
    paddingHorizontal: spacing.xl,
  },
  optionsList: {
    gap: spacing.m,
    marginBottom: spacing.l,
  },
  modalImageContainer: {
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  sheetHandleWrapper: {
    alignItems: 'center',
    paddingVertical: spacing.s,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xl,
  },
  dragHandleArea: {
    backgroundColor: 'transparent',
    paddingBottom: 4,
  },
  sheetHandle: {
    width: 80,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.outlineVariant,
  },
  sheetFooter: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  sheetOption: {
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceVariant,
  },
  sheetOptionActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.dark ? 'rgba(211, 211, 255, 0.1)' : 'rgba(103, 80, 164, 0.08)',
  },
  sheetOptionActionRow: {
    backgroundColor: theme.colors.primaryContainer,
    borderColor: theme.colors.primaryContainer,
  },
  sheetOptionLabel: {
    color: theme.colors.text,
    fontSize: normalize(16),
    fontFamily: Fonts.medium,
  },
  sheetOptionLabelMuted: {
    color: theme.colors.onSurfaceVariant,
  },
  sheetOptionLabelAction: {
    color: theme.colors.onPrimaryContainer,
    fontFamily: Fonts.bold,
  },
  sheetOptionIcon: {
    marginLeft: spacing.s,
  },
  // Success Modal Specific Styles
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  successIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successTitle: {
    fontSize: normalize(20),
    fontFamily: Fonts.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: spacing.s,
    lineHeight: normalize(28),
  },
  successSubtitle: {
    fontSize: normalize(14),
    fontFamily: Fonts.regular,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  continueButton: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    paddingVertical: spacing.l,
    borderRadius: radius.m,
    alignItems: 'center',
  },
  continueButtonText: {
    color: theme.colors.onPrimary,
    fontSize: normalize(16),
    fontFamily: Fonts.bold,
  },
});
