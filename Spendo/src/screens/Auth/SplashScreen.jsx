import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';

const { width, height } = Dimensions.get('window');
const CIRCLE_SIZE = Math.sqrt(width ** 2 + height ** 2);

const SplashScreen = () => {
  const navigation = useNavigation();
  const { token } = useAuth();
  const scale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 1000,
      delay: 250,
      useNativeDriver: true,
    }).start();

    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 500,
      delay: 1500,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        navigation.replace(token ? 'AppTabs' : 'Login');
      }
    });
  }, [logoOpacity, navigation, scale, token]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f6e088" />
      <Animated.View style={[styles.dot, { transform: [{ scale }] }]} />
      <Animated.View style={[styles.logoContainer, { opacity: logoOpacity }]}>
        <Image
          source={{ uri: 'https://dummyimage.com/200x200/0f172a/ffffff&text=Spendo' }}
          style={styles.logo}
        />
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: '#f6e088',
    position: 'absolute',
  },
  logoContainer: {
    position: 'absolute',
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    borderRadius: 24,
  },
});
