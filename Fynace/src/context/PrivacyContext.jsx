import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PrivacyContext = createContext(undefined);

const PRIVACY_MODE_KEY = '@fynace/privacy-mode';

export const PrivacyProvider = ({ children }) => {
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  useEffect(() => {
    const loadPrivacyMode = async () => {
      try {
        const value = await AsyncStorage.getItem(PRIVACY_MODE_KEY);
        if (value !== null) {
          setIsPrivacyMode(JSON.parse(value));
        }
      } catch (error) {
        console.error('Failed to load privacy mode', error);
      }
    };
    loadPrivacyMode();
  }, []);

  const togglePrivacyMode = useCallback(async () => {
    try {
      const newValue = !isPrivacyMode;
      setIsPrivacyMode(newValue);
      await AsyncStorage.setItem(PRIVACY_MODE_KEY, JSON.stringify(newValue));
    } catch (error) {
      console.error('Failed to save privacy mode', error);
    }
  }, [isPrivacyMode]);

  const formatAmount = useCallback(
    (amount, currency = 'INR') => {
      if (isPrivacyMode) {
        return '******';
      }

      // Default formatting if not in privacy mode
      // You can customize this based on currency if needed
      const symbol =
        currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency;
      return `${symbol} ${parseFloat(amount).toLocaleString('en-IN')}`;
    },
    [isPrivacyMode],
  );

  return (
    <PrivacyContext.Provider
      value={{ isPrivacyMode, togglePrivacyMode, formatAmount }}
    >
      {children}
    </PrivacyContext.Provider>
  );
};

export const usePrivacy = () => {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
};
