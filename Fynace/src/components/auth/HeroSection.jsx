import React from 'react';
import { View, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import styles from './styles';

const HeroSection = ({ title, animatedValue }) => {
  return (
    <View style={styles.heroContainer}>
      <Animated.View
        style={[
          styles.heroCard,
          animatedValue && { transform: [{ translateY: animatedValue }] },
        ]}
      >
        <Text variant="headlineMedium" style={styles.heroTitle}>
          {title}
        </Text>
      </Animated.View>
    </View>
  );
};

export default HeroSection;

