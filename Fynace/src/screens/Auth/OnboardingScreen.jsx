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

const OnboardingScreen = () => {
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

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000000"
        translucent
      />
      
      <LinearGradient
        colors={['#000000', '#050505', '#0A0A0A']}
        style={StyleSheet.absoluteFill}
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
          <Text style={styles.appName}>Fynace</Text>
          <Text style={styles.tagline}>Financial intelligence,{"\n"}redefined.</Text>
          <Text style={styles.description}>
            Experience a new era of money management. Clean, dark, and designed for clarity.
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleGetStarted}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
          <View style={styles.footerNoteContainer}>
            <Text style={styles.footerNote}>By continuing, you agree to our </Text>
            <TouchableOpacity onPress={() => 
              navigation.navigate('WebView', {
                url: `${FRONTEND_URL}/terms-and-conditions`,
                title: 'Terms & Conditions',
              })
            }>
              <Text style={styles.footerLink}>Terms of Service</Text>
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
    backgroundColor: '#000000',
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
    color: '#FFFFFF', // Switched from Lavender to White
    letterSpacing: 6,
    textTransform: 'uppercase',
    marginBottom: 60,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 36,
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 44,
  },
  description: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: '#808080',
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
    backgroundColor: '#FFFFFF', // Switched from Lavender to White
    height: 64,
    borderRadius: 20,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  buttonText: {
    color: '#000000',
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
    color: '#404040',
    fontFamily: Fonts.medium,
  },
  footerLink: {
    fontSize: 13,
    color: '#808080',
    fontFamily: Fonts.bold,
    textDecorationLine: 'underline',
  },
});
