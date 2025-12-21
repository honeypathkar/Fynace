import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import styles from './styles';

const EmptyState = () => {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No money in entries yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the "Add" button to record your first income
      </Text>
    </View>
  );
};

export default EmptyState;

