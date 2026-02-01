import React, { useCallback, useMemo, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  View,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import GlobalHeader from '../../components/GlobalHeader';
import { useAuth } from '../../hooks/useAuth';
import { apiClient, parseApiError } from '../../api/client';
import { themeAssets } from '../../theme';
import { useBottomBar } from '../../context/BottomBarContext';
import LinearGradient from 'react-native-linear-gradient';
import Fonts from '../../../assets/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StatCard,
  LineChartCard,
  PieChartCard,
  HomeHeader,
  homeStyles,
} from '../../components/home';
import { SkeletonPulse } from '../../components/expenses';
import { QrCode, Plus } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

const HomeSkeleton = () => (
  <ScrollView
    contentContainerStyle={homeStyles.scrollContent}
    showsVerticalScrollIndicator={false}
  >
    <View style={homeStyles.header}>
      <View style={{ flex: 1 }}>
        <SkeletonPulse style={{ width: 120, height: 28, marginBottom: 8 }} />
        <SkeletonPulse style={{ width: 200, height: 16 }} />
      </View>
      <SkeletonPulse style={{ width: 40, height: 40, borderRadius: 20 }} />
    </View>

    <View style={homeStyles.statsRow}>
      <SkeletonPulse style={[homeStyles.statCard, { height: 100 }]} />
      <SkeletonPulse style={[homeStyles.statCard, { height: 100 }]} />
    </View>

    <View
      style={[
        homeStyles.chartCard,
        { padding: 16, backgroundColor: '#1E293B', borderRadius: 16 },
      ]}
    >
      <SkeletonPulse style={{ width: 150, height: 20, marginBottom: 20 }} />
      <SkeletonPulse style={{ width: '100%', height: 220, borderRadius: 16 }} />
    </View>

    <View
      style={[
        homeStyles.chartCard,
        { padding: 16, backgroundColor: '#1E293B', borderRadius: 16 },
      ]}
    >
      <SkeletonPulse style={{ width: 150, height: 20, marginBottom: 20 }} />
      <View style={{ alignItems: 'center', marginVertical: 20 }}>
        <SkeletonPulse style={{ width: 180, height: 180, borderRadius: 90 }} />
      </View>
      <View style={{ gap: 12 }}>
        <SkeletonPulse style={{ width: '100%', height: 40 }} />
        <SkeletonPulse style={{ width: '100%', height: 40 }} />
        <SkeletonPulse style={{ width: '100%', height: 40 }} />
      </View>
    </View>
  </ScrollView>
);

