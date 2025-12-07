import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  TouchableOpacity,
  Text,
  Keyboard,
  Platform,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, PieChart } from 'lucide-react-native';
import { useBottomBar } from '../context/BottomBarContext';
import { themeAssets } from '../theme';
import Fonts from '../../assets/fonts';

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const { isVisible, hideBottomBar, showBottomBar } = useBottomBar();
  const translateY = useRef(new Animated.Value(0)).current;

  const activeIconColor = themeAssets.palette.primary;
  const inactiveColor = themeAssets.palette.subtext;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        hideBottomBar();
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        showBottomBar();
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, [hideBottomBar, showBottomBar]);

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: isVisible ? 0 : 200,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [isVisible, translateY]);

  return (
    <Animated.View
      style={[
        styles.floatingContainer,
        {
          transform: [{ translateY }],
        },
      ]}>
      <View
        style={[
          styles.barStyle,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.dispatch({
                ...CommonActions.navigate(route.name, route.params),
                target: state.key,
              });
            }
          };

          const iconColor = isFocused ? activeIconColor : inactiveColor;
          const IconComponent = options.tabBarIcon;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}>
              <View style={styles.tabContent}>
                {isFocused && <View style={styles.activeIndicator} />}
                <View style={styles.iconContainer}>
                  {IconComponent && (
                    <IconComponent
                      focused={isFocused}
                      color={iconColor}
                      size={24}
                    />
                  )}
                </View>
                {label && (
                  <Text
                    style={[
                      styles.tabLabel,
                      isFocused && styles.tabLabelActive,
                      { color: iconColor },
                    ]}>
                    {label}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  barStyle: {
    flexDirection: 'row',
    backgroundColor: themeAssets.palette.surface,
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 8,
    position: 'relative',
    width: '100%',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -30,
    width: 60,
    height: 3,
    backgroundColor: themeAssets.palette.primary,
    borderRadius: 1.5,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    marginTop: 2,
  },
  tabLabelActive: {
    fontFamily: Fonts.semibold,
  },
});

export default CustomTabBar;

