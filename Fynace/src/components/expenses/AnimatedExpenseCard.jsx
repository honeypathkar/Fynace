import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

const AnimatedExpenseCard = ({ index, children, skipAnimation = false }) => {
  const translateY = useRef(new Animated.Value(skipAnimation ? 0 : 24)).current;
  const opacity = useRef(new Animated.Value(skipAnimation ? 1 : 0)).current;

  useEffect(() => {
    if (skipAnimation) {
      return;
    }

    const delay = index < 10 ? index * 30 : 0;
    const duration = index < 10 ? 300 : 150;

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: duration - 50,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, translateY, skipAnimation]);

  return (
    <Animated.View style={{ transform: [{ translateY }], opacity }}>
      {children}
    </Animated.View>
  );
};

export default AnimatedExpenseCard;

