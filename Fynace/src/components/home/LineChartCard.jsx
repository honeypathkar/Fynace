import React from 'react';
import { View, Dimensions, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
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
  chartConfig,
  rightAction,
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { formatAmount, isPrivacyMode } = usePrivacy();
  const screenWidth = Dimensions.get('window').width - 32; // Account for padding

  const chartWidth = React.useMemo(() => {
    if (!lineChartData?.labels?.length) return screenWidth;
    // Base width on number of labels, min is screenWidth
    return Math.max(screenWidth, lineChartData.labels.length * 60);
  }, [lineChartData, screenWidth]);

  return (
    <LinearGradient
      colors={[theme.colors.surfaceVariant, theme.colors.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.chartCard, { borderColor: theme.colors.outline }]}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {title}
        </Text>
        {rightAction}
      </View>

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
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chartWrapper}>
            <LineChart
              data={lineChartData}
              width={chartWidth}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={[styles.chart, { marginLeft: -16 }]}
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
        </ScrollView>
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
