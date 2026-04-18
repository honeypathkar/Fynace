import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  ScrollView,
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
} from 'lucide-react-native';
import Fonts from '../../../assets/fonts';
import { FRONTEND_URL } from '../../utils/BASE_URL';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const theme = useTheme();

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

  const MenuItem = ({ icon: Icon, label, onPress, isDestructive = false, right }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: '#0F0F0F' }]}
    >
      <View style={styles.menuItemLeft}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: isDestructive ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.07)' },
          ]}
        >
          <Icon size={20} color={isDestructive ? '#EF4444' : '#FFFFFF'} />
        </View>
        <Text
          style={[
            styles.menuItemLabel,
            isDestructive && { color: '#EF4444' },
          ]}
        >
          {label}
        </Text>
      </View>
      <View style={styles.menuItemRight}>
        {right
          ? right
          : !isDestructive && <ChevronRight size={18} color="#404040" />}
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
    <SafeAreaView edges={['top']} style={styles.container}>
      <GlobalHeader
        title="Profile"
        titleColor="#FFFFFF"
        backgroundColor="transparent"
        showLeftIcon
        leftIconColor="#FFFFFF"
        onLeftIconPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

          {/* Avatar Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <User size={52} color={theme.colors.secondary} />
            </View>
            <Text style={styles.userName}>{user?.fullName || 'User Name'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
          </View>

          {/* Menu */}
          <View style={styles.menuContainer}>

            <MenuItem
              icon={Pencil}
              label="Edit Profile"
              onPress={() => navigation.navigate('EditProfile')}
            />

            <Text style={styles.sectionLabel}>Tools & Preferences</Text>

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

            <Text style={styles.sectionLabel}>More</Text>

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

            <View style={styles.menuDivider} />

            <MenuItem
              icon={LogOut}
              label="Logout"
              onPress={handleLogout}
              isDestructive
            />
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
    backgroundColor: '#0D0D0D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(211,211,255,0.25)',
  },
  userName: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#808080',
    fontFamily: Fonts.regular,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: '#404040',
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
    color: '#FFFFFF',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 8,
    marginHorizontal: 8,
  },
});
