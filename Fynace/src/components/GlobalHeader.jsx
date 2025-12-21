import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { ArrowLeft, ChevronLeft, MoreVertical, X, Settings, Bell, Search } from 'lucide-react-native';
import { themeAssets } from '../theme';
import Fonts from '../../assets/fonts';

const GlobalHeader = ({
  title = '',
  subtitle = '',
  rightElement,
  leftElement,
  // Extended props to match requested API
  backgroundColor,
  titleColor,
  subtitleColor,
  titlePosition = 'left',
  showLeftIcon = false,
  leftIconName = 'arrow-back',
  leftIconColor,
  onLeftIconPress = () => {},
  showRightIcon = false,
  rightIconName = 'more-vert',
  rightIconColor,
  onRightIconPress = () => {},
  leftIconSize = 24,
  rightIconSize = 24,
  containerStyle = {},
  titleStyle = {},
  subtitleStyle = {},
  renderLeftComponent = null,
  renderRightComponent = null,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-16)).current;

  const renderLucideIcon = (name, size, color) => {
    const props = { size, color };
    switch ((name || '').toLowerCase()) {
      case 'arrow-back':
      case 'arrow-left':
        return <ArrowLeft {...props} />;
      case 'chevron-left':
        return <ChevronLeft {...props} />;
      case 'close':
        return <X {...props} />;
      case 'more-vert':
      case 'more-vertical':
        return <MoreVertical {...props} />;
      case 'settings':
        return <Settings {...props} />;
      case 'bell':
      case 'notifications':
        return <Bell {...props} />;
      case 'search':
        return <Search {...props} />;
      default:
        return <ArrowLeft {...props} />;
    }
  };

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

  const alignStyle =
    titlePosition === 'center'
      ? { alignItems: 'center', justifyContent: 'center', flex: 1 }
      : { alignItems: 'flex-start', justifyContent: 'flex-start' };

  return (
    <Surface
      elevation={0}
      style={[
        styles.container,
        backgroundColor ? { backgroundColor } : null,
        containerStyle,
      ]}>
      {renderLeftComponent ? (
        renderLeftComponent()
      ) : showLeftIcon ? (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onLeftIconPress}
          activeOpacity={0.7}>
          {renderLucideIcon(leftIconName, leftIconSize, leftIconColor || themeAssets.palette.text)}
        </TouchableOpacity>
      ) : (
        leftElement
      )}

      <Animated.View
        style={[
          styles.textContainer,
          alignStyle,
          {
            opacity,
            transform: [{ translateY }],
          },
        ]}>
        {title ? (
          <Text
            variant="headlineSmall"
            style={[
              styles.title,
              titleColor ? { color: titleColor } : null,
              titleStyle,
            ]}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text
            variant="bodyMedium"
            style={[
              styles.subtitle,
              subtitleColor ? { color: subtitleColor } : null,
              subtitleStyle,
            ]}>
            {subtitle}
          </Text>
        ) : null}
      </Animated.View>

      {renderRightComponent ? (
        renderRightComponent()
      ) : showRightIcon ? (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onRightIconPress}
          activeOpacity={0.7}>
          {renderLucideIcon(rightIconName, rightIconSize, rightIconColor || themeAssets.palette.text)}
        </TouchableOpacity>
      ) : (
        rightElement
      )}
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
    fontFamily: Fonts.medium,
  },
  subtitle: {
    marginTop: themeAssets.spacing[1],
    color: themeAssets.palette.subtext,
    fontFamily: Fonts.regular
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
});

export default GlobalHeader;

