import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text } from 'react-native-paper';
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
} from 'lucide-react-native';
import Fonts from '../../../assets/fonts';
import { FRONTEND_URL } from '../../utils/BASE_URL';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

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
      navigation.reset({
        index: 0,
        routes: [{ name: 'Splash' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Splash' }],
      });
    }
  };

  const MenuItem = ({
    icon: Icon,
    label,
    onPress,
    isDestructive = false,
    right,
  }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed,
      ]}
    >
      <View style={styles.menuItemLeft}>
        <View
          style={[
            styles.iconContainer,
            isDestructive && styles.iconContainerDestructive,
          ]}
        >
          <Icon size={20} color={isDestructive ? '#EF4444' : '#1E293B'} />
        </View>
        <Text
          style={[
            styles.menuItemLabel,
            isDestructive && styles.menuItemLabelDestructive,
          ]}
        >
          {label}
        </Text>
      </View>
      <View style={styles.menuItemRight}>
        {right
          ? right
          : !isDestructive && <ChevronRight size={20} color="#94A3B8" />}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <GlobalHeader
        title="Profile"
        titleColor="#F8FAFC"
        backgroundColor="transparent"
        showLeftIcon
        leftIconColor="#F8FAFC"
        onLeftIconPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <User size={64} color="#F97316" />
            </View>
            <Text style={styles.userName}>{user?.fullName || 'User Name'}</Text>
            <Text style={styles.userEmail}>
              {user?.email || 'user@example.com'}
            </Text>
          </View>

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
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  profileCard: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFE4D6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 4,
    borderColor: '#1E293B',
  },
  userName: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: '#F8FAFC',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 16,
    color: '#94A3B8',
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
  iconContainerDestructive: {
    backgroundColor: '#FEE2E2',
  },
  menuItemLabel: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: '#F8FAFC',
  },
  menuItemLabelDestructive: {
    color: '#EF4444',
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
  menuDivider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 8,
    marginHorizontal: 16,
  },
});
