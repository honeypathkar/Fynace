import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Text } from 'react-native-paper';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextInputField from '../../components/TextInputField';
import GlobalHeader from '../../components/GlobalHeader';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import { SignupHeader, authStyles } from '../../components/auth';

const SignupScreen = () => {
  const navigation = useNavigation();
  const { register, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [error, setError] = useState(null);

  const handleSignup = async () => {
    try {
      setError(null);
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError('Please fill in all fields.');
        return;
      }
      await register({ name, email, password });
      // Navigation is handled by the AuthContext/AppNavigator based on user state
    } catch (apiError) {
      setError(apiError.message || 'Registration failed. Please try again.');
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
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

          <SignupHeader
            title="Create Account"
            subtitle="Join Spendo to track your expenses effortlessly."
          />

          <View style={authStyles.formContainer}>
            <TextInputField
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              autoCapitalize="words"
            />

            <TextInputField
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInputField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              secureTextEntry
              isSecureVisible={!secureTextEntry}
              onToggleSecureEntry={() => setSecureTextEntry(!secureTextEntry)}
            />

            {error ? (
              <Text variant="bodyMedium" style={authStyles.errorText}>
                {error}
              </Text>
            ) : null}

            <PrimaryButton
              title="Sign Up"
              onPress={handleSignup}
              loading={loading}
              style={authStyles.signupButton}
            />
          </View>

          <View style={authStyles.footer}>
            <Text variant="bodyMedium" style={authStyles.footerText}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text variant="bodyMedium" style={authStyles.loginLink}>
                Log In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupScreen;
