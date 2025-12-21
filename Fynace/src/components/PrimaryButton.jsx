import React from 'react';
import { ActivityIndicator, GestureResponderEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { themeAssets } from '../theme';
import Fonts from '../../assets/fonts';

const DEFAULT_GRADIENT = ['#111827', '#0B1220', '#060A12'];
const DISABLED_GRADIENT = ['#4b5563', '#4b5563'];

const PrimaryButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style = {},
  textStyle = {},
  gradientColors = DEFAULT_GRADIENT,
  buttonColor,
}) => {
  const contentColor = themeAssets.palette.onPrimary;
  const colors = disabled
    ? DISABLED_GRADIENT
    : buttonColor
    ? [buttonColor, buttonColor]
    : gradientColors;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.pressable,
        pressed && !disabled ? styles.pressed : null,
        style,
      ]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}>
        <View style={styles.content}>
          {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
          {loading ? (
            <ActivityIndicator color={contentColor} />
          ) : (
            <Text style={[styles.title, { color: contentColor }, textStyle]}>{title}</Text>
          )}
          {rightIcon ? <View style={styles.icon}>{rightIcon}</View> : null}
        </View>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.996 }],
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    opacity: 0.95,
  },
  title: {
    fontFamily: Fonts.semibold,
    letterSpacing: 0.2,
  },
});

export default PrimaryButton;


