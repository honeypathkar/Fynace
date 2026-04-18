import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { Plus } from 'lucide-react-native';
import styles from './styles';
import { usePrivacy } from '../../context/PrivacyContext';
import { useAuth } from '../../hooks/useAuth';

import { useTheme } from 'react-native-paper';

const ExpenseSummary = ({ allTimeSummary, onAddPress, styles: propStyles }) => {
  const { user } = useAuth();
  const { formatAmount } = usePrivacy();
  const theme = useTheme();
  const styles = propStyles || require('./styles').getStyles(theme);

  return (
    <Card style={styles.summaryCard}>
      <Card.Content>
        <View style={styles.summaryHeader}>
          <Text variant="titleMedium" style={styles.summaryTitle}>
            Summary
          </Text>
          <TouchableOpacity
            style={styles.summaryAddButton}
            onPress={onAddPress}
            activeOpacity={0.7}
          >
            <Plus size={18} color={theme.colors.secondary} />
            <Text style={styles.summaryAddButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text variant="labelMedium" style={styles.summaryLabel}>
              Money In
            </Text>
            <Text variant="headlineSmall" style={styles.summaryValueIn}>
              {formatAmount(allTimeSummary?.totalMoneyIn || 0, user?.currency)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text variant="labelMedium" style={styles.summaryLabel}>
              Money Out
            </Text>
            <Text variant="headlineSmall" style={styles.summaryValueOut}>
              {formatAmount(allTimeSummary?.totalMoneyOut || 0, user?.currency)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text variant="labelMedium" style={styles.summaryLabel}>
              Remaining
            </Text>
            <Text variant="headlineSmall" style={styles.summaryValueRemaining}>
              {formatAmount(allTimeSummary?.remaining || 0, user?.currency)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text variant="labelMedium" style={styles.summaryLabel}>
              Entries
            </Text>
            <Text variant="headlineSmall" style={styles.summaryGeneric}>
              {allTimeSummary?.totalExpenses || 0}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

export default React.memo(ExpenseSummary);