const formatMonth = month => {
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
  const navigation = useNavigation();
  const { hideBottomBar, showBottomBar } = useBottomBar();
  const screenWidth = Dimensions.get('window').width;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState();
  const [allTimeSummary, setAllTimeSummary] = useState();
  const [currentMonthSummary, setCurrentMonthSummary] = useState(null);
  const [previousMonthSummary, setPreviousMonthSummary] = useState(null);

  const chartConfig = useMemo(() => {
    return {
      backgroundColor: '#1E293B',
      backgroundGradientFrom: '#1E293B',
      backgroundGradientTo: '#1E293B',
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(58, 111, 248, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
      strokeWidth: 3,
      barPercentage: 0.7,
      useShadowColorFromDataset: false,
      fillShadowGradient: '#3A6FF8',
      fillShadowGradientOpacity: 0.3,
      style: {
        borderRadius: 16,
      },
      propsForDots: {
        r: '5',
        strokeWidth: '3',
        stroke: '#3A6FF8',
      },
      propsForBackgroundLines: {
        strokeDasharray: '',
        stroke: '#334155',
        strokeWidth: 1,
      },
      propsForVerticalLabels: {
        fontSize: 11,
        fontFamily: Fonts.medium,
      },
      propsForHorizontalLabels: {
        fontSize: 11,
        fontFamily: Fonts.medium,
      },
      propsForLabels: {
        fontSize: 12,
        fontFamily: Fonts.medium,
      },
    };
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get current month for comparison
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
      const currentMonthStr = `${currentYear}-${currentMonth}`;

      // Calculate previous month
      const prevMonthDate = new Date(currentYear, now.getMonth() - 1, 1);
      const prevYear = prevMonthDate.getFullYear();
      const prevMonth = String(prevMonthDate.getMonth() + 1).padStart(2, '0');
      const prevMonthStr = `${prevYear}-${prevMonth}`;

      // PHASE 1: Critical Stats (Summaries)
      const [
        allTimeSummaryResponse,
        currentMonthSummaryResponse,
        previousMonthSummaryResponse,
      ] = await Promise.all([
        apiClient
          .get('/expenses/summary/all-time')
          .catch(() => ({ data: { summary: null } })),
        apiClient
          .get(`/expenses/summary/${currentMonthStr}`)
          .catch(() => ({ data: { summary: null } })),
        apiClient
          .get(`/expenses/summary/${prevMonthStr}`)
          .catch(() => ({ data: { summary: null } })),
      ]);

      setAllTimeSummary(allTimeSummaryResponse?.data?.summary || null);
      setCurrentMonthSummary(
        currentMonthSummaryResponse?.data?.summary || null,
      );
      setPreviousMonthSummary(
        previousMonthSummaryResponse?.data?.summary || null,
      );

      // Stop primary loading after summaries are in
      setLoading(false);

      // PHASE 2: Heavy Data (Charts) - Load in background
      Promise.all([
        apiClient.get('/chart/monthly').catch(() => ({ data: { data: [] } })),
        apiClient.get('/chart/trend').catch(() => ({ data: { data: [] } })),
        apiClient
          .get('/chart/category/all-time')
          .catch(() => ({ data: { data: [] } })),
      ])
        .then(([monthlyResponse, trendResponse, categoryResponse]) => {
          setMonthlyData(monthlyResponse.data?.data || []);
          setTrendData(trendResponse.data?.data || []);
          setCategoryData(categoryResponse.data?.data || []);
        })
        .catch(err => {
          console.error('Error loading chart data:', err);
        });
    } catch (err) {
      const apiError = parseApiError(err);
      setError(apiError.message);
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData]),
  );

  const pieColors = useMemo(
    () => [
      '#3A6FF8', // Blue
      '#F97316', // Orange
      '#22C55E', // Green
      '#EF4444', // Red
      '#A855F7', // Purple
      '#14B8A6', // Teal
    ],
    [],
  );

  const lineChartData = useMemo(() => {
    if (!trendData || !Array.isArray(trendData) || trendData.length === 0) {
      return null;
    }

    // Take last 6 months for better visibility
    const recentTrends = trendData.slice(-6);

    const labels = recentTrends
      .map(item => {
        if (!item || !item.month) return '';
        const monthLabel = formatMonth(item.month);
        return monthLabel.split(' ')[0]; // Just Month name
      })
      .filter(Boolean);

    const expenseData = recentTrends.map(item => item?.totalMoneyOut || 0);
    const incomeData = recentTrends.map(item => item?.totalMoneyIn || 0);

    // Check if we have valid data
    if (
      labels.length === 0 ||
      (expenseData.every(v => v === 0) && incomeData.every(v => v === 0))
    ) {
      return null;
    }

    return {
      labels,
      datasets: [
        {
          data: expenseData,
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Red for expenses
          strokeWidth: 3,
          withDots: true,
          withShadow: true,
        },
        {
          data: incomeData,
          color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`, // Green for income
          strokeWidth: 3,
          withDots: true,
          withShadow: true,
        },
      ],
      legend: ['Expense', 'Income'],
    };
  }, [trendData]);

  const pieChartData = useMemo(() => {
    // Always return an array, never undefined
    if (
      !categoryData ||
      !Array.isArray(categoryData) ||
      categoryData.length === 0
    ) {
      return [];
    }

    try {
      const result = [];
      categoryData.forEach((item, index) => {
        if (!item || typeof item !== 'object') return;
        if (!item.category) return;

        const amount = Number(item.totalMoneyOut || item.totalAmount || 0);
        if (amount <= 0) return;

        result.push({
          name: String(item.category),
          population: amount,
          color: pieColors[index % pieColors.length] || '#3A6FF8',
          legendFontColor: '#94A3B8',
          legendFontSize: 12,
          legendFontFamily: Fonts.medium,
        });
      });

      return result;
    } catch (error) {
      console.error('Error generating pie chart data:', error);
      return [];
    }
  }, [categoryData, pieColors]);

  // Use all-time summary instead of current month data
  const allTimeData = useMemo(() => {
    return {
      moneyIn: allTimeSummary?.totalMoneyIn || 0,
      moneyOut: allTimeSummary?.totalMoneyOut || 0,
    };
  }, [allTimeSummary]);

  // Calculate real percentages based on month-over-month comparison
  const trendPercentages = useMemo(() => {
    if (!currentMonthSummary || !previousMonthSummary) {
      return { moneyInPercent: null, moneyOutPercent: null };
    }

    const currentMoneyIn = currentMonthSummary?.totalMoneyIn || 0;
    const currentMoneyOut = currentMonthSummary?.totalMoneyOut || 0;
    const prevMoneyIn = previousMonthSummary?.totalMoneyIn || 0;
    const prevMoneyOut = previousMonthSummary?.totalMoneyOut || 0;

    let moneyInPercent = null;
    let moneyOutPercent = null;

    if (prevMoneyIn > 0) {
      moneyInPercent = ((currentMoneyIn - prevMoneyIn) / prevMoneyIn) * 100;
    } else if (currentMoneyIn > 0) {
      moneyInPercent = 100; // 100% increase from 0
    }

    if (prevMoneyOut > 0) {
      moneyOutPercent = ((currentMoneyOut - prevMoneyOut) / prevMoneyOut) * 100;
    } else if (currentMoneyOut > 0) {
      moneyOutPercent = 100; // 100% increase from 0
    }

    return {
      moneyInPercent:
        moneyInPercent !== null ? parseFloat(moneyInPercent.toFixed(1)) : null,
      moneyOutPercent:
        moneyOutPercent !== null
          ? parseFloat(moneyOutPercent.toFixed(1))
          : null,
    };
  }, [currentMonthSummary, previousMonthSummary]);

  if (!token) {
    return (
      <View style={homeStyles.container}>
        <GlobalHeader
          title="Spendo"
          subtitle="Sign in to see your financial overview"
        />
        <View style={homeStyles.centered}>
          <Text variant="titleMedium" style={homeStyles.centeredTitle}>
            You're almost there!
          </Text>
          <Text variant="bodyMedium" style={homeStyles.centeredSubtitle}>
            Head over to the profile tab to log in and unlock your personalized
            insights.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={homeStyles.container}>
      <StatusBar backgroundColor="#0F172A" barStyle="light-content" />
      <HomeHeader
        userName={user?.fullName}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      {loading && !monthlyData.length ? (
        <HomeSkeleton />
      ) : (
        <ScrollView
          contentContainerStyle={homeStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
        >
          <View style={homeStyles.statsRow}>
            <StatCard
              label="Total Money In"
              value={allTimeData.moneyIn || 0}
              trend={trendPercentages.moneyInPercent !== null}
              trendValue={
                trendPercentages.moneyInPercent !== null
                  ? `${trendPercentages.moneyInPercent >= 0 ? '+' : ''}${
                      trendPercentages.moneyInPercent
                    }%`
                  : ''
              }
              type="in"
              onPress={() => navigation.navigate('MoneyIn')}
            />
            <StatCard
              label="Total Money Out"
              value={allTimeData.moneyOut || 0}
              trend={trendPercentages.moneyOutPercent !== null}
              trendValue={
                trendPercentages.moneyOutPercent !== null
                  ? `${trendPercentages.moneyOutPercent >= 0 ? '+' : ''}${
                      trendPercentages.moneyOutPercent
                    }%`
                  : ''
              }
              type="out"
            />
          </View>

          <LineChartCard
            title="Monthly Snapshot"
            netBalance={
              (allTimeData.moneyIn || 0) - (allTimeData.moneyOut || 0)
            }
            netBalanceLabel="Net Balance"
            lineChartData={lineChartData}
            screenWidth={screenWidth}
            chartConfig={chartConfig}
          />

          <PieChartCard
            title="Spending Categories"
            pieChartData={pieChartData}
            categoryData={categoryData}
            pieColors={pieColors}
            screenWidth={screenWidth}
            chartConfig={chartConfig}
          />
        </ScrollView>
      )}

      {/* QR Scanner FAB */}
      <TouchableOpacity
        style={styles.qrFab}
        onPress={() => navigation.navigate('QRScanner')}
        activeOpacity={0.8}
      >
        <QrCode size={28} color="#F8FAFC" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  qrFab: {
    position: 'absolute',
    right: 24,
    bottom: 100, // Adjusted for bottom bar
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3A6FF8',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#3A6FF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
