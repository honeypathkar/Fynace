import { StyleSheet } from 'react-native';
import Fonts from '../../../assets/fonts';

export const getStyles = (theme) => StyleSheet.create({
  shadowWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    rowGap: 8,
  },
  inputLabel: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 14,
    fontFamily: Fonts.semibold,
    letterSpacing: 0,
    marginBottom: 8,
  },
  inputField: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
    fontFamily: Fonts.regular,
    paddingVertical: 0, // Ensure it fits well in the container
  },
  inputFieldContainer: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceVariant,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
  },
  inputFieldFocused: {
    borderColor: theme.colors.primary,
  },
  inputToggle: {
    paddingLeft: 12,
  },
});


