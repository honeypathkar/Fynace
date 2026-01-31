import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Image,
  Animated,
  StatusBar,
  Platform,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Fonts from '../../../assets/fonts';

const { width, height } = Dimensions.get('window');
const ONBOARDING_KEY = '@spendo/onboarding-completed';

const OnboardingScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const navigation = useNavigation();

  useEffect(() => {
    // Fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      navigation.replace('Login');
    } catch (error) {
      console.warn('Failed to save onboarding status', error);
      navigation.replace('Login');
    }
  };

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B', '#0F172A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" translucent={false} />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.imageContainer}>
          <View style={styles.imageWrapper}>
            <Text style={styles.emoji}>💰</Text>
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.appName}>Spendo</Text>
          <Text style={styles.tagline}>Track Your Expenses</Text>
          <Text style={styles.description}>
            Manage your finances effortlessly. Track expenses, monitor spending, and stay in control of your money.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  imageContainer: {
    marginBottom: 48,
    alignItems: 'center',
  },
  imageWrapper: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(58, 111, 248, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(58, 111, 248, 0.3)',
  },
  emoji: {
    fontSize: 100,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  appName: {
    fontSize: 48,
    fontFamily: Fonts.bold,
    color: '#F8FAFC',
    marginBottom: 12,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 24,
    fontFamily: Fonts.semibold,
    color: '#94A3B8',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: '#3A6FF8',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: Fonts.semibold,
  },
});
