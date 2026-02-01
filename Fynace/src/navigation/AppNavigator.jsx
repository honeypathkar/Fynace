import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { Home, PieChart } from 'lucide-react-native';
import SplashScreen from '../screens/Auth/SplashScreen';
import OnboardingScreen from '../screens/Auth/OnboardingScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import ExpensesScreen from '../screens/Expenses/ExpensesScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import ToolScreen from '../screens/Profile/ToolScreen';
import MoneyInScreen from '../screens/MoneyIn/MoneyInScreen';
import ExcelUploadScreen from '../screens/Expenses/ExcelUploadScreen';
import AddExpenseScreen from '../screens/Expenses/AddExpenseScreen';
import QRScannerScreen from '../screens/Expenses/QRScannerScreen';
import AddQRBasedExpenseScreen from '../screens/Expenses/AddQRBasedExpenseScreen';
import WebViewScreen from '../screens/Profile/WebViewScreen';
import CustomTabBar from './CustomTabBar';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const AppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Home
              color={color}
              size={size || 24}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{
          title: 'Expenses',
          tabBarIcon: ({ color, size, focused }) => (
            <PieChart
              color={color}
              size={size || 24}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const paperTheme = useTheme();

  const navigationTheme = React.useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        primary: paperTheme.colors.primary,
        background: paperTheme.colors.background,
        card: paperTheme.colors.surface,
        text: paperTheme.colors.onSurface,
        border: paperTheme.colors.surfaceVariant,
        notification: paperTheme.colors.secondary,
      },
    }),
    [paperTheme.colors],
  );

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="AppTabs"
          component={AppTabs}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Tools"
          component={ToolScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="MoneyIn"
          component={MoneyInScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="ExcelUpload"
          component={ExcelUploadScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="AddExpense"
          component={AddExpenseScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="QRScanner"
          component={QRScannerScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="AddQRBasedExpense"
          component={AddQRBasedExpenseScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="WebView"
          component={WebViewScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
