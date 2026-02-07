import React from 'react';
import { View } from 'react-native';
import { Card, Chip, Text } from 'react-native-paper';
import styles from './styles';
import { usePrivacy } from '../../context/PrivacyContext';

const comparisonChipStyles = {
  positive: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  negative: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
};

const ExpenseComparison = ({ comparison }) => {
  const { isPrivacyMode } = usePrivacy();
  if (!comparison) return null;

  const comparisonKeys = ['moneyIn', 'moneyOut', 'remaining'];

  return (
    <Card style={styles.comparisonCard}>
      <Card.Title
        title="Month-over-month change"
        titleStyle={styles.comparisonTitle}
      />
      <Card.Content>
        {comparisonKeys.map(key => (
          <View key={key} style={styles.comparisonRow}>
            <Text variant="bodyLarge" style={styles.comparisonLabel}>
              {key === 'moneyIn'
                ? 'Money In'
                : key === 'moneyOut'
                ? 'Money Out'
                : 'Remaining'}
            </Text>
            <View style={styles.comparisonValues}>
              <Text variant="bodyMedium">
                {isPrivacyMode
                  ? '******'
                  : (comparison[key].difference >= 0 ? '+' : '') +
                    comparison[key].difference.toLocaleString()}
              </Text>
              <Chip
                compact
                style={[
                  styles.comparisonChip,
                  comparison[key].difference >= 0
                    ? comparisonChipStyles.positive
                    : comparisonChipStyles.negative,
                ]}
              >
                {comparison[key].percentageChange.toFixed(1)}%
              </Chip>
            </View>
          </View>
        ))}
      </Card.Content>
    </Card>
  );
};

export default React.memo(ExpenseComparison);
