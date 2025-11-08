import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Button,
  Card,
  HelperText,
  Text,
  TextInput,
} from 'react-native-paper';
import GlobalHeader from '../../components/GlobalHeader';
import { useAuth } from '../../hooks/useAuth';
import { themeAssets } from '../../theme';

const SignupScreen = () => {
  const navigation = useNavigation();
  const { requestOtp, verifyOtp, updateProfile, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState('request');
  const [error, setError] = useState(null);

  const handleRequestOtp = async () => {
    try {
      setError(null);
      await requestOtp({ email, phone });
      setStage('verify');
    } catch (apiError) {
      setError(apiError.message);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setError(null);
      await verifyOtp({ otp, email, phone });
      await updateProfile({ name, email, phone });
      navigation.reset({ index: 0, routes: [{ name: 'AppTabs' }] });
    } catch (apiError) {
      setError(apiError.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <GlobalHeader
        title="Create your account"
        subtitle="Sign up to start using Spendo"
        rightElement={
          <Button mode="text" onPress={() => navigation.navigate('Login')}>
            Log in
          </Button>
        }
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              {stage === 'request' ? 'Tell us about you' : 'Verify OTP'}
            </Text>
            <TextInput
              label="Full name"
              value={name}
              onChangeText={setName}
              style={styles.input}
              editable={stage === 'request'}
            />
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              editable={stage === 'request'}
            />
            <HelperText type="info">
              We will send your OTP to this email address.
            </HelperText>
            <TextInput
              label="Phone (optional)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={styles.input}
              editable={stage === 'request'}
            />
            {stage === 'verify' ? (
              <TextInput
                label="OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                style={styles.input}
              />
            ) : null}
            {error ? (
              <Text variant="bodyMedium" style={styles.error}>
                {error}
              </Text>
            ) : null}
            <Button
              mode="contained"
              onPress={stage === 'request' ? handleRequestOtp : handleVerifyOtp}
              loading={loading}
              style={styles.primaryButton}>
              {stage === 'request' ? 'Send OTP' : 'Verify & Finish'}
            </Button>
            {stage === 'verify' ? (
              <Button
                mode="text"
                onPress={() => {
                  setStage('request');
                  setOtp('');
                }}
                disabled={loading}>
                Edit details
              </Button>
            ) : null}
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeAssets.palette.background,
  },
  content: {
    paddingHorizontal: themeAssets.spacing[5],
    paddingBottom: themeAssets.spacing[6],
  },
  card: {
    borderRadius: 20,
    marginTop: themeAssets.spacing[4],
  },
  cardTitle: {
    marginBottom: themeAssets.spacing[3],
  },
  input: {
    marginBottom: themeAssets.spacing[2],
  },
  primaryButton: {
    marginTop: themeAssets.spacing[3],
  },
  error: {
    color: themeAssets.palette.error,
    marginBottom: themeAssets.spacing[2],
  },
});
