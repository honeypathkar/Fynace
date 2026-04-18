import React from 'react';
import { View } from 'react-native';
import { Card, Chip, Text, useTheme } from 'react-native-paper';
import { usePrivacy } from '../../context/PrivacyContext';

const ExpenseComparison = ({ comparison, styles: propStyles }) => {
  const { isPrivacyMode } = usePrivacy();
  const theme = useTheme();
  const styles = propStyles || require('./styles').getStyles(theme);

  if (!comparison) return null;

  const comparisonKeys = ['moneyIn', 'moneyOut', 'remaining'];

  const comparisonChipStyles = {
    positive: {
      backgroundColor: theme.colors.success,
      borderColor: theme.colors.success,
    },
    negative: {
      backgroundColor: theme.colors.error,
      borderColor: theme.colors.error,
    },
  };

  return (
    <Card style={styles.comparisonCard}>
      <Card.Title
        title="Month-over-month change"
        titleStyle={styles.comparisonTitle}
      />
      <Card.Content>
        {comparisonKeys.map(key => (
          <View key={key} style={styles.comparisonRow}>
            <Text variant="bodyLarge" style={[styles.comparisonLabel, { color: theme.colors.text }]}>
              {key === 'moneyIn'
                ? 'Money In'
                : key === 'moneyOut'
                ? 'Money Out'
                : 'Remaining'}
            </Text>
            <View style={styles.comparisonValues}>
              <Text variant="bodyMedium" style={{ color: theme.colors.text }}>
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
                textStyle={{ color: '#FFFFFF' }}
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
