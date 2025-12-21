import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import styles from './styles';

const LineChartCard = ({
  title,
  netBalance,
  netBalanceLabel,
  lineChartData,
  screenWidth,
  chartConfig,
}) => {
  return (
    <View style={styles.chartCard}>
      <Text variant="titleMedium" style={styles.sectionTitle}>{title}</Text>
      <Text variant="displaySmall" style={styles.netBalance}>
        ₹{netBalance.toLocaleString()}
        <Text variant="bodyMedium" style={styles.netBalanceLabel}>
          {' '}{netBalanceLabel}
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
            formatYLabel={(value) => {
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
    </View>
  );
};

export default LineChartCard;

