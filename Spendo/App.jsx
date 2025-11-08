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

function App() {
  const scheme = useColorScheme();
  const paperTheme = React.useMemo(() => buildPaperTheme(scheme), [scheme]);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <AuthProvider>
          <StatusBar
            barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
            backgroundColor={paperTheme.colors.background}
          />
          <AppNavigator />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default App;
