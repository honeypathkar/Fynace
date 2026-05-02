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
import { useTheme } from 'react-native-paper';
import Fonts from '../../assets/fonts';
import { QrCode, Plus } from 'lucide-react-native';
import { useBottomBar } from '../context/BottomBarContext';

import { triggerHaptic } from '../utils/hapticFeedback';

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { setActionMenuOpen } = useBottomBar();

  const activeIconColor = theme.colors.secondary;
  const inactiveColor = theme.colors.onSurfaceVariant;

  const currentRouteName = state.routes[state.index].name;

  const renderTab = (route, index, theme) => {
    const { options } = descriptors[route.key];
    const isFocused = state.index === index;

    const label =
      options.tabBarLabel !== undefined
        ? options.tabBarLabel
        : options.title !== undefined
        ? options.title
        : route.name;

    const onPress = () => {
      triggerHaptic('impactMedium');
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
          {isFocused && (
            <View
              style={[
                styles.activeIndicator,
                { backgroundColor: theme.colors.secondary },
              ]}
            />
          )}
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

  const renderMiddleButton = theme => {
    if (currentRouteName === 'Home') {
      return (
        <TouchableOpacity
          onPress={() => {
            triggerHaptic('impactMedium');
            navigation.navigate('QRScanner');
          }}
          style={styles.middleButtonContainer}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.middleButton,
              {
                backgroundColor: theme.colors.secondary,
                shadowColor: theme.colors.secondary,
              },
            ]}
          >
            <QrCode color={theme.colors.onSecondary} size={24} />
          </View>
        </TouchableOpacity>
      );
    }

    // Default middle button (Plus) for all other screens (Expenses, Profile, etc.)
    return (
      <TouchableOpacity
        onPress={() => {
          triggerHaptic('impactMedium');
          setActionMenuOpen(true);
        }}
        style={styles.middleButtonContainer}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.middleButton,
            {
              backgroundColor: theme.colors.secondary,
              shadowColor: theme.colors.secondary,
            },
          ]}
        >
          <Plus color={theme.colors.onSecondary} size={24} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.floatingContainer}>
      <View
        style={[
          styles.barStyle,
          {
            backgroundColor: theme.colors.surface,
            paddingBottom: Math.max(insets.bottom, 8),
          },
        ]}
      >
        {renderTab(state.routes[0], 0, theme)}
        {renderMiddleButton(theme)}
        {renderTab(state.routes[1], 1, theme)}
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
    justifyContent: 'center',
    alignItems: 'center',
    // elevation: 8,
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.5,
    // shadowRadius: 10,
  },
});

export default CustomTabBar;
