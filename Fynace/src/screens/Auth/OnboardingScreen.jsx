import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Image,
  Animated,
  StatusBar,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Fonts from '../../../assets/fonts';
import { FRONTEND_URL } from '../../utils/BASE_URL';

const { width, height } = Dimensions.get('window');

import { useTheme } from 'react-native-paper';

const OnboardingScreen = () => {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const navigation = useNavigation();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleGetStarted = () => {
    navigation.navigate('Login');
  };

  const isDark = theme.dark;

  return (
    <View style={[styles.container, { backgroundColor: theme.dark ? theme.colors.primary : theme.colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.textContainer}>
          <Text style={[styles.appName, { color: theme.colors.text }]}>Fynace</Text>
          <Text style={[styles.tagline, { color: theme.colors.text }]}>Financial intelligence,{"\n"}redefined.</Text>
          <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
            Experience a new era of money management. Clean, intuitive, and designed for clarity.
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.secondary }]}
            onPress={handleGetStarted}
            activeOpacity={0.9}
          >
            <Text style={[styles.buttonText, { color: theme.colors.onSecondary }]}>Get Started</Text>
          </TouchableOpacity>
          <View style={styles.footerNoteContainer}>
            <Text style={[styles.footerNote, { color: theme.colors.outline }]}>By continuing, you agree to our </Text>
            <TouchableOpacity onPress={() => 
              navigation.navigate('WebView', {
                url: `${FRONTEND_URL}/terms-and-conditions`,
                title: 'Terms & Conditions',
              })
            }>
              <Text style={[styles.footerLink, { color: theme.colors.onSurfaceVariant }]}>Terms of Service</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  appName: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    letterSpacing: 6,
    textTransform: 'uppercase',
    marginBottom: 60,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 36,
    fontFamily: Fonts.bold,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 44,
  },
  description: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 10,
  },
  footer: {
    width: '100%',
    marginTop: 80,
    alignItems: 'center',
    paddingBottom: 60,
  },
  button: {
    height: 64,
    borderRadius: 20,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    letterSpacing: 0.5,
  },
  footerNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  footerNote: {
    fontSize: 13,
    fontFamily: Fonts.medium,
  },
  footerLink: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    textDecorationLine: 'underline',
  },
});
