import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { themeAssets } from '../theme';

const GlobalHeader = ({ title, subtitle, rightElement, leftElement }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Surface elevation={0} style={styles.container}>
      {leftElement}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity,
            transform: [{ translateY }],
          },
        ]}>
        <Text variant="headlineSmall" style={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="bodyMedium" style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </Animated.View>
      {rightElement}
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: themeAssets.spacing[5],
    paddingTop: themeAssets.spacing[5],
    paddingBottom: themeAssets.spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: themeAssets.palette.surface,
  },
  textContainer: {
    flex: 1,
    marginHorizontal: themeAssets.spacing[3],
  },
  title: {
    color: themeAssets.palette.text,
    fontFamily: themeAssets.typography.family.medium,
  },
  subtitle: {
    marginTop: themeAssets.spacing[1],
    color: themeAssets.palette.subtext,
  },
});

export default GlobalHeader;

