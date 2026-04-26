import {
  StyleSheet,
  View,
  Dimensions,
  Image,
  Animated,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSecurity } from '../../context/SecurityContext';

import { useTheme } from 'react-native-paper';

const { width, height } = Dimensions.get('window');
const CIRCLE_SIZE = Math.sqrt(width ** 2 + height ** 2);
const STORAGE_KEY = '@fynace/access-token';

const SplashScreen = () => {
  const theme = useTheme();
  const scale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const { isBiometricEnabled, authenticate, isLoading } = useSecurity();
  const [animationFinished, setAnimationFinished] = useState(false);

  const getAuthToken = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEY);
      return token;
    } catch (error) {
      console.warn('Failed to get auth token', error);
      return null;
    }
  }, []);

  const checkOnboarding = useCallback(async () => {
    try {
      const onboardingCompleted = await AsyncStorage.getItem(
        '@fynace/onboarding-completed',
      );
      return onboardingCompleted === 'true';
    } catch (error) {
      console.warn('Failed to check onboarding status', error);
      return false;
    }
  }, []);

  // Run animations once
  useEffect(() => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 400,
      delay: 100,
      useNativeDriver: true,
    }).start();

    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 300,
      delay: 500,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setAnimationFinished(true);
      }
    });
  }, []);

  // Handle navigation when animation is done and settings are loaded
  useEffect(() => {
    const handleNavigation = async () => {
      if (animationFinished && !isLoading) {
        const token = await getAuthToken();
        const hasSeenOnboarding = await checkOnboarding();

        if (token) {
          if (isBiometricEnabled) {
            const success = await authenticate();
            if (success) {
              navigation.replace('AppTabs');
            } else {
              Alert.alert(
                'Authentication Required',
                'Please authenticate to access the app',
                [
                  {
                    text: 'Retry',
                    onPress: () => navigation.replace('Splash'),
                  },
                ],
              );
            }
          } else {
            navigation.replace('AppTabs');
          }
        } else {
          navigation.replace('Onboarding');
        }
      }
    };

    handleNavigation();
  }, [
    animationFinished,
    isLoading,
    isBiometricEnabled,
    navigation,
    authenticate,
    getAuthToken,
    checkOnboarding,
  ]);

  const logoSource = theme.dark
    ? require('../../../assets/images/logo.png')
    : require('../../../assets/images/light.png');

  return (
    <View style={[styles.container, { backgroundColor: theme.dark ? '#121212' : theme.colors.surfaceVariant }]}>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.dark ? '#121212' : theme.colors.surfaceVariant}
        translucent={false}
      />
      <Animated.View 
        style={[
          styles.dot, 
          { 
            transform: [{ scale }],
            backgroundColor: theme.colors.background
          } 
        ]} 
      />
      <Animated.View style={[styles.logoContainer, { opacity: logoOpacity }]}>
        <Image
          source={logoSource}
          style={styles.logo}
          onError={e => console.log('Error loading logo:', e.nativeEvent.error)}
        />
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    position: 'absolute',
  },
  logoContainer: {
    position: 'absolute',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    borderRadius: 100,
  },
});
