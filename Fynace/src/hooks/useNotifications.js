import { useEffect, useCallback } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import DeviceInfo from 'react-native-device-info';
import { apiClient } from '../api/client';
import { useAuth } from './useAuth';
import { navigate } from '../navigation/navigationRef';

export const useNotifications = () => {
  const { token: authToken } = useAuth();

  const registerDeviceToken = useCallback(
    async fcmToken => {
      if (!authToken || !fcmToken) return;

      try {
        const deviceId = await DeviceInfo.getUniqueId();
        const deviceName = await DeviceInfo.getDeviceName();

        await apiClient.post('/auth/fcm-token', {
          deviceId,
          deviceName,
          token: fcmToken,
        });
        console.log('🚀 FCM Token registered with backend');
      } catch (error) {
        console.error('❌ Failed to register FCM token:', error);
      }
    },
    [authToken],
  );

  const onDisplayNotification = async remoteMessage => {
    // Basic channel setup for Android
    const channelId = await notifee.createChannel({
      id: 'fynace_alerts',
      name: 'Financial Alerts',
      importance: AndroidImportance.HIGH,
    });

    // Display notification using Notifee
    await notifee.displayNotification({
      title: remoteMessage.notification?.title || 'Fynace Update',
      body:
        remoteMessage.notification?.body || 'New financial insight available',
      android: {
        channelId,
        smallIcon: 'ic_launcher', // Ensure this exists or use a default
        pressAction: {
          id: 'default',
        },
      },
      data: remoteMessage.data,
    });
  };

  const requestUserPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Permission denied');
        return false;
      }
    }

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
      return true;
    }
    return false;
  };

  const navigateToScreen = useCallback(data => {
    if (!data || !data.screen) return;

    console.log('🎯 Navigating to screen:', data.screen);
    // Add logic for specific screens if needed
    // For now, we match basic route names
    const routeName = data.screen;

    // Use a small delay to ensure navigation is ready
    setTimeout(() => {
      if (routeName === 'Home' || routeName === 'Expenses') {
        // These are in AppTabs
        navigate('AppTabs', { screen: routeName });
      } else {
        navigate(routeName);
      }
    }, 500);
  }, []);

  useEffect(() => {
    if (!authToken) return;

    const setupNotifications = async () => {
      const hasPermission = await requestUserPermission();
      if (!hasPermission) return;

      const fcmToken = await messaging().getToken();
      await registerDeviceToken(fcmToken);

      const unsubscribeTokenRefresh = messaging().onTokenRefresh(token => {
        registerDeviceToken(token);
      });

      const unsubscribeOnMessage = messaging().onMessage(
        async remoteMessage => {
          console.log('Foreground message received:', remoteMessage);
          await onDisplayNotification(remoteMessage);
        },
      );

      // 1. Handle background events from Notifee (Interaction)
      const unsubscribeNotifeeBackground = notifee.onBackgroundEvent(
        async ({ type, detail }) => {
          if (type === EventType.PRESS) {
            console.log('User pressed notification in background');
            navigateToScreen(detail.notification?.data);
          }
        },
      );

      // 2. Handle foreground events from Notifee (Interaction)
      const unsubscribeNotifeeForeground = notifee.onForegroundEvent(
        async ({ type, detail }) => {
          if (type === EventType.PRESS) {
            console.log('User pressed notification in foreground');
            navigateToScreen(detail.notification?.data);
          }
        },
      );

      // 3. Handle when app is opened from a quit state (FCM)
      messaging()
        .getInitialNotification()
        .then(remoteMessage => {
          if (remoteMessage) {
            console.log('App opened from quit state:', remoteMessage);
            navigateToScreen(remoteMessage.data);
          }
        });

      // 4. Handle when app is in background but still running (FCM)
      const unsubscribeMessagingOpened = messaging().onNotificationOpenedApp(
        remoteMessage => {
          console.log('App opened from background state:', remoteMessage);
          navigateToScreen(remoteMessage.data);
        },
      );

      return () => {
        unsubscribeTokenRefresh();
        unsubscribeOnMessage();
        unsubscribeNotifeeBackground();
        unsubscribeNotifeeForeground();
        unsubscribeMessagingOpened();
      };
    };

    setupNotifications();
  }, [authToken, registerDeviceToken, navigateToScreen]);

  return {
    requestUserPermission,
  };
};
