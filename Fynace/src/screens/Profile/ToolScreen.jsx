import React, { useState } from 'react';
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { useNavigation } from '@react-navigation/native';
import { Text, Divider } from 'react-native-paper';
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

const CustomToggle = ({ value, onValueChange }) => (
  <TouchableOpacity
    onPress={() => onValueChange(!value)}
    style={{
      width: 50,
      height: 26,
      borderRadius: 13,
      backgroundColor: value ? '#d3d3ff' : '#1A1A1A',
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

const ToolScreen = () => {
  const navigation = useNavigation();
  const { user, updateProfile } = useAuth();
  const { isPrivacyMode, togglePrivacyMode } = usePrivacy();
  const { isBiometricEnabled, toggleBiometric, isSupported } = useSecurity();
  const [hasSystemPermission, setHasSystemPermission] = useState(false);
  const [smsTrackingEnabled, setSmsTrackingEnabled] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const currencySheetRef = React.useRef(null);
  const alertSheetRef = React.useRef(null);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel',
    onConfirm: null,
    showCancel: false,
    type: 'info',
  });

  const showAlert = (title, message, options = {}) => {
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
  };

  React.useEffect(() => {
    const checkPermissions = async () => {
      try {
        if (Platform.OS === 'android') {
          const notifGranted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          const smsReadGranted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_SMS,
          );
          setHasSystemPermission(notifGranted);
          setSmsTrackingEnabled(smsReadGranted);
        } else {
          const status = await checkPerm(PERMISSIONS.IOS.NOTIFICATIONS);
          setHasSystemPermission(status === RESULTS.GRANTED);
        }
      } catch (err) {
        console.warn('Error checking permissions', err);
      }
    };
    checkPermissions();
  }, []);

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

  const handleSmsToggle = async value => {
    if (Platform.OS !== 'android') {
      ToastAndroid.show(
        'Automatic SMS tracking is only available on Android devices.',
        ToastAndroid.SHORT,
      );
      return;
    }

    if (value) {
      showAlert(
        'Automatic Tracking',
        'Fynace can read bank SMS alerts to automatically log your expenses. We only scan financial messages.',
        {
          confirmText: 'Enable',
          showCancel: true,
          onConfirm: async () => {
            try {
              const status = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_SMS,
                {
                  title: 'SMS Permission',
                  message:
                    'Fynace needs access to your SMS to automatically track bank transactions.',
                  buttonPositive: 'OK',
                },
              );
              if (status === PermissionsAndroid.RESULTS.GRANTED) {
                await PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
                );
                setSmsTrackingEnabled(true);
              } else {
                setSmsTrackingEnabled(false);
              }
            } catch (err) {
              console.warn(err);
              setSmsTrackingEnabled(false);
            }
          },
        },
      );
    } else {
      setSmsTrackingEnabled(false);
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

  const MenuItem = ({ icon: Icon, label, onPress, right }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed,
      ]}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.iconContainer}>
          <Icon size={20} color="#FFFFFF" />
        </View>
        <Text style={styles.menuItemLabel}>{label}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {right ? right : <ChevronRight size={20} color="#808080" />}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <GlobalHeader
        title="Tools & Settings"
        titleColor="#FFFFFF"
        backgroundColor="transparent"
        showLeftIcon
        leftIconName="arrow-left"
        leftIconColor="#FFFFFF"
        onLeftIconPress={() => navigation.goBack()}
        rightIconComponent={
          isUpdating ? <ActivityIndicator size="small" color="#FFFFFF" /> : null
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.menuContainer}>
          <Text style={styles.sectionLabel}>Privacy & Security</Text>

          {isSupported && (
            <MenuItem
              icon={Fingerprint}
              label="Biometric Lock"
              onPress={toggleBiometric}
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
            right={
              <CustomToggle
                value={isPrivacyMode}
                onValueChange={togglePrivacyMode}
              />
            }
          />

          <Text style={styles.sectionLabel}>Notifications & Automation</Text>

          <View style={styles.explanationCard}>
            <MenuItem
              icon={Bell}
              label="Push Notifications"
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
            <Text style={styles.explanationText}>
              Get alerts for budget limits, spending milestones, and bill
              reminders.
            </Text>

            {user?.notificationSettings?.pushNotificationsEnabled && (
              <View style={styles.settingsGroup}>
                <Divider style={styles.divider} />
                <MenuItem
                  icon={ChevronRight}
                  label="Daily Reminders"
                  right={
                    <CustomToggle
                      value={user?.notificationSettings?.dailyReminder}
                      onValueChange={v =>
                        handleSettingToggle('dailyReminder', v)
                      }
                    />
                  }
                />
                <MenuItem
                  icon={ChevronRight}
                  label="Monthly Summaries"
                  right={
                    <CustomToggle
                      value={user?.notificationSettings?.monthlySummary}
                      onValueChange={v =>
                        handleSettingToggle('monthlySummary', v)
                      }
                    />
                  }
                />
                <MenuItem
                  icon={ChevronRight}
                  label="Budget Alerts"
                  right={
                    <CustomToggle
                      value={user?.notificationSettings?.budgetAlerts}
                      onValueChange={v =>
                        handleSettingToggle('budgetAlerts', v)
                      }
                    />
                  }
                />
                <MenuItem
                  icon={ChevronRight}
                  label="Smart Insights"
                  right={
                    <CustomToggle
                      value={user?.notificationSettings?.smartInsights}
                      onValueChange={v =>
                        handleSettingToggle('smartInsights', v)
                      }
                    />
                  }
                />
                <Divider style={styles.divider} />
                <MenuItem
                  icon={ChevronRight}
                  label="Recurring Transactions"
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

          {/* {Platform.OS === 'android' && (
            <View style={[styles.explanationCard, { marginTop: 12 }]}>
              <MenuItem
                icon={Search}
                label="Automatic SMS Tracking"
                onPress={() => handleSmsToggle(!smsTrackingEnabled)}
                right={
                  <Switch
                    value={smsTrackingEnabled}
                    onValueChange={handleSmsToggle}
                    color="#d3d3ff"
                  />
                }
              />
              <Text style={styles.explanationText}>
                Automatically log expenses from bank alerts. We only securely
                scan financial transaction messages.
              </Text>
              <Divider style={styles.divider} />
              <MenuItem
                icon={ChevronRight}
                label="SMS Config"
                onPress={() => navigation.navigate('BankSmsConfig')}
              />
            </View>
          )} */}

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
                          ? 'rgba(239, 68, 68, 0.1)'
                          : 'rgba(58, 111, 248, 0.1)',
                    },
                  ]}
                >
                  <AlertTriangle
                    size={24}
                    color={
                      alertConfig.type === 'danger' ? '#EF4444' : '#d3d3ff'
                    }
                  />
                </View>
                <Text style={styles.alertTitle}>{alertConfig.title}</Text>
              </View>

              <Text style={styles.alertMessage}>{alertConfig.message}</Text>

              <View style={styles.alertActions}>
                {alertConfig.showCancel && (
                  <Pressable
                    style={[styles.alertButton, styles.alertButtonSecondary]}
                    onPress={() => alertSheetRef.current?.close()}
                  >
                    <Text style={styles.alertButtonTextSecondary}>
                      {alertConfig.cancelText}
                    </Text>
                  </Pressable>
                )}
                <Pressable
                  style={[styles.alertButton, styles.alertButtonPrimary]}
                  onPress={() => {
                    alertSheetRef.current?.close();
                    if (alertConfig.onConfirm) alertConfig.onConfirm();
                  }}
                >
                  <Text style={styles.alertButtonTextPrimary}>
                    {alertConfig.confirmText}
                  </Text>
                </Pressable>
              </View>
            </View>
          </BottomSheet>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ToolScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: '#808080',
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
  menuItemPressed: {
    backgroundColor: '#121212',
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
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: '#FFFFFF',
  },
  explanationCard: {
    // backgroundColor: '#121212',
    borderRadius: 10,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.11)',
  },
  explanationText: {
    fontSize: 12,
    color: '#808080',
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
  currencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  currencyBadgeText: {
    color: '#d3d3ff',
    fontFamily: Fonts.bold,
    fontSize: 14,
  },
  menuContent: {
    backgroundColor: '#121212',
    borderRadius: 12,
  },
  menuItemText: {
    color: '#FFFFFF',
    fontFamily: Fonts.medium,
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
    color: '#FFFFFF',
  },
  alertMessage: {
    color: '#808080',
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
  alertButtonPrimary: {
    backgroundColor: '#d3d3ff',
  },
  alertButtonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  alertButtonTextPrimary: {
    color: '#FFFFFF',
    fontFamily: Fonts.bold,
    fontSize: 16,
  },
  alertButtonTextSecondary: {
    color: '#808080',
    fontFamily: Fonts.bold,
    fontSize: 16,
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 4,
    marginHorizontal: 16,
  },
});
