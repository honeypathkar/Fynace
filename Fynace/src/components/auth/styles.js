import { StyleSheet } from 'react-native';
import { themeAssets } from '../../theme';
import Fonts from '../../../assets/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardView: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    paddingHorizontal: themeAssets.spacing[5],
    paddingBottom: themeAssets.spacing[6],
    paddingTop: themeAssets.spacing[3],
    gap: themeAssets.spacing[4],
  },
  heroContainer: {
    position: 'relative',
    marginBottom: themeAssets.spacing[4],
  },
  heroCard: {
    paddingHorizontal: themeAssets.spacing[2],
    backgroundColor: 'transparent',
  },
  heroTitle: {
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
  },
  formCard: {
    width: '100%',
    gap: 16,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: -8,
  },
  primaryButton: {
    marginTop: themeAssets.spacing[2],
    width: '100%',
  },
  otpButton: {
    marginTop: themeAssets.spacing[2],
    width: '100%',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: themeAssets.spacing[3],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1A1A1A',
  },
  dividerText: {
    marginHorizontal: themeAssets.spacing[2],
    color: '#808080',
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: themeAssets.spacing[2],
    marginVertical: themeAssets.spacing[3],
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    backgroundColor: '#121212',
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: Fonts.bold,
  },
  otpInstructions: {
    color: '#808080',
    textAlign: 'center',
    marginBottom: themeAssets.spacing[2],
    fontFamily: Fonts.regular,
  },
  error: {
    color: '#EF4444',
    textAlign: 'center',
    marginTop: themeAssets.spacing[1],
    fontFamily: Fonts.medium,
  },
  backButton: {
    marginTop: themeAssets.spacing[2],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: themeAssets.spacing[4],
  },
  footerText: {
    color: '#808080',
    fontFamily: Fonts.regular,
  },
  // Signup styles
  headerContainer: {
    alignItems: 'center',
    marginBottom: themeAssets.spacing[5],
    gap: themeAssets.spacing[2],
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: themeAssets.spacing[2],
  },
  title: {
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    color: '#808080',
    textAlign: 'center',
    fontFamily: Fonts.regular,
  },
  formContainer: {
    width: '100%',
    gap: 16,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginTop: themeAssets.spacing[1],
    fontFamily: Fonts.medium,
  },
  signupButton: {
    marginTop: themeAssets.spacing[2],
    width: '100%',
  },
  loginLink: {
    color: '#d3d3ff',
    fontFamily: Fonts.semibold,
  },
});

export default styles;

