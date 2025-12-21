import { StyleSheet, Dimensions, Platform } from 'react-native';
import { themeAssets } from '../../theme';
import Fonts from '../../../assets/fonts';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_MODAL_HEIGHT = SCREEN_HEIGHT * 0.9;
const CONTENT_MAX_HEIGHT = MAX_MODAL_HEIGHT - 200; // Account for header, padding, footer

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(2,6,23,0.6)',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: 'rgba(20,25,38,1)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: -10 },
    elevation: 4,
    maxHeight: '90%',
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontFamily: Fonts.semibold,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Platform.select({
      android: 'rgba(255,255,255,0.16)', // Increased opacity for Android 14+ visibility
      ios: 'rgba(255,255,255,0.08)',
    }),
    borderWidth: Platform.select({
      android: 1,
      ios: 0,
    }),
    borderColor: Platform.select({
      android: 'rgba(255,255,255,0.2)',
      ios: 'transparent',
    }),
  },
  modalContent: {
    maxHeight: CONTENT_MAX_HEIGHT,
    minHeight: 0,
  },
  modalImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetHandleWrapper: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  sheetFooter: {
    marginTop: 24,
  },
});

export default styles;

