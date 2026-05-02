import { useEffect, useCallback } from 'react';
import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType, AndroidStyle } from '@notifee/react-native';
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

    const imageUrl = remoteMessage.notification?.android?.imageUrl || remoteMessage.data?.image;

    // Display notification using Notifee
    await notifee.displayNotification({
      title: remoteMessage.notification?.title || 'Fynace Update',
      body: remoteMessage.notification?.body || 'New financial insight available',
      android: {
        channelId,
        smallIcon: 'ic_launcher_monochrome', // Using the monochrome launcher icon for better visibility on Android
        color: '#6060FF', // Tinting the icon with the app's primary color
        style: imageUrl
          ? {
              type: AndroidStyle.BIGPICTURE,
              picture: imageUrl,
            }
          : {
              type: AndroidStyle.BIGTEXT,
              text: remoteMessage.notification?.body || 'New financial insight available',
            },
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
    if (!data) return;

    // Handle URLs (Deep Link or Web Link)
    if (data.url) {
      const url = data.url;
      console.log('🔗 Handling URL:', url);
      
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url).catch(err => {
            console.error('Failed to open URL:', err);
            // Fallback: If it's a deep link that failed, maybe try navigating manually if possible
          });
        } else {
          console.warn('Don\'t know how to open URI: ' + url);
          // If it's a web link, try opening it anyway as browsers usually handle it
          if (url.startsWith('http')) {
            Linking.openURL(url).catch(err => console.error('Browser open failed:', err));
          }
        }
      });
      return;
    }

    if (!data.screen) return;

    console.log('🎯 Navigating to screen:', data.screen);
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
      // Check if we already have permission without prompting
      let enabled = false;
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        enabled = granted;
      } else {
        const authStatus = await messaging().hasPermission();
        enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      }

      if (!enabled) return;

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

      // Handle background events from Notifee (Interaction)
      const unsubscribeNotifeeBackground = notifee.onBackgroundEvent(
        async ({ type, detail }) => {
          if (type === EventType.PRESS) {
            console.log('User pressed notification in background');
            navigateToScreen(detail.notification?.data);
          }
        },
      );

      // Handle foreground events from Notifee (Interaction)
      const unsubscribeNotifeeForeground = notifee.onForegroundEvent(
        async ({ type, detail }) => {
          if (type === EventType.PRESS) {
            console.log('User pressed notification in foreground');
            navigateToScreen(detail.notification?.data);
          }
        },
      );

      // Handle when app is opened from a quit state (FCM)
      messaging()
        .getInitialNotification()
        .then(remoteMessage => {
          if (remoteMessage) {
            console.log('App opened from quit state:', remoteMessage);
            navigateToScreen(remoteMessage.data);
          }
        });

      // Handle when app is in background but still running (FCM)
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
