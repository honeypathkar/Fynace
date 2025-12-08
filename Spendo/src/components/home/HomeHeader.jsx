import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { UserRound } from 'lucide-react-native';
import styles from './styles';

const HomeHeader = ({ userName, onProfilePress }) => {
  const firstName = userName?.split(' ')[0] || 'User';

  return (
    <View style={styles.header}>
      <View>
        <Text variant="headlineSmall" style={styles.greeting}>
          Hello, {firstName}
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Here's your financial overview
        </Text>
      </View>
      <TouchableOpacity
        style={styles.profileIcon}
        onPress={onProfilePress}
        activeOpacity={0.7}
      >
        <UserRound size={24} color="#F8FAFC" />
      </TouchableOpacity>
    </View>
  );
};

export default HomeHeader;

