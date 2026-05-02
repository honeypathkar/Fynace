import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  PermissionsAndroid,
  ToastAndroid,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  InteractionManager,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { useNavigation, useIsFocused, useFocusEffect } from '@react-navigation/native';
import { Text, Divider, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronRight,
  EyeOff,
  Globe,
  Fingerprint,
  Bell,
  Search,
  Clock,
  AlertTriangle,
  Vibrate,
} from 'lucide-react-native';
import GlobalHeader from '../../components/GlobalHeader';
import BottomSheet from '../../components/BottomSheet';
import { useAuth } from '../../hooks/useAuth';
import { parseApiError } from '../../api/client';
import { usePrivacy } from '../../context/PrivacyContext';
import { useSecurity } from '../../context/SecurityContext';
import Fonts from '../../../assets/fonts';
import {
  check as checkPerm,
  request as requestPerm,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';

import { triggerHaptic, getHapticEnabled, setHapticEnabled } from '../../utils/hapticFeedback';

const CustomToggle = ({ value, onValueChange }) => {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={() => {
        onValueChange(!value);
        triggerHaptic('impactMedium');
      }}
      style={{
        width: 50,
        height: 26,
        borderRadius: 13,
        backgroundColor: value ? theme.colors.secondary : theme.colors.surfaceVariant,
        justifyContent: 'center',
        paddingHorizontal: 2,
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: '#FFF',
          alignSelf: value ? 'flex-end' : 'flex-start',
        }}
      />
    </TouchableOpacity>
  );
};

const MenuItem = ({ icon: Icon, label, onPress, right, theme }) => (
  <Pressable
    onPress={() => {
      onPress?.();
      triggerHaptic('impactMedium');
    }}
    style={({ pressed }) => [
      styles.menuItem,
      { backgroundColor: pressed ? theme.colors.surfaceVariant : 'transparent' },
    ]}
  >
    <View style={styles.menuItemLeft}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Icon size={20} color={theme.colors.text} />
      </View>
      <Text style={[styles.menuItemLabel, { color: theme.colors.text }]}>{label}</Text>
    </View>
    <View style={styles.menuItemRight}>
      {right ? (
        right
      ) : (
        <ChevronRight size={20} color={theme.colors.onSurfaceVariant} />
      )}
    </View>
  </Pressable>
);

const ToolScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { user, updateProfile, refreshProfile } = useAuth();
  const { isPrivacyMode, togglePrivacyMode } = usePrivacy();
  const { isBiometricEnabled, toggleBiometric, isSupported } = useSecurity();
  const [hasSystemPermission, setHasSystemPermission] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hapticEnabled, setHapticEnabledState] = useState(true);
  const alertSheetRef = React.useRef(null);

  // Load Haptic Preference
  useEffect(() => {
    getHapticEnabled().then(setHapticEnabledState);
  }, []);

  const handleHapticToggle = async (value) => {
    await setHapticEnabled(value);
    setHapticEnabledState(value);
    if (value) triggerHaptic('impactMedium');
  };
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel',
    onConfirm: null,
    showCancel: false,
    type: 'info',
  });

  const showAlert = React.useCallback((title, message, options = {}) => {
    setAlertConfig({
      title,
      message,
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancel',
      onConfirm: options.onConfirm || null,
      showCancel: options.showCancel || false,
      type: options.type || 'info',
    });
    alertSheetRef.current?.open();
  }, []);

  const hasCheckedPerms = React.useRef(false);

  useFocusEffect(
    React.useCallback(() => {
      const task = InteractionManager.runAfterInteractions(async () => {
        await refreshProfile();
        try {
          let notifGranted = false;
          if (Platform.OS === 'android') {
            if (Platform.Version >= 33) {
              notifGranted = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
              );
            } else {
              notifGranted = true;
            }
            const smsReadGranted = await PermissionsAndroid.check(
              PermissionsAndroid.PERMISSIONS.READ_SMS,
            );
            setSmsTrackingEnabled(smsReadGranted);
          } else {
            const status = await checkPerm(PERMISSIONS.IOS.NOTIFICATIONS);
            notifGranted = status === RESULTS.GRANTED;
          }
          setHasSystemPermission(notifGranted);

          if (
            user?.notificationSettings?.pushNotificationsEnabled &&
            !notifGranted &&
            !hasCheckedPerms.current
          ) {
            hasCheckedPerms.current = true;
            handleNotificationToggle(true);
          }
        } catch (err) {
          console.warn('Error checking permissions', err);
        }
      });

      return () => {
        task.cancel();
        hasCheckedPerms.current = false;
      };
    }, [user?.notificationSettings?.pushNotificationsEnabled, refreshProfile])
  );

  const handleNotificationToggle = async value => {
    try {
      if (value) {
        showAlert(
          'Enable Notifications',
          'Fynace needs notification access to send you spending alerts, budget summaries, and transaction updates.',
          {
            confirmText: 'Continue',
            showCancel: true,
            onConfirm: async () => {
              let authStatus;
              if (Platform.OS === 'android' && Platform.Version >= 33) {
                const granted = await PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
                );
                authStatus =
                  granted === PermissionsAndroid.RESULTS.GRANTED
                    ? messaging.AuthorizationStatus.AUTHORIZED
                    : messaging.AuthorizationStatus.DENIED;
              } else {
                authStatus = await messaging().requestPermission();
              }

              const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

              if (enabled) {
                setHasSystemPermission(true);
                setIsUpdating(true);
                await updateProfile({
                  notificationSettings: {
                    ...user?.notificationSettings,
                    pushNotificationsEnabled: true,
                    mainNotificationsEnabled: true,
                  },
                });
              } else {
                setHasSystemPermission(false);
                showAlert(
                  'Permission Denied',
                  'Please enable notifications in system settings to receive spending alerts.',
                  {
                    confirmText: 'Open Settings',
                    showCancel: true,
                    onConfirm: () => openSettings(),
                  },
                );
              }
            },
          },
        );
      } else {
        setIsUpdating(true);
        await updateProfile({
          notificationSettings: {
            ...user?.notificationSettings,
            pushNotificationsEnabled: false,
            mainNotificationsEnabled: false,
          },
        });
      }
    } catch (err) {
      console.warn('Notification toggle error:', err);
      const apiError = parseApiError(err);
      ToastAndroid.show(
        apiError.message || 'Failed to update notifications',
        ToastAndroid.SHORT,
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSettingToggle = async (key, value) => {
    try {
      setIsUpdating(true);
      await updateProfile({
        notificationSettings: {
          ...user?.notificationSettings,
          [key]: value,
        },
      });
    } catch (err) {
      console.error('Failed to update setting', err);
      const apiError = parseApiError(err);
      ToastAndroid.show(
        apiError.message || 'Failed to update setting',
        ToastAndroid.SHORT,
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const containerBg = { backgroundColor: theme.colors.background };
  const explanationCardBorder = { borderColor: theme.colors.outlineVariant };
  const explanationTextColor = { color: theme.colors.onSurfaceVariant };
  const dividerColor = { backgroundColor: theme.colors.outlineVariant };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, containerBg]}>
      <GlobalHeader
        title="Tools & Settings"
        titleColor={theme.colors.text}
        backgroundColor="transparent"
        showLeftIcon
        leftIconName="arrow-left"
        leftIconColor={theme.colors.text}
        onLeftIconPress={() => navigation.goBack()}
        rightIconComponent={
          isUpdating ? (
            <ActivityIndicator size="small" color={theme.colors.secondary} />
          ) : null
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.menuContainer}>
          <Text
            style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            Privacy & Security
          </Text>

          {isSupported && (
            <MenuItem
              icon={Fingerprint}
              label="Biometric Lock"
              onPress={toggleBiometric}
              theme={theme}
              right={
                <CustomToggle
                  value={isBiometricEnabled}
                  onValueChange={toggleBiometric}
                />
              }
            />
          )}

          <MenuItem
            icon={EyeOff}
            label="Privacy Mode"
            onPress={togglePrivacyMode}
            theme={theme}
            right={
              <CustomToggle
                value={isPrivacyMode}
                onValueChange={togglePrivacyMode}
              />
            }
          />

          <MenuItem
            icon={Vibrate}
            label="Haptic Feedback"
            onPress={() => handleHapticToggle(!hapticEnabled)}
            theme={theme}
            right={
              <CustomToggle
                value={hapticEnabled}
                onValueChange={handleHapticToggle}
              />
            }
          />

          <Text
            style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            Notifications & Automation
          </Text>

          <View style={[styles.explanationCard, explanationCardBorder]}>
            <MenuItem
              icon={Bell}
              label="Push Notifications"
              theme={theme}
              onPress={() =>
                handleNotificationToggle(
                  !user?.notificationSettings?.pushNotificationsEnabled,
                )
              }
              right={
                <CustomToggle
                  value={!!user?.notificationSettings?.pushNotificationsEnabled}
                  onValueChange={handleNotificationToggle}
                />
              }
            />
            <Text style={[styles.explanationText, explanationTextColor]}>
              Get alerts for budget limits, spending milestones, and bill
              reminders.
            </Text>

            {user?.notificationSettings?.pushNotificationsEnabled && (
              <View style={styles.settingsGroup}>
                <Divider style={[styles.divider, dividerColor]} />
                <MenuItem
                  icon={ChevronRight}
                  label="Daily Reminders"
                  theme={theme}
                  right={
                    <CustomToggle
                      value={user?.notificationSettings?.dailyReminder}
                      onValueChange={v => handleSettingToggle('dailyReminder', v)}
                    />
                  }
                />
                <MenuItem
                  icon={ChevronRight}
                  label="Monthly Summaries"
                  theme={theme}
                  right={
                    <CustomToggle
                      value={user?.notificationSettings?.monthlySummary}
                      onValueChange={v => handleSettingToggle('monthlySummary', v)}
                    />
                  }
                />
                <MenuItem
                  icon={ChevronRight}
                  label="Budget Alerts"
                  theme={theme}
                  right={
                    <CustomToggle
                      value={user?.notificationSettings?.budgetAlerts}
                      onValueChange={v => handleSettingToggle('budgetAlerts', v)}
                    />
                  }
                />
                <MenuItem
                  icon={ChevronRight}
                  label="Smart Insights"
                  theme={theme}
                  right={
                    <CustomToggle
                      value={user?.notificationSettings?.smartInsights}
                      onValueChange={v => handleSettingToggle('smartInsights', v)}
                    />
                  }
                />
                <Divider style={[styles.divider, dividerColor]} />
                <MenuItem
                  icon={ChevronRight}
                  label="Recurring Transactions"
                  theme={theme}
                  right={
                    <CustomToggle
                      value={
                        user?.notificationSettings?.recurringTransactionsEnabled
                      }
                      onValueChange={v =>
                        handleSettingToggle('recurringTransactionsEnabled', v)
                      }
                    />
                  }
                />
              </View>
            )}
          </View>

          <BottomSheet
            ref={alertSheetRef}
            title={alertConfig.title}
            initialHeight={0.4}
          >
            <View style={styles.alertContent}>
              <View style={styles.alertHeader}>
                <View
                  style={[
                    styles.alertIconContainer,
                    {
                      backgroundColor:
                        alertConfig.type === 'danger'
                          ? theme.colors.error + '1A'
                          : theme.colors.primary + '1A',
                    },
                  ]}
                >
                  <AlertTriangle
                    size={24}
                    color={
                      alertConfig.type === 'danger'
                        ? theme.colors.error
                        : theme.colors.secondary
                    }
                  />
                </View>
                <Text style={[styles.alertTitle, { color: theme.colors.text }]}>
                  {alertConfig.title}
                </Text>
              </View>

              <Text
                style={[
                  styles.alertMessage,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {alertConfig.message}
              </Text>

              <View style={styles.alertActions}>
                {alertConfig.showCancel && (
                  <TouchableOpacity
                    onPress={() => alertSheetRef.current?.close()}
                    style={[
                      styles.alertButton,
                      { backgroundColor: theme.colors.surfaceVariant },
                    ]}
                  >
                    <Text
                      style={[
                        styles.alertButtonTextSecondary,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      {alertConfig.cancelText}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => {
                    alertSheetRef.current?.close();
                    if (alertConfig.onConfirm) alertConfig.onConfirm();
                  }}
                  style={[
                    styles.alertButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.alertButtonTextPrimary,
                      { color: theme.colors.onPrimary },
                    ]}
                  >
                    {alertConfig.confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </BottomSheet>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 8,
  },
  menuContainer: {
    width: '100%',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginBottom: 4,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  explanationCard: {
    borderRadius: 10,
    paddingBottom: 12,
    borderWidth: 1,
  },
  explanationText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    paddingHorizontal: 16,
    lineHeight: 18,
    marginTop: -4,
  },
  settingsGroup: {
    paddingTop: 8,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertContent: {
    padding: 0,
    paddingBottom: 40,
    gap: 20,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
  },
  alertMessage: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.medium,
  },
  alertActions: {
    flexDirection: 'row',
    gap: 12,
  },
  alertButton: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertButtonTextPrimary: {
    fontFamily: Fonts.bold,
    fontSize: 16,
  },
  alertButtonTextSecondary: {
    fontFamily: Fonts.bold,
    fontSize: 16,
  },
  divider: {
    marginVertical: 4,
    marginHorizontal: 16,
  },
});

export default ToolScreen;
