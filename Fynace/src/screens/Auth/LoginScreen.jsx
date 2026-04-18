import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Easing,
  StyleSheet,
  Image,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Text, ActivityIndicator, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import TextInputField from '../../components/TextInputField';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import { OTPInput } from '../../components/auth';
import { GOOGLE_CLIENT_ID, FRONTEND_URL } from '../../utils/BASE_URL';
import Fonts from '../../../assets/fonts';

const GOOGLE_ICON = require('../../../assets/images/google.png');

const LoginScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { checkUser, requestOtp, verifyOtp, googleLogin, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [userExists, setUserExists] = useState(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [googleSigningIn, setGoogleSigningIn] = useState(false);
  const [error, setError] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const otpInputRefs = useRef([]);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_CLIENT_ID,
    });

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isValidEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = val => {
    setEmail(val);
    setError(null);
    setUserExists(null);
  };

  const handleSendOtp = async () => {
    try {
      setError(null);
      if (!isValidEmail(email)) {
        setError('Please enter a valid email address.');
        return;
      }

      setCheckingUser(true);

      let exists = userExists;
      if (exists === null) {
        exists = await checkUser(email);
        setUserExists(exists);
        if (exists === false) {
          setCheckingUser(false);
          return;
        }
      }

      if (userExists === false && !fullName.trim()) {
        setError('Please enter your full name.');
        setCheckingUser(false);
        return;
      }

      setSendingOtp(true);
      await requestOtp({
        email,
        fullName: userExists === false ? fullName : undefined,
      });
      setOtpSent(true);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (apiError) {
      setError(apiError.message || 'Failed to send OTP. Please try again.');
    } finally {
      setCheckingUser(false);
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setError(null);
      if (otp.length !== 4) {
        setError('Please enter the 4-digit code.');
        return;
      }
      setVerifyingOtp(true);
      await verifyOtp({ otp, email });
      navigation.reset({ index: 0, routes: [{ name: 'AppTabs' }] });
    } catch (apiError) {
      setError(apiError.message || 'Invalid OTP. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut().catch(() => {});
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      if (idToken) {
        setGoogleSigningIn(true);
        await googleLogin(idToken);
        navigation.reset({ index: 0, routes: [{ name: 'AppTabs' }] });
      }
    } catch (err) {
      console.error('Google Sign In Error:', err);
      setError('Google Sign In failed.');
    } finally {
      setGoogleSigningIn(false);
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 30,
      paddingTop: 40,
      paddingBottom: 40,
    },
    headerBackBtn: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      marginBottom: 20,
    },
    backBtnText: {
      color: theme.colors.text,
      fontSize: 28,
      fontFamily: Fonts.bold,
    },
    header: {
      alignItems: 'center',
      marginBottom: 60,
    },
    title: {
      fontSize: 40,
      fontFamily: Fonts.bold,
      color: theme.colors.text,
      marginBottom: 12,
    },
    subtitle: {
      fontSize: 18,
      fontFamily: Fonts.medium,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      lineHeight: 28,
    },
    formContainer: {
      width: '100%',
    },
    footerNoteContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 32,
    },
    footerNote: {
      fontSize: 13,
      color: theme.colors.outline,
      fontFamily: Fonts.medium,
    },
    footerLink: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      fontFamily: Fonts.bold,
      textDecorationLine: 'underline',
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 14,
      fontFamily: Fonts.medium,
      marginTop: 8,
      textAlign: 'center',
    },
    actionWrapper: {
      marginTop: 30,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 40,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.outlineVariant,
    },
    dividerText: {
      color: theme.colors.outline,
      fontFamily: Fonts.bold,
      fontSize: 12,
      marginHorizontal: 20,
      letterSpacing: 2,
    },
    googleIcon: {
      width: 22,
      height: 22,
      marginRight: 12,
    },
    backLink: {
      marginTop: 24,
      alignItems: 'center',
    },
    backLinkText: {
      color: theme.colors.secondary,
      fontFamily: Fonts.medium,
      fontSize: 14,
    },
  }), [theme]);

  const isDark = theme.dark;

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      <LinearGradient
        colors={isDark 
          ? ['#000000', '#050505', '#000000'] 
          : [theme.colors.background, theme.colors.surfaceVariant, theme.colors.background]}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity 
              style={styles.headerBackBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backBtnText}>←</Text>
            </TouchableOpacity>

            <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <Text style={styles.title}>Welcome</Text>
              <Text style={styles.subtitle}>
                {otpSent 
                  ? `Enter the code sent to\n${email}` 
                  : 'Enter your details to continue your journey.'}
              </Text>
            </Animated.View>

            <View style={styles.formContainer}>
              {!otpSent ? (
                <>
                  <TextInputField
                    label="Email Address"
                    value={email}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="name@example.com"
                    editable={!loading}
                  />

                  {userExists === false && isValidEmail(email) && (
                    <Animated.View entering={fadeAnim}>
                      <TextInputField
                        label="Full Name"
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="John Doe"
                        editable={!loading}
                      />
                    </Animated.View>
                  )}

                  {error && <Text style={styles.errorText}>{error}</Text>}

                  <View style={styles.actionWrapper}>
                    <PrimaryButton
                      title={userExists === false && !fullName ? 'Continue' : 'Send Code'}
                      onPress={handleSendOtp}
                      loading={sendingOtp || checkingUser}
                      buttonColor={theme.colors.primary}
                      textColor={theme.colors.onPrimary}
                      disabled={!isValidEmail(email)}
                    />
                  </View>

                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <PrimaryButton
                    title="Continue with Google"
                    onPress={handleGoogleSignIn}
                    loading={googleSigningIn}
                    buttonColor={theme.colors.surfaceVariant}
                    textColor={theme.colors.text}
                    leftIcon={
                      <Image source={GOOGLE_ICON} style={styles.googleIcon} resizeMode="contain" />
                    }
                  />
                  
                  <View style={styles.footerNoteContainer}>
                    <Text style={styles.footerNote}>By signing in, you agree to our </Text>
                    <TouchableOpacity onPress={() => 
                      navigation.navigate('WebView', {
                        url: `${FRONTEND_URL}/terms-and-conditions`,
                        title: 'Terms & Conditions',
                      })
                    }>
                      <Text style={styles.footerLink}>Terms of Service</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <OTPInput
                    otp={otp}
                    setOtp={setOtp}
                    otpInputRefs={otpInputRefs}
                  />

                  {error && <Text style={styles.errorText}>{error}</Text>}

                  <View style={styles.actionWrapper}>
                    <PrimaryButton
                      title="Verify Code"
                      onPress={handleVerifyOtp}
                      loading={verifyingOtp}
                      buttonColor={theme.colors.primary}
                      textColor={theme.colors.onPrimary}
                      disabled={otp.length !== 4}
                    />
                  </View>

                  <TouchableOpacity 
                    onPress={() => { setOtpSent(false); setOtp(''); }}
                    style={styles.backLink}
                  >
                    <Text style={styles.backLinkText}>Change email address</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default LoginScreen;
