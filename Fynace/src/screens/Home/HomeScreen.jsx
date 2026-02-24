import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { database } from '../../database';
import { Q } from '@nozbe/watermelondb';
import { syncManager } from '../../sync/SyncManager';

const HomeSkeleton = () => (
  <ScrollView
    contentContainerStyle={homeStyles.scrollContent}
    showsVerticalScrollIndicator={false}
  >
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
  const [syncStatus, setSyncStatus] = useState(syncManager.status);

  useEffect(() => {
    return syncManager.subscribe(status => {
      setSyncStatus(status);
    });
  }, []);

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

  const fetchDashboardData = useCallback(
    async (isSilent = false) => {
      try {
        if (!isSilent) {
          setLoading(true);
        }
        setError(null);

        // Trigger background sync
        syncManager.sync().catch(console.error);

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
        const currentMonthStr = `${currentYear}-${currentMonth}`;

        const prevMonthDate = new Date(currentYear, now.getMonth() - 1, 1);
        const prevYear = prevMonthDate.getFullYear();
        const prevMonth = String(prevMonthDate.getMonth() + 1).padStart(2, '0');
        const prevMonthStr = `${prevYear}-${prevMonth}`;

        // Fetch local data
        const [localExpenses, localMoneyIn] = await Promise.all([
          database.get('expenses').query(Q.where('is_deleted', false)).fetch(),
          database.get('money_in').query(Q.where('is_deleted', false)).fetch(),
        ]);

        console.log(
          `HomeScreen: Fetched ${localExpenses.length} expenses, ${localMoneyIn.length} moneyIn`,
        );

        // Calculate All-Time Summary
        const allTimeIn = localMoneyIn.reduce(
          (sum, entry) => sum + (entry.amount || 0),
          0,
        );
        const allTimeOut = localExpenses.reduce(
          (sum, exp) => sum + (exp.moneyOut || exp.amount || 0),
          0,
        );
        setAllTimeSummary({
          totalMoneyIn: allTimeIn,
          totalMoneyOut: allTimeOut,
        });

        // Calculate Current Month Summary
        const currentIn = localMoneyIn
          .filter(entry => entry.month === currentMonthStr)
          .reduce((sum, entry) => sum + (entry.amount || 0), 0);
        const currentOut = localExpenses
          .filter(exp => exp.month === currentMonthStr)
          .reduce((sum, exp) => sum + (exp.moneyOut || exp.amount || 0), 0);
        setCurrentMonthSummary({
          totalMoneyIn: currentIn,
          totalMoneyOut: currentOut,
        });

        // Calculate Previous Month Summary
        const prevIn = localMoneyIn
          .filter(entry => entry.month === prevMonthStr)
          .reduce((sum, entry) => sum + (entry.amount || 0), 0);
        const prevOut = localExpenses
          .filter(exp => exp.month === prevMonthStr)
          .reduce((sum, exp) => sum + (exp.amount || 0), 0);
        setPreviousMonthSummary({
          totalMoneyIn: prevIn,
          totalMoneyOut: prevOut,
        });

        // For charts, we'll still try to fetch from API if online,
        // but for now let's just use local data for trend if possible
        // (Simplified for this phase: summaries are local, charts might stay skeleton if offline)

        setLoading(false);

        // Fetch heavy data from API in background (optional/as fallback)
        Promise.all([
          apiClient.get('/chart/monthly').catch(() => ({ data: { data: [] } })),
          apiClient.get('/chart/trend').catch(() => ({ data: { data: [] } })),
          apiClient
            .get('/chart/category/all-time')
            .catch(() => ({ data: { data: [] } })),
        ]).then(([monthlyResponse, trendResponse, categoryResponse]) => {
          setMonthlyData(monthlyResponse.data?.data || []);
          setTrendData(trendResponse.data?.data || []);
          setCategoryData(categoryResponse.data?.data || []);
        });
      } catch (err) {
        setError(err.message || 'Failed to load local dashboard data');
        setLoading(false);
      }
    },
    [token],
  );

  useFocusEffect(
    useCallback(() => {
      // If we already have summaries, do a silent background refresh
      // instead of showing a full loader.
      const isSilent = allTimeSummary !== undefined && allTimeSummary !== null;
      fetchDashboardData(isSilent);
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

      {syncStatus === 'syncing' && (
        <View style={styles.syncIndicator}>
          <ActivityIndicator size={12} color="#3A6FF8" />
          <Text style={styles.syncText}>Syncing changes...</Text>
        </View>
      )}

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
  syncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(58, 111, 248, 0.1)',
  },
  syncText: {
    fontSize: 10,
    color: '#3A6FF8',
    fontFamily: Fonts.medium,
  },
});
