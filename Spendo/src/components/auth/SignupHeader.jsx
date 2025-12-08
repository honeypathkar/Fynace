import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { UserPlus } from 'lucide-react-native';
import styles from './styles';

const SignupHeader = ({ title, subtitle }) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.iconContainer}>
        <UserPlus color="#3A6FF8" size={32} />
      </View>
      <Text variant="headlineMedium" style={styles.title}>
        {title}
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        {subtitle}
      </Text>
    </View>
  );
};

export default SignupHeader;

