/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { buildPaperTheme } from './src/theme';
import { AuthProvider } from './src/hooks/useAuth';
import { BottomBarProvider } from './src/context/BottomBarContext';
import { PrivacyProvider } from './src/context/PrivacyContext';
import { SecurityProvider } from './src/context/SecurityContext';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import NotificationHandler from './src/components/NotificationHandler';

import { syncManager } from './src/sync/SyncManager';

function AppContent() {
  const { paperTheme, activeScheme } = useAppTheme();

  return (
    <PaperProvider theme={paperTheme}>
      <AuthProvider>
        <SecurityProvider>
          <PrivacyProvider>
            <BottomBarProvider>
              <NotificationHandler>
                <StatusBar
                  barStyle={activeScheme === 'dark' ? 'light-content' : 'dark-content'}
                  backgroundColor={paperTheme.colors.background}
                />
                <AppNavigator />
              </NotificationHandler>
            </BottomBarProvider>
          </PrivacyProvider>
        </SecurityProvider>
      </AuthProvider>
    </PaperProvider>
  );
}

function App() {
  React.useEffect(() => {
    // Initial background sync
    syncManager.sync().catch(console.error);
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
