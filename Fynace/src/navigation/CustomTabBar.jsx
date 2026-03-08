import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { themeAssets } from '../theme';
import Fonts from '../../assets/fonts';
import { QrCode, Plus } from 'lucide-react-native';
import { useBottomBar } from '../context/BottomBarContext';

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const { setActionMenuOpen } = useBottomBar();

  const activeIconColor = themeAssets.palette.primary;
  const inactiveColor = themeAssets.palette.subtext;

  const currentRouteName = state.routes[state.index].name;

  const renderTab = (route, index) => {
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
        activeOpacity={0.7}
      >
        <View style={styles.tabContent}>
          {isFocused && <View style={styles.activeIndicator} />}
          <View style={styles.iconContainer}>
            {IconComponent && (
              <IconComponent focused={isFocused} color={iconColor} size={24} />
            )}
          </View>
          {label && (
            <Text
              style={[
                styles.tabLabel,
                isFocused && styles.tabLabelActive,
                { color: iconColor },
              ]}
            >
              {label}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderMiddleButton = () => {
    if (currentRouteName === 'Home') {
      return (
        <TouchableOpacity
          onPress={() => navigation.navigate('QRScanner')}
          style={styles.middleButtonContainer}
          activeOpacity={0.8}
        >
          <View style={styles.middleButton}>
            <QrCode color="#F8FAFC" size={24} />
          </View>
        </TouchableOpacity>
      );
    }

    // Default middle button (Plus) for all other screens (Expenses, Profile, etc.)
    return (
      <TouchableOpacity
        onPress={() => setActionMenuOpen(true)}
        style={styles.middleButtonContainer}
        activeOpacity={0.8}
      >
        <View style={styles.middleButton}>
          <Plus color="#F8FAFC" size={24} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.floatingContainer}>
      <View
        style={[styles.barStyle, { paddingBottom: Math.max(insets.bottom, 8) }]}
      >
        {renderTab(state.routes[0], 0)}
        {renderMiddleButton()}
        {renderTab(state.routes[1], 1)}
      </View>
    </View>
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
  middleButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
  },
  middleButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: themeAssets.palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: themeAssets.palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
});

export default CustomTabBar;
