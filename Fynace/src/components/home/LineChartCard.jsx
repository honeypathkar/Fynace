import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';
import { usePrivacy } from '../../context/PrivacyContext';
import { useAuth } from '../../hooks/useAuth';

const LineChartCard = ({
  title,
  netBalance,
  netBalanceLabel,
  lineChartData,
  screenWidth,
  chartConfig,
}) => {
  const { user } = useAuth();
  const { formatAmount, isPrivacyMode } = usePrivacy();
  return (
    <LinearGradient
      colors={['#1E293B', '#0F172A', '#1E293B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.chartCard}
    >
      <Text variant="titleMedium" style={styles.sectionTitle}>
        {title}
      </Text>
      <Text
        variant="displaySmall"
        style={[styles.netBalance, { textAlign: 'left' }]}
      >
        {formatAmount(netBalance, user?.currency)}
        <Text variant="bodyMedium" style={styles.netBalanceLabel}>
          {' '}
          {netBalanceLabel}
        </Text>
      </Text>

      {lineChartData && lineChartData.labels.length > 0 ? (
        <View style={styles.chartWrapper}>
          <LineChart
            data={lineChartData}
            width={screenWidth - 48}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withDots={true}
            withInnerLines={true}
            withOuterLines={false}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            segments={4}
            fromZero={true}
            yAxisInterval={1}
            formatYLabel={value => {
              if (isPrivacyMode) return '***';
              const num = parseInt(value);
              if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
              if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
              return num.toString();
            }}
          />
        </View>
      ) : (
        <View style={styles.chartPlaceholder}>
          <Text style={styles.placeholderText}>No trend data available</Text>
          <Text style={styles.placeholderSubtext}>
            Add expenses to see your spending trends
          </Text>
        </View>
      )}
    </LinearGradient>
  );
};

export default LineChartCard;
