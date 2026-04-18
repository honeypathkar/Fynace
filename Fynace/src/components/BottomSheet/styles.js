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
export const themeColors = {
  primaryText2: palette.subtext,
  accentPrimary: palette.primary,
  text: palette.text,
  primaryBackground: '#000000',
};

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

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent', // Make overlay transparent
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Put color here instead
  },
  modalContainer: {
    backgroundColor: '#0A0A0A', // Premium slightly-lighter-than-black
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
    color: palette.text,
    fontSize: normalize(18),
    fontFamily: Fonts.semibold,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
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
    borderColor: 'rgba(255, 255, 255, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  sheetOptionActive: {
    borderColor: '#d3d3ff',
    backgroundColor: 'rgba(211, 211, 255, 0.1)', // 10% opacity of Lavender
  },
  sheetOptionActionRow: {
    backgroundColor: '#d3d3ff',
    borderColor: '#d3d3ff',
  },
  sheetOptionLabel: {
    color: palette.text,
    fontSize: normalize(16),
    fontFamily: Fonts.medium,
  },
  sheetOptionLabelMuted: {
    color: palette.subtext,
  },
  sheetOptionLabelAction: {
    color: '#000000',
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
    backgroundColor: palette.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successTitle: {
    fontSize: normalize(20),
    fontFamily: Fonts.bold,
    color: palette.text,
    textAlign: 'center',
    marginBottom: spacing.s,
    lineHeight: normalize(28),
  },
  successSubtitle: {
    fontSize: normalize(14),
    fontFamily: Fonts.regular,
    color: palette.subtext,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  continueButton: {
    width: '100%',
    backgroundColor: palette.primary,
    paddingVertical: spacing.l,
    borderRadius: radius.m,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#000000',
    fontSize: normalize(16),
    fontFamily: Fonts.bold,
  },
});

export default styles;
