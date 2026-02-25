import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Platform,
  PermissionsAndroid,
  ToastAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { useNavigation } from '@react-navigation/native';
import { Text, Switch, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronRight,
  EyeOff,
  Globe,
  Fingerprint,
  Bell,
  Search,
} from 'lucide-react-native';
import GlobalHeader from '../../components/GlobalHeader';
import BottomSheet from '../../components/BottomSheet';
import { useAuth } from '../../hooks/useAuth';
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

const ToolScreen = () => {
  const navigation = useNavigation();
  const { user, updateProfile } = useAuth();
  const { isPrivacyMode, togglePrivacyMode } = usePrivacy();
  const { isBiometricEnabled, toggleBiometric, isSupported } = useSecurity();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [smsTrackingEnabled, setSmsTrackingEnabled] = useState(false);
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

  const CURRENCIES = [
    { label: 'Indian Rupee (₹)', value: 'INR' },
    { label: 'US Dollar ($)', value: 'USD' },
    { label: 'Euro (€)', value: 'EUR' },
    { label: 'British Pound (£)', value: 'GBP' },
    { label: 'Japanese Yen (¥)', value: 'JPY' },
    { label: 'Australian Dollar ($)', value: 'AUD' },
    { label: 'Canadian Dollar ($)', value: 'CAD' },
    { label: 'Swiss Franc (CHF)', value: 'CHF' },
    { label: 'Chinese Yuan (¥)', value: 'CNY' },
    { label: 'UAE Dirham (د.إ)', value: 'AED' },
    { label: 'Singapore Dollar ($)', value: 'SGD' },
  ];

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
          setNotificationsEnabled(notifGranted);
          setSmsTrackingEnabled(smsReadGranted);
        } else {
          const status = await checkPerm(PERMISSIONS.IOS.NOTIFICATIONS);
          setNotificationsEnabled(status === RESULTS.GRANTED);
        }
      } catch (err) {
        console.warn('Error checking permissions', err);
      }
    };
    checkPermissions();
  }, []);

  const handleNotificationToggle = async value => {
    if (value) {
      try {
        let authStatus;
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Notification Access',
              message: 'Get spending alerts and budget reminders.',
              buttonPositive: 'Allow',
            },
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
          setNotificationsEnabled(true);
        } else {
          setNotificationsEnabled(false);
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
      } catch (err) {
        console.warn('Notification toggle error:', err);
        setNotificationsEnabled(false);
      }
    } else {
      setNotificationsEnabled(false);
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

  const handleCurrencyChange = async currency => {
    try {
      await updateProfile({ currency });
    } catch (err) {
      console.error('Failed to update currency', err);
      ToastAndroid.show(
        'Failed to update currency preference',
        ToastAndroid.SHORT,
      );
    }
  };

  const handleSettingToggle = async (key, value) => {
    try {
      await updateProfile({
        notificationSettings: {
          ...user?.notificationSettings,
          [key]: value,
        },
      });
    } catch (err) {
      console.error('Failed to update setting', err);
      ToastAndroid.show('Failed to update setting', ToastAndroid.SHORT);
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
          <Icon size={20} color="#1E293B" />
        </View>
        <Text style={styles.menuItemLabel}>{label}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {right ? right : <ChevronRight size={20} color="#94A3B8" />}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <GlobalHeader
        title="Tools & Settings"
        titleColor="#F8FAFC"
        backgroundColor="transparent"
        showLeftIcon
        leftIconName="arrow-left"
        leftIconColor="#F8FAFC"
        onLeftIconPress={() => navigation.goBack()}
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
                <Switch
                  value={isBiometricEnabled}
                  onValueChange={toggleBiometric}
                  color="#3A6FF8"
                />
              }
            />
          )}

          <MenuItem
            icon={EyeOff}
            label="Privacy Mode"
            onPress={togglePrivacyMode}
            right={
              <Switch
                value={isPrivacyMode}
                onValueChange={togglePrivacyMode}
                color="#3A6FF8"
              />
            }
          />

          <Text style={styles.sectionLabel}>Regional Preferences</Text>

          <MenuItem
            icon={Globe}
            label="Currency"
            onPress={() => currencySheetRef.current?.open()}
            right={
              <View style={styles.currencyBadge}>
                <Text style={styles.currencyBadgeText}>
                  {user?.currency || 'INR'}
                </Text>
                <ChevronRight size={16} color="#94A3B8" />
              </View>
            }
          />

          <BottomSheet
            ref={currencySheetRef}
            title="Select Currency"
            options={CURRENCIES}
            selectedValue={user?.currency || 'INR'}
            onSelect={handleCurrencyChange}
            initialHeight={0.6}
          />

          <Text style={styles.sectionLabel}>Notifications & Automation</Text>

          <View style={styles.explanationCard}>
            <MenuItem
              icon={Bell}
              label="Push Notifications"
              onPress={() => handleNotificationToggle(!notificationsEnabled)}
              right={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleNotificationToggle}
                  color="#3A6FF8"
                />
              }
            />
            <Text style={styles.explanationText}>
              Get alerts for budget limits, spending milestones, and bill
              reminders.
            </Text>

            {notificationsEnabled && (
              <View style={styles.settingsGroup}>
                <Divider style={styles.divider} />
                <MenuItem
                  icon={ChevronRight}
                  label="Daily Reminders"
                  right={
                    <Switch
                      value={user?.notificationSettings?.dailyReminder}
                      onValueChange={v =>
                        handleSettingToggle('dailyReminder', v)
                      }
                      color="#3A6FF8"
                    />
                  }
                />
                <MenuItem
                  icon={ChevronRight}
                  label="Monthly Summaries"
                  right={
                    <Switch
                      value={user?.notificationSettings?.monthlySummary}
                      onValueChange={v =>
                        handleSettingToggle('monthlySummary', v)
                      }
                      color="#3A6FF8"
                    />
                  }
                />
                <MenuItem
                  icon={ChevronRight}
                  label="Budget Alerts"
                  right={
                    <Switch
                      value={user?.notificationSettings?.budgetAlerts}
                      onValueChange={v =>
                        handleSettingToggle('budgetAlerts', v)
                      }
                      color="#3A6FF8"
                    />
                  }
                />
                <MenuItem
                  icon={ChevronRight}
                  label="Smart Insights"
                  right={
                    <Switch
                      value={user?.notificationSettings?.smartInsights}
                      onValueChange={v =>
                        handleSettingToggle('smartInsights', v)
                      }
                      color="#3A6FF8"
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
                    color="#3A6FF8"
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
            initialHeight={0.35}
          >
            <View style={styles.alertContent}>
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
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: '#64748B',
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
    backgroundColor: '#1E293B',
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
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: '#F8FAFC',
  },
  explanationCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 20,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  explanationText: {
    fontSize: 12,
    color: '#94A3B8',
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
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  currencyBadgeText: {
    color: '#3A6FF8',
    fontFamily: Fonts.bold,
    fontSize: 14,
  },
  menuContent: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
  },
  menuItemText: {
    color: '#F8FAFC',
    fontFamily: Fonts.medium,
  },
  alertContent: {
    padding: 16,
    gap: 20,
  },
  alertMessage: {
    color: '#94A3B8',
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.medium,
    textAlign: 'center',
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
    backgroundColor: '#3A6FF8',
  },
  alertButtonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  alertButtonTextPrimary: {
    color: '#F8FAFC',
    fontFamily: Fonts.bold,
    fontSize: 16,
  },
  alertButtonTextSecondary: {
    color: '#94A3B8',
    fontFamily: Fonts.bold,
    fontSize: 16,
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 4,
    marginHorizontal: 16,
  },
});
