import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

const SkeletonPulse = ({ style }) => {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 950,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 950,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.ease),
        }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
      animation.stopAnimation();
    };
  }, [animation]);

  const backgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#121212', '#1A1A1A'],
  });

  return (
    <Animated.View style={[styles.skeletonBase, style, { backgroundColor }]} />
  );
};

const styles = StyleSheet.create({
  skeletonBase: {
    borderRadius: 12,
    backgroundColor: '#121212',
  },
});

export default SkeletonPulse;

