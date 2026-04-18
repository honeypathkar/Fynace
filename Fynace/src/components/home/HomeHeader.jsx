import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { UserRound } from 'lucide-react-native';
import Fonts from '../../../assets/fonts';

const HomeHeader = ({ userName, onProfilePress }) => {
  const theme = useTheme();
  const firstName = userName?.split(' ')[0] || 'User';

  return (
    <View style={styles.header}>
      <View>
        <Text style={[styles.greeting, { color: theme.colors.text }]}>
          Hello, {firstName}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Here's your financial overview
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.profileIcon, 
          { 
            backgroundColor: theme.colors.surfaceVariant,
            borderColor: theme.colors.outlineVariant,
          }
        ]}
        onPress={onProfilePress}
        activeOpacity={0.7}
      >
        <UserRound size={22} color={theme.colors.onSurfaceVariant} strokeWidth={2} />
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
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    marginTop: 2,
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});

export default HomeHeader;
