import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlobalHeader from '../../components/GlobalHeader';
import { useAuth } from '../../hooks/useAuth';
import {
  User,
  Pencil,
  Wrench,
  Info,
  Shield,
  LogOut,
  ChevronRight,
  Target,
  Clock,
  Palette,
} from 'lucide-react-native';
import Fonts from '../../../assets/fonts';
import { FRONTEND_URL } from '../../utils/BASE_URL';
import { useAppTheme } from '../../context/ThemeContext';
import BottomSheet from '../../components/BottomSheet';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const { themeMode, setThemeMode } = useAppTheme();

  const themeSheetRef = useRef(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({ index: 0, routes: [{ name: 'Splash' }] });
    } catch (error) {
      console.error('Logout error:', error);
      navigation.reset({ index: 0, routes: [{ name: 'Splash' }] });
    }
  };

  const themeOptions = [
    { label: 'Light Mode', value: 'light' },
    { label: 'Dark Mode', value: 'dark' },
    { label: 'System Default', value: 'system' },
  ];

  const MenuItem = ({ icon: Icon, label, onPress, isDestructive = false, right }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem, 
        pressed && { backgroundColor: theme.colors.elevation.level1 }
      ]}
    >
      <View style={styles.menuItemLeft}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: isDestructive ? `${theme.colors.error}1F` : theme.colors.elevation.level1 },
          ]}
        >
          <Icon size={20} color={isDestructive ? theme.colors.error : theme.colors.text} />
        </View>
        <Text
          style={[
            styles.menuItemLabel,
            isDestructive && { color: theme.colors.error },
          ]}
        >
          {label}
        </Text>
      </View>
      <View style={styles.menuItemRight}>
        {right
          ? right
          : !isDestructive && <ChevronRight size={18} color={theme.colors.onSurfaceVariant} />}
      </View>
    </Pressable>
  );

  const initials = (user?.fullName || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={theme.dark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background} 
      />
      <GlobalHeader
        title="Profile"
        showLeftIcon
        onLeftIconPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

          {/* Avatar Card */}
          <View style={styles.profileCard}>
            <View style={[
              styles.avatarContainer, 
              { 
                backgroundColor: theme.colors.elevation.level1,
                borderColor: theme.colors.outlineVariant,
              }
            ]}>
              <User size={52} color={theme.colors.secondary} />
            </View>
            <Text style={[styles.userName, { color: theme.colors.text }]}>{user?.fullName || 'User Name'}</Text>
            <Text style={[styles.userEmail, { color: theme.colors.onSurfaceVariant }]}>{user?.email || 'user@example.com'}</Text>
          </View>

          {/* Menu */}
          <View style={styles.menuContainer}>

            <MenuItem
              icon={Pencil}
              label="Edit Profile"
              onPress={() => navigation.navigate('EditProfile')}
            />

            <Text style={[styles.sectionLabel, { color: theme.colors.primary }]}>Tools & Preferences</Text>

            <MenuItem
              icon={Wrench}
              label="Tools & Privacy"
              onPress={() => navigation.navigate('Tools')}
            />
            <MenuItem
              icon={Target}
              label="Budgets"
              onPress={() => navigation.navigate('Budgets')}
            />
            <MenuItem
              icon={Clock}
              label="Recurring Transactions"
              onPress={() => navigation.navigate('RecurringTransactions')}
            />
            <MenuItem
              icon={Palette}
              label="Appearance"
              onPress={() => themeSheetRef.current?.open()}
              right={
                <Text style={{ 
                  color: theme.colors.onSurfaceVariant, 
                  fontSize: 14, 
                  fontFamily: Fonts.medium,
                  textTransform: 'capitalize' 
                }}>
                  {themeMode}
                </Text>
              }
            />

            <Text style={[styles.sectionLabel, { color: theme.colors.primary }]}>More</Text>

            <MenuItem
              icon={Shield}
              label="Privacy Policy"
              onPress={() =>
                navigation.navigate('WebView', {
                  url: `${FRONTEND_URL}/privacy-policy`,
                  title: 'Privacy Policy',
                })
              }
            />
            <MenuItem
              icon={Info}
              label="Terms & Conditions"
              onPress={() =>
                navigation.navigate('WebView', {
                  url: `${FRONTEND_URL}/terms-and-conditions`,
                  title: 'Terms & Conditions',
                })
              }
            />

            <View style={[styles.menuDivider, { backgroundColor: theme.colors.outlineVariant }]} />

            <MenuItem
              icon={LogOut}
              label="Logout"
              onPress={handleLogout}
              isDestructive
            />
          </View>
        </Animated.View>
      </ScrollView>

      <BottomSheet
        ref={themeSheetRef}
        title="App Appearance"
        options={themeOptions}
        selectedValue={themeMode}
        onSelect={(val) => {
          setThemeMode(val);
        }}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  content: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  profileCard: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 36,
  },
  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
  },
  userName: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: Fonts.regular,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: 28,
    marginBottom: 6,
    marginLeft: 4,
    alignSelf: 'flex-start',
  },
  menuContainer: {
    width: '100%',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuDivider: {
    height: 1,
    marginVertical: 8,
    marginHorizontal: 8,
  },
});
