import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { UserRound } from 'lucide-react-native';
import Fonts from '../../../assets/fonts';

const HomeHeader = ({ userName, onProfilePress }) => {
  const firstName = userName?.split(' ')[0] || 'User';

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>
          Hello, {firstName}
        </Text>
        <Text style={styles.subtitle}>
          Here's your financial overview
        </Text>
      </View>
      <TouchableOpacity
        style={styles.profileIcon}
        onPress={onProfilePress}
        activeOpacity={0.7}
      >
        <UserRound size={22} color="#FFFFFF" strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 26,
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#808080',
    marginTop: 2,
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
});

export default HomeHeader;
