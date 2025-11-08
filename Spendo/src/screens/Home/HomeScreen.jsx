import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Divider,
  Text,
  useTheme,
} from 'react-native-paper';
import { LineChart, PieChart, StackedBarChart } from 'react-native-chart-kit';
import GlobalHeader from '../../components/GlobalHeader';
import { useAuth } from '../../hooks/useAuth';
import { apiClient, parseApiError } from '../../api/client';
import { themeAssets } from '../../theme';

const formatMonth = (month) => {
  const [year, monthIndex] = month.split('-');
  const date = new Date(Number(year), Number(monthIndex) - 1);
  return date.toLocaleDateString('default', {
    month: 'short',
    year: 'numeric',
  });
};

const HomeScreen = () => {
  const { user, token } = useAuth();
  const theme = useTheme();
  const { colors } = theme;
  const screenWidth = Dimensions.get('window').width;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState();

  const chartConfig = useMemo(
    () => ({
      backgroundColor: colors.surface,
      backgroundGradientFrom: colors.surface,
      backgroundGradientTo: colors.surface,
      decimalPlaces: 0,
      color: (opacity = 1) => colors.primary,
      labelColor: (opacity = 1) => colors.onSurface,
      propsForBackgroundLines: {
        stroke: colors.surfaceVariant,
      },
      propsForHorizontalLabels: {
        fill: colors.onSurface,
      },
      propsForVerticalLabels: {
        fill: colors.onSurface,
      },
      fillShadowGradient: colors.primary,
      fillShadowGradientOpacity: 0.2,
    }),
    [colors.onSurface, colors.primary, colors.surface, colors.surfaceVariant]
  );

  const fetchCategoryDistribution = useCallback(
    async (month) => {
      if (!token) {
        return;
      }

      try {
        const response = await apiClient.get(`/chart/category/${month}`);
        setCategoryData(response.data?.data || []);
      } catch (err) {
        const apiError = parseApiError(err);
        setError(apiError.message);
      }
    },
    [token]
  );

  const fetchDashboardData = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [monthlyResponse, trendResponse] = await Promise.all([
        apiClient.get('/chart/monthly'),
        apiClient.get('/chart/trend'),
      ]);

      const months = monthlyResponse.data?.data || [];
      setMonthlyData(months);

      const trends = trendResponse.data?.data || [];
      setTrendData(trends);

      const activeMonth =
        selectedMonth || months[months.length - 1]?.month || undefined;
      if (activeMonth) {
        await fetchCategoryDistribution(activeMonth);
        setSelectedMonth(activeMonth);
      } else {
        setCategoryData([]);
      }
    } catch (err) {
      const apiError = parseApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }, [fetchCategoryDistribution, selectedMonth, token]);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
  );

  const handleSelectMonth = async (month) => {
    setSelectedMonth(month);
    await fetchCategoryDistribution(month);
  };

  const pieColors = useMemo(
    () => [
      '#3A6FF8',
      '#F97316',
      '#22C55E',
      '#EF4444',
      '#A855F7',
      '#14B8A6',
      '#EAB308',
      '#6366F1',
    ],
    []
  );

  const stackedBarData = useMemo(() => {
    if (!monthlyData.length) {
      return null;
    }

    return {
      labels: monthlyData.map((item) => formatMonth(item.month)),
      legend: ['Money In', 'Money Out'],
      data: monthlyData.map((item) => [item.totalMoneyIn || 0, item.totalMoneyOut || 0]),
      barColors: [colors.primary, colors.secondary],
    };
  }, [monthlyData, colors.primary, colors.secondary]);

  const stackedBarWidth = useMemo(() => {
    if (!stackedBarData) {
      return screenWidth * 0.9;
    }
    return Math.max(screenWidth, stackedBarData.labels.length * 110);
  }, [screenWidth, stackedBarData]);

  const lineChartData = useMemo(() => {
    if (!trendData.length) {
      return null;
    }

    return {
      labels: trendData.map((item) => formatMonth(item.month)),
      datasets: [
        {
          data: trendData.map((item) => item.totalMoneyIn || 0),
          color: () => colors.primary,
          strokeWidth: 3,
        },
        {
          data: trendData.map((item) => item.totalMoneyOut || 0),
          color: () => colors.secondary,
          strokeWidth: 3,
        },
        {
          data: trendData.map((item) => item.remaining || 0),
          color: () => colors.success,
          strokeWidth: 3,
        },
      ],
      legend: ['In', 'Out', 'Remaining'],
    };
  }, [colors.primary, colors.secondary, colors.success, trendData]);

  const lineChartWidth = useMemo(() => {
    if (!lineChartData) {
      return screenWidth * 0.9;
    }
    return Math.max(screenWidth, lineChartData.labels.length * 120);
  }, [lineChartData, screenWidth]);

  const pieChartData = useMemo(() => {
    if (!categoryData.length) {
      return [];
    }

    return categoryData.map((item, index) => ({
      name: item.category,
      population: Number(item.percentage?.toFixed(2) || 0),
      color: pieColors[index % pieColors.length],
      legendFontColor: colors.onSurface,
      legendFontSize: 12,
    }));
  }, [categoryData, pieColors, colors.onSurface]);

  if (!token) {
    return (
      <View style={styles.container}>
        <GlobalHeader
          title="Spendo"
          subtitle="Sign in to see your financial overview"
        />
        <View style={styles.centered}>
          <Text variant="titleMedium" style={styles.centeredTitle}>
            You're almost there!
          </Text>
          <Text variant="bodyMedium" style={styles.centeredSubtitle}>
            Head over to the profile tab to log in and unlock your personalized
            insights.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GlobalHeader
        title={`Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`}
        subtitle="Here's a quick snapshot of your spending"
      />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {error ? (
            <Card style={styles.errorCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.errorTitle}>
                  We ran into an issue
                </Text>
                <Text variant="bodyMedium" style={styles.errorText}>
                  {error}
                </Text>
                <Button
                  mode="contained"
                  onPress={fetchDashboardData}
                  style={styles.retryButton}>
                  Try again
                </Button>
              </Card.Content>
            </Card>
          ) : null}

          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text variant="titleMedium">Monthly Overview</Text>
                <Chip icon="calendar" selected={false}>
                  {selectedMonth ? formatMonth(selectedMonth) : 'Select month'}
                </Chip>
              </View>
              {stackedBarData ? (
                <>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <StackedBarChart
                      data={stackedBarData}
                      width={stackedBarWidth}
                      height={260}
                      chartConfig={chartConfig}
                      style={styles.chart}
                      withHorizontalLabels
                      withVerticalLabels
                      decimalPlaces={0}
                    />
                  </ScrollView>
                  <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                      <View
                        style={[styles.legendDot, { backgroundColor: colors.primary }]}
                      />
                      <Text variant="bodyMedium">Money In</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View
                        style={[styles.legendDot, { backgroundColor: colors.secondary }]}
                      />
                      <Text variant="bodyMedium">Money Out</Text>
                    </View>
                  </View>
                </>
              ) : (
                <Text variant="bodyMedium" style={styles.placeholderText}>
                  No monthly data recorded yet.
                </Text>
              )}
              <View style={styles.monthChips}>
                {monthlyData.map((item) => (
                  <Chip
                    key={item.month}
                    mode="outlined"
                    selected={selectedMonth === item.month}
                    onPress={() => handleSelectMonth(item.month)}
                    style={styles.monthChip}>
                    {formatMonth(item.month)}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Spending By Category
              </Text>
              {pieChartData.length ? (
                <PieChart
                  data={pieChartData}
                  width={screenWidth - themeAssets.spacing[5] * 2}
                  height={240}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="16"
                  hasLegend={false}
                  center={[10, 0]}
                />
              ) : (
                <Text variant="bodyMedium" style={styles.placeholderText}>
                  No category data for the selected month yet.
                </Text>
              )}
              <Divider style={styles.divider} />
              <View>
                {categoryData.map((item) => (
                  <View key={item.category} style={styles.categoryRow}>
                    <Text variant="bodyLarge" style={styles.categoryName}>
                      {item.category}
                    </Text>
                    <View style={styles.categoryMeta}>
                      <Text variant="labelLarge" style={styles.categoryAmount}>
                        ₹{item.totalMoneyOut.toLocaleString()}
                      </Text>
                      <Text variant="bodyMedium" style={styles.categoryPercentage}>
                        {item.percentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Cashflow Trend
              </Text>
              {lineChartData ? (
                <>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <LineChart
                      data={lineChartData}
                      width={lineChartWidth}
                      height={260}
                      chartConfig={chartConfig}
                      bezier
                      style={styles.chart}
                      withShadow={false}
                      fromZero
                    />
                  </ScrollView>
                  <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                      <View
                        style={[styles.legendDot, { backgroundColor: colors.primary }]}
                      />
                      <Text variant="bodyMedium">Money In</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View
                        style={[styles.legendDot, { backgroundColor: colors.secondary }]}
                      />
                      <Text variant="bodyMedium">Money Out</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View
                        style={[styles.legendDot, { backgroundColor: colors.success }]}
                      />
                      <Text variant="bodyMedium">Remaining</Text>
                    </View>
                  </View>
                </>
              ) : (
                <Text variant="bodyMedium" style={styles.placeholderText}>
                  Add some expenses to start tracking your cashflow trends.
                </Text>
              )}
            </Card.Content>
          </Card>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeAssets.palette.background,
  },
  scrollContent: {
    paddingHorizontal: themeAssets.spacing[5],
    paddingBottom: themeAssets.spacing[6],
    gap: themeAssets.spacing[4],
  },
  card: {
    borderRadius: 20,
    backgroundColor: themeAssets.palette.surface,
  },
  chart: {
    borderRadius: 20,
    marginVertical: themeAssets.spacing[2],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: themeAssets.spacing[3],
  },
  sectionTitle: {
    marginBottom: themeAssets.spacing[3],
  },
  monthChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: themeAssets.spacing[2],
    marginTop: themeAssets.spacing[3],
  },
  monthChip: {
    marginRight: themeAssets.spacing[2],
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: themeAssets.spacing[2],
  },
  categoryName: {
    flex: 1,
  },
  categoryMeta: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    color: themeAssets.palette.text,
  },
  categoryPercentage: {
    color: themeAssets.palette.subtext,
  },
  divider: {
    marginVertical: themeAssets.spacing[3],
  },
  placeholderText: {
    textAlign: 'center',
    color: themeAssets.palette.subtext,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorCard: {
    marginBottom: themeAssets.spacing[4],
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
  },
  errorTitle: {
    marginBottom: themeAssets.spacing[2],
  },
  errorText: {
    marginBottom: themeAssets.spacing[3],
  },
  retryButton: {
    alignSelf: 'flex-start',
  },
  centered: {
    flex: 1,
    paddingHorizontal: themeAssets.spacing[6],
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredTitle: {
    marginBottom: themeAssets.spacing[2],
  },
  centeredSubtitle: {
    textAlign: 'center',
    color: themeAssets.palette.subtext,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: themeAssets.spacing[2],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: themeAssets.spacing[3],
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: themeAssets.spacing[1],
  },
});

export default HomeScreen;

