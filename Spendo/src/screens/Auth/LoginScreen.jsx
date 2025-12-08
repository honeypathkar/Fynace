import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Button, Text } from 'react-native-paper';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextInputField from '../../components/TextInputField';
import GlobalHeader from '../../components/GlobalHeader';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import { OTPInput, HeroSection, authStyles } from '../../components/auth';

const StageChip = ({ active, icon: Icon, label }) => (
  <Chip
    icon={(props) => <Icon {...props} size={16} />}
    compact
    mode={active ? 'flat' : 'outlined'}
    style={[styles.stageChip, active ? styles.stageChipActive : null]}>
    {label}
  </Chip>
);

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login, requestOtp, verifyOtp, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [error, setError] = useState(null);
  const [otpMode, setOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const otpInputRefs = useRef([]);
  const heroPulse = useRef(new Animated.Value(0)).current;

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
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [heroPulse]);

  const heroTranslate = heroPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    try {
      setError(null);
      if (!email.trim() || !password.trim()) {
        setError('Please enter both email and password.');
        return;
      }
      await login({ email, password });
      navigation.reset({ index: 0, routes: [{ name: 'AppTabs' }] });
    } catch (apiError) {
      setError(apiError.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleSendOtp = async () => {
    try {
      setError(null);
      if (!isValidEmail(email)) {
        setError('Please enter a valid email address.');
        return;
      }
      await requestOtp({ email });
      setOtpSent(true);
      setOtpMode(true);
      // Focus first OTP input after a short delay
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (apiError) {
      setError(apiError.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setError(null);
      if (otp.length !== 6) {
        setError('Please enter the complete 6-digit code.');
        return;
      }
      await verifyOtp({ otp, email });
      navigation.reset({ index: 0, routes: [{ name: 'AppTabs' }] });
    } catch (apiError) {
      setError(apiError.message || 'Invalid OTP. Please try again.');
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
          // showLeftIcon
          // leftIconColor="#F8FAFC"
          // onLeftIconPress={() => navigation.goBack()}
          renderRightComponent={() => null}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          <View style={styles.heroContainer}>
            <Animated.View style={[styles.heroCard, { transform: [{ translateY: heroTranslate }] }]}>
              <Text variant="headlineMedium" style={styles.heroTitle}>
                Welcome Back!
            </Text>
            </Animated.View>
          </View>

          <View style={authStyles.formCard}>
            <TextInputField
              label="Email"
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                if (otpSent) {
                  setOtpSent(false);
                  setOtpMode(false);
                  setOtp('');
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Enter your email"
              editable={!otpSent}
            />

            {!otpSent ? (
              <>
                <TextInputField
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  isSecureVisible={!secureTextEntry}
                  onToggleSecureEntry={() => setSecureTextEntry(!secureTextEntry)}
                  placeholder="Enter your password"
                />

                <View style={authStyles.forgotPasswordContainer}>
                  <Button mode="text" onPress={() => { }} textColor="#3A6FF8" compact>
                    Forgot Password?
                  </Button>
                </View>

                {error ? (
                  <Text variant="bodyMedium" style={authStyles.error}>
                    {error}
                  </Text>
                ) : null}

                <PrimaryButton
                  title="Log In"
                  onPress={handleLogin}
                  loading={loading}
                  style={authStyles.primaryButton}
                  buttonColor="#3A6FF8"
                />

                <View style={authStyles.dividerContainer}>
                  <View style={authStyles.dividerLine} />
                  <Text style={authStyles.dividerText}>or</Text>
                  <View style={authStyles.dividerLine} />
                </View>

                <PrimaryButton
                  title="Login with OTP"
                  onPress={handleSendOtp}
                  loading={loading}
                  style={authStyles.otpButton}
                  buttonColor="#1E293B"
                  disabled={!isValidEmail(email)}
                />
              </>
            ) : (
              <>
                <Text variant="bodyMedium" style={authStyles.otpInstructions}>
                  Enter the 6-digit code sent to {email}
                </Text>

                <OTPInput otp={otp} setOtp={setOtp} otpInputRefs={otpInputRefs} />

                {error ? (
                  <Text variant="bodyMedium" style={authStyles.error}>
                    {error}
                  </Text>
                ) : null}

                <PrimaryButton
                  title="Verify OTP"
                  onPress={handleVerifyOtp}
                  loading={loading}
                  style={authStyles.primaryButton}
                  buttonColor="#3A6FF8"
                  disabled={otp.length !== 6}
                />

                <Button
                  mode="text"
                  onPress={() => {
                    setOtpSent(false);
                    setOtpMode(false);
                    setOtp('');
                  }}
                  textColor="#3A6FF8"
                  style={authStyles.backButton}
                >
                  Back to password login
                </Button>
              </>
            )}
          </View>

          <View style={authStyles.footer}>
            <Text variant="bodyMedium" style={authStyles.footerText}>
              Don't have an account?
            </Text>
            <Button compact mode="text" onPress={() => navigation.navigate('Signup')} textColor="#3A6FF8">
              Sign Up
            </Button>
          </View>
      </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
