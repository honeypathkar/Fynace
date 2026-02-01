import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { Alert } from 'react-native';
import LocalAuth from 'react-native-local-auth';

const SecurityContext = createContext(undefined);

const BIOMETRIC_ENABLED_KEY = '@fynace/biometric-enabled';

export const SecurityProvider = ({ children }) => {
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const rnBiometrics = new ReactNativeBiometrics();

  useEffect(() => {
    const checkSupport = async () => {
      const { available, biometryType } =
        await rnBiometrics.isSensorAvailable();
      if (available && biometryType) {
        setIsSupported(true);
      }
    };

    const loadBiometricSetting = async () => {
      try {
        const value = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
        if (value !== null) {
          setIsBiometricEnabled(JSON.parse(value));
        }
      } catch (error) {
        console.error('Failed to load biometric setting', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSupport();
    loadBiometricSetting();
  }, []);

  const toggleBiometric = useCallback(async () => {
    try {
      const { available } = await rnBiometrics.isSensorAvailable();
      if (!available) {
        Alert.alert(
          'Not Supported',
          'Biometric authentication is not available on this device.',
        );
        return;
      }

      const newValue = !isBiometricEnabled;

      // If enabling, verify first
      if (newValue) {
        const result = await rnBiometrics.simplePrompt({
          promptMessage: 'Confirm biometric to enable',
        });
        if (!result.success) return;
      }

      setIsBiometricEnabled(newValue);
      await AsyncStorage.setItem(
        BIOMETRIC_ENABLED_KEY,
        JSON.stringify(newValue),
      );
    } catch (error) {
      console.error('Failed to toggle biometric', error);
    }
  }, [isBiometricEnabled]);

  const authenticate = useCallback(async () => {
    if (!isBiometricEnabled) return true;

    try {
      // Step 1: Try Biometrics (Fingerprint/FaceID)
      const { available } = await rnBiometrics.isSensorAvailable();

      if (available) {
        const { success } = await rnBiometrics.simplePrompt({
          promptMessage: 'Authenticate to access Fynace',
        });
        if (success) return true;
      }

      // Step 2: Fallback to System Device Lock (PIN/Pattern/Passcode)
      try {
        await LocalAuth.authenticate({
          reason: 'Please authenticate to access Fynace',
          fallbackToPasscode: true, // Allow PIN/Pattern
          suppressEnterPassword: false,
        });
        return true;
      } catch (authError) {
        // LocalAuth throws if canceled or failed
        console.warn('Screen lock auth canceled or failed', authError);
        return false;
      }
    } catch (error) {
      console.error('Authentication error', error);
      return false;
    }
  }, [isBiometricEnabled]);

  return (
    <SecurityContext.Provider
      value={{
        isBiometricEnabled,
        isSupported,
        isLoading,
        toggleBiometric,
        authenticate,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
