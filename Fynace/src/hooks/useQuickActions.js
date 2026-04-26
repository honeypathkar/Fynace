import { useEffect } from 'react';
import { DeviceEventEmitter, Platform } from 'react-native';
import QuickActions from 'react-native-quick-actions';
import { navigate, navigationRef } from '../navigation/navigationRef';

const useQuickActions = () => {
  useEffect(() => {
    const performNavigation = (type) => {
      const routeMap = {
        add_expense: 'AddExpense',
        scan_qr: 'QRScanner',
        view_budgets: 'Budgets',
      };

      const routeName = routeMap[type];
      if (!routeName) return;

      const attemptNavigate = () => {
        if (navigationRef.isReady()) {
          const currentRoute = navigationRef.getCurrentRoute();
          console.log('📍 Current Route:', currentRoute?.name);
          // Wait until we are off the Splash screen to avoid being overridden by Splash navigation logic
          if (currentRoute && currentRoute.name !== 'Splash') {
            console.log('✅ Navigating to:', routeName);
            navigate(routeName);
          } else {
            console.log('⏳ Still on Splash, waiting...');
            setTimeout(attemptNavigate, 200);
          }
        } else {
          // If not ready, try again in 500ms
          setTimeout(attemptNavigate, 500);
        }
      };

      attemptNavigate();
    };

    const handleAction = (data) => {
      console.log('🚀 Quick Action received:', data);
      if (!data) return;
      performNavigation(data.type);
    };

    // Clear and set dynamic shortcuts (prevents duplicates and stale items)
    QuickActions.clearShortcutItems();
    QuickActions.setShortcutItems([
      {
        type: 'add_expense',
        title: 'Add Expense',
        subtitle: 'Add a new expense',
        icon: Platform.OS === 'android' ? 'ic_shortcut_add' : 'Compose',
        userInfo: {},
      },
      {
        type: 'scan_qr',
        title: 'Scan QR',
        subtitle: 'Scan QR to add expense',
        icon: Platform.OS === 'android' ? 'ic_shortcut_scan' : 'CaptureVideo',
        userInfo: {},
      },
      {
        type: 'view_budgets',
        title: 'Budgets',
        subtitle: 'View your budgets',
        icon: Platform.OS === 'android' ? 'ic_shortcut_budget' : 'Date',
        userInfo: {},
      },
    ]);

    // Handle actions when the app is already open
    const subscription = DeviceEventEmitter.addListener(
      'quickActionShortcut',
      handleAction
    );

    // Handle actions when the app is launched from a shortcut
    // Added a small delay to ensure native side is ready
    const timer = setTimeout(() => {
      QuickActions.popInitialAction()
        .then(data => {
          console.log('🚀 Initial Quick Action:', data);
          handleAction(data);
        })
        .catch(console.error);
    }, 1000);

    return () => {
      subscription.remove();
      clearTimeout(timer);
    };
  }, []);
};

export default useQuickActions;
