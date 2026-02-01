import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Button, Text, ActivityIndicator } from 'react-native-paper';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import TextInputField from '../../components/TextInputField';
import GlobalHeader from '../../components/GlobalHeader';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import { OTPInput, HeroSection, authStyles } from '../../components/auth';
import { GOOGLE_CLIENT_ID } from '../../utils/BASE_URL';

const GOOGLE_ICON = require('../../../assets/images/google.png');

const LoginScreen = () => {
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
  const heroPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_CLIENT_ID,
    });
  }, []);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(heroPulse, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(heroPulse, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [heroPulse]);

  const heroTranslate = heroPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

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

      // Step 1: Check if user exists if we don't know yet
      let exists = userExists;
      if (exists === null) {
        exists = await checkUser(email);
        setUserExists(exists);

        // If they don't exist, we show the name field first and stop here
        if (exists === false) {
          setCheckingUser(false);
          return;
        }
      }

      // Step 2: Validate name if it's a new user
      if (userExists === false && !fullName.trim()) {
        setError('Please enter your full name.');
        setCheckingUser(false);
        return;
      }

      // Step 3: Request OTP
      await requestOtp({
        email,
        fullName: userExists === false ? fullName : undefined,
      });
      setOtpSent(true);
      // Focus first OTP input after a short delay
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
        setError('Please enter the complete 4-digit code.');
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
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      if (idToken) {
        setGoogleSigningIn(true);
        await googleLogin(idToken);
        navigation.reset({ index: 0, routes: [{ name: 'AppTabs' }] });
      }
    } catch (err) {
      console.error('Google Sign In Error:', err);
      setError('Google Sign In failed. Please try again.');
    } finally {
      setGoogleSigningIn(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={authStyles.container}>
      <KeyboardAvoidingView
        style={authStyles.keyboardView}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <LinearGradient
          colors={['#0b0f1a', '#0a0f1e', '#070c16']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={authStyles.gradient}
        >
          <GlobalHeader
            backgroundColor="transparent"
            renderRightComponent={() => null}
          />
          <ScrollView
            contentContainerStyle={authStyles.content}
            keyboardShouldPersistTaps="handled"
          >
            <StatusBar
              barStyle="light-content"
              backgroundColor="transparent"
              translucent
            />
            <View style={authStyles.heroContainer}>
              <Animated.View
                style={[
                  authStyles.heroCard,
                  { transform: [{ translateY: heroTranslate }] },
                ]}
              >
                <Text variant="headlineMedium" style={authStyles.heroTitle}>
                  {otpSent ? 'Verification' : 'Welcome to Fynace'}
                </Text>
              </Animated.View>
            </View>

            <View style={authStyles.formCard}>
              {!otpSent ? (
                <>
                  <TextInputField
                    label="Email"
                    value={email}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="Enter your email"
                    editable={!loading}
                    accessory={
                      checkingUser ? (
                        <ActivityIndicator size="small" color="#3A6FF8" />
                      ) : null
                    }
                  />

                  {userExists === false && isValidEmail(email) && (
                    <TextInputField
                      label="Full Name"
                      value={fullName}
                      onChangeText={setFullName}
                      placeholder="Enter your full name"
                      editable={!loading}
                    />
                  )}

                  {error ? (
                    <Text variant="bodyMedium" style={authStyles.error}>
                      {error}
                    </Text>
                  ) : null}

                  <PrimaryButton
                    title={
                      userExists === false && !fullName
                        ? 'Continue'
                        : 'Send OTP'
                    }
                    onPress={handleSendOtp}
                    loading={sendingOtp || checkingUser}
                    style={authStyles.primaryButton}
                    buttonColor="#3A6FF8"
                    disabled={!isValidEmail(email)}
                  />

                  <View style={authStyles.dividerContainer}>
                    <View style={authStyles.dividerLine} />
                    <Text style={authStyles.dividerText}>or</Text>
                    <View style={authStyles.dividerLine} />
                  </View>

                  <PrimaryButton
                    title="Continue with Google"
                    onPress={handleGoogleSignIn}
                    loading={googleSigningIn}
                    style={authStyles.otpButton}
                    buttonColor="#1E293B"
                    leftIcon={
                      <Image
                        source={GOOGLE_ICON}
                        style={{ width: 20, height: 20, marginRight: 8 }}
                        resizeMode="contain"
                      />
                    }
                  />
                </>
              ) : (
                <>
                  <Text variant="bodyMedium" style={authStyles.otpInstructions}>
                    Enter the 4-digit code sent to {email}
                  </Text>

                  <OTPInput
                    otp={otp}
                    setOtp={setOtp}
                    otpInputRefs={otpInputRefs}
                  />

                  {error ? (
                    <Text variant="bodyMedium" style={authStyles.error}>
                      {error}
                    </Text>
                  ) : null}

                  <PrimaryButton
                    title="Verify OTP"
                    onPress={handleVerifyOtp}
                    loading={verifyingOtp}
                    style={authStyles.primaryButton}
                    buttonColor="#3A6FF8"
                    disabled={otp.length !== 4}
                  />

                  <Button
                    mode="text"
                    onPress={() => {
                      setOtpSent(false);
                      setOtp('');
                    }}
                    textColor="#3A6FF8"
                    style={authStyles.backButton}
                  >
                    Change Email
                  </Button>
                </>
              )}
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
