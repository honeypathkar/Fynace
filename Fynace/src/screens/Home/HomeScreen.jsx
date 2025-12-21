import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions, ScrollView, StatusBar, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  ActivityIndicator,
  Text,
  useTheme,
} from 'react-native-paper';
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

  const chartConfig = useMemo(
    () => {
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
    },
    []
  );

  const fetchCategoryDistribution = useCallback(
    async () => {
      if (!token) {
        return;
      }

      try {
        // Fetch all-time category distribution
        const response = await apiClient.get('/chart/category/all-time');
        const data = response.data?.data;
        // Ensure data is always an array
        setCategoryData(Array.isArray(data) ? data : []);
      } catch (err) {
        const apiError = parseApiError(err);
        setError(apiError.message);
        setCategoryData([]); // Set empty array on error
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

      const [monthlyResponse, trendResponse, allTimeSummaryResponse] = await Promise.all([
        apiClient.get('/chart/monthly'),
        apiClient.get('/chart/trend'),
        apiClient.get('/expenses/summary/all-time').catch(() => ({ data: { summary: null } })),
      ]);

      const months = monthlyResponse.data?.data || [];
      setMonthlyData(Array.isArray(months) ? months : []);

      const trends = trendResponse.data?.data || [];
      setTrendData(Array.isArray(trends) ? trends : []);

      // Set all-time summary, fallback to null if not available
      const summaryData = allTimeSummaryResponse?.data?.summary;
      setAllTimeSummary(summaryData || null);

      // Fetch all-time category distribution
      await fetchCategoryDistribution();
    } catch (err) {
      const apiError = parseApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }, [fetchCategoryDistribution, token]);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
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
    []
  );

  const lineChartData = useMemo(() => {
    if (!trendData || !Array.isArray(trendData) || trendData.length === 0) {
      return null;
    }

    // Take last 6 months for better visibility
    const recentTrends = trendData.slice(-6);

    const labels = recentTrends.map((item) => {
      if (!item || !item.month) return '';
      const monthLabel = formatMonth(item.month);
      return monthLabel.split(' ')[0]; // Just Month name
    }).filter(Boolean);

    const expenseData = recentTrends.map((item) => item?.totalMoneyOut || 0);
    const incomeData = recentTrends.map((item) => item?.totalMoneyIn || 0);

    // Check if we have valid data
    if (labels.length === 0 || (expenseData.every(v => v === 0) && incomeData.every(v => v === 0))) {
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
    if (!categoryData || !Array.isArray(categoryData) || categoryData.length === 0) {
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
        userName={user?.name}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      {loading && !monthlyData.length ? (
        <View style={homeStyles.loadingContainer}>
          <ActivityIndicator animating size="large" color="#3A6FF8" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={homeStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => hideBottomBar()}
          onScrollEndDrag={(e) => {
            const { contentOffset } = e.nativeEvent;
            if (contentOffset.y <= 0) {
              showBottomBar();
            }
          }}
          onMomentumScrollEnd={(e) => {
            const { contentOffset } = e.nativeEvent;
            if (contentOffset.y <= 0) {
              showBottomBar();
            }
          }}
          scrollEventThrottle={16}
        >
          <View style={homeStyles.statsRow}>
            <StatCard
              label="Total Money In"
              value={allTimeData.moneyIn || 0}
              trend={true}
              trendValue="+12%"
              type="in"
              onPress={() => navigation.navigate('MoneyIn')}
            />
            <StatCard
              label="Total Money Out"
              value={allTimeData.moneyOut || 0}
              trend={true}
              trendValue="-5%"
              type="out"
            />
          </View>

          <LineChartCard
            title="Monthly Snapshot"
            netBalance={(allTimeData.moneyIn || 0) - (allTimeData.moneyOut || 0)}
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
    </SafeAreaView>
  );
};

export default HomeScreen;

