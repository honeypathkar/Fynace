import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  View,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ActivityIndicator, Text, useTheme, Divider } from 'react-native-paper';
import { InteractionManager } from 'react-native';
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
  BarChartCard,
  HomeHeader,
} from '../../components/home';
import { getStyles as homeGetStyles } from '../../components/home/styles';
import { SkeletonPulse, ExpenseCard } from '../../components/expenses';
import {
  QrCode,
  Plus,
  Filter,
  Calendar,
  TrendingUp,
} from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { database } from '../../database';
import { Q } from '@nozbe/watermelondb';
import { syncManager } from '../../sync/SyncManager';
import BottomSheet from '../../components/BottomSheet';
import { usePrivacy } from '../../context/PrivacyContext';
import { updateAppWidget } from '../../utils/widgetHelper';
import { triggerHaptic } from '../../utils/hapticFeedback';

const HomeSkeleton = () => {
  const theme = useTheme();
  const styles = useMemo(() => homeGetStyles(theme), [theme]);
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.statsRow}>
        <SkeletonPulse style={[styles.statCard, { height: 100 }]} />
        <SkeletonPulse style={[styles.statCard, { height: 100 }]} />
      </View>

      <View
        style={[
          styles.chartCard,
          { padding: 16, backgroundColor: theme.colors.surfaceVariant, borderRadius: 16 },
        ]}
      >
        <SkeletonPulse style={{ width: 150, height: 20, marginBottom: 20 }} />
        <SkeletonPulse style={{ width: '100%', height: 220, borderRadius: 16 }} />
      </View>

      <View
        style={[
          styles.chartCard,
          { padding: 16, backgroundColor: theme.colors.surfaceVariant, borderRadius: 16 },
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
};

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
  const homeStyles = useMemo(() => homeGetStyles(theme), [theme]);
  const { formatAmount } = usePrivacy();
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawExpenses, setRawExpenses] = useState([]);
  const [rawMoneyIn, setRawMoneyIn] = useState([]);
  const [syncStatus, setSyncStatus] = useState(syncManager.status);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [filterType, setFilterType] = useState('all_time');
  const [filterValue, setFilterValue] = useState(null);
  const [activeChartType, setActiveChartType] = useState('expense');
  const [activeChartPeriod, setActiveChartPeriod] = useState(null);
  const bottomSheetRef = React.useRef(null);
  const categorySheetRef = React.useRef(null);

  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [categoryTxns, setCategoryTxns] = useState([]);

  // --- Helpers for ExpenseCard ---
  const formatItemTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatItemDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const transformMonthLabel = (monthKey) => {
    if (!monthKey) return '';
    const [year, month] = monthKey.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  useEffect(() => {
    const unsubscribe = syncManager.subscribe(status => {
      setSyncStatus(status);
      // Auto-refresh data when sync finishes
      if (status === 'idle') {
        fetchDashboardData(true);
      }
    });
    return unsubscribe;
  }, [fetchDashboardData]);

  const chartConfig = useMemo(() => {
    return {
      backgroundColor: theme.colors.surface,
      backgroundGradientFrom: theme.colors.surface,
      backgroundGradientTo: theme.colors.surface,
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(211, 211, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(128, 128, 128, ${opacity})`,
      strokeWidth: 3,
      barPercentage: 0.7,
      useShadowColorFromDataset: false,
      fillShadowGradient: theme.colors.secondary,
      fillShadowGradientOpacity: 0.8,
      style: { borderRadius: 16 },
      propsForDots: { r: '4', strokeWidth: '2', stroke: theme.colors.secondary },
      propsForBackgroundLines: {
        strokeDasharray: '5,5',
        stroke: theme.colors.outline,
        strokeWidth: 1,
      },
      propsForVerticalLabels: { fontSize: 10, fontFamily: Fonts.medium, color: theme.colors.subtext },
      propsForHorizontalLabels: { fontSize: 10, fontFamily: Fonts.medium, color: theme.colors.subtext },
      propsForLabels: { fontSize: 11, fontFamily: Fonts.medium, color: theme.colors.subtext },
    };
  }, [theme]);

  const fetchDashboardData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setError(null);

      // Fetch local data (everything un-deleted)
      const [localExpenses, localMoneyIn] = await Promise.all([
        database
          .get('transactions')
          .query(Q.where('type', 'expense'), Q.where('is_deleted', false))
          .fetch(),
        database
          .get('transactions')
          .query(Q.where('type', 'income'), Q.where('is_deleted', false))
          .fetch(),
      ]);

      setRawExpenses(localExpenses);
      setRawMoneyIn(localMoneyIn);
      setLoading(false);

      // Background sync (debounced via syncManager)
      syncManager.sync().catch(console.error);
    } catch (err) {
      setError(err.message || 'Failed to load local dashboard data');
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData(rawExpenses.length > 0);
    }, [fetchDashboardData, rawExpenses.length]),
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await syncManager.sync(true);
      await fetchDashboardData(true);
    } catch (err) {
      console.warn('Manual refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchDashboardData]);

  // --- Filtering Logic ---
  const filteredData = useMemo(() => {
    const now = new Date();
    let expenses = [...rawExpenses];
    let moneyIn = [...rawMoneyIn];

    if (filterType === 'yearly' && filterValue) {
      const year = parseInt(filterValue);
      expenses = expenses.filter(e => new Date(e.date).getFullYear() === year);
      moneyIn = moneyIn.filter(m => new Date(m.date).getFullYear() === year);
    } else if (filterType === 'monthly' && filterValue) {
      expenses = expenses.filter(e => e.month === filterValue);
      moneyIn = moneyIn.filter(m => m.month === filterValue);
    } else if (filterType === 'weekly') {
      const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).getTime();
      expenses = expenses.filter(e => e.date >= weekAgo);
      moneyIn = moneyIn.filter(m => m.date >= weekAgo);
    } else if (filterType === 'current_week') {
      const today = new Date(now);
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday
      const monday = new Date(today.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      expenses = expenses.filter(e => e.date >= monday.getTime());
      moneyIn = moneyIn.filter(m => m.date >= monday.getTime());
    } else if (filterType === 'last_week') {
      const lastMon = new Date(now);
      const day = lastMon.getDay();
      const diff = lastMon.getDate() - day - 6; // Last Monday
      lastMon.setDate(diff);
      lastMon.setHours(0, 0, 0, 0);
      const lastSun = new Date(lastMon);
      lastSun.setDate(lastSun.getDate() + 6);
      lastSun.setHours(23, 59, 59, 999);
      expenses = expenses.filter(e => e.date >= lastMon.getTime() && e.date <= lastSun.getTime());
      moneyIn = moneyIn.filter(m => m.date >= lastMon.getTime() && m.date <= lastSun.getTime());
    }

    // Sort by date for proper chart order
    expenses.sort((a, b) => a.date - b.date);
    moneyIn.sort((a, b) => a.date - b.date);

    return { expenses, moneyIn };
  }, [rawExpenses, rawMoneyIn, filterType, filterValue]);

  const summary = useMemo(() => {
    const totalIn = filteredData.moneyIn.reduce(
      (sum, e) => sum + (e.amountRupees || 0),
      0,
    );
    const totalOut = filteredData.expenses.reduce(
      (sum, e) => sum + (e.amountRupees || 0),
      0,
    );
    return { totalIn, totalOut, balance: totalIn - totalOut };
  }, [filteredData]);

  const comparisonPercent = useMemo(() => {
    let prevExpenses = [];
    let prevMoneyIn = [];
    const now = new Date();

    if (filterType === 'weekly') {
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 14,
      ).getTime();
      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 7,
      ).getTime();
      prevExpenses = rawExpenses.filter(e => e.date >= start && e.date < end);
      prevMoneyIn = rawMoneyIn.filter(m => m.date >= start && m.date < end);
    } else if (filterType === 'monthly' && filterValue) {
      const [year, month] = filterValue.split('-').map(Number);
      const prevMonthDate = new Date(year, month - 2, 1);
      const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(
        prevMonthDate.getMonth() + 1,
      ).padStart(2, '0')}`;
      prevExpenses = rawExpenses.filter(e => e.month === prevMonthStr);
      prevMoneyIn = rawMoneyIn.filter(m => m.month === prevMonthStr);
    } else if (filterType === 'yearly' && filterValue) {
      const prevYear = (parseInt(filterValue) - 1).toString();
      prevExpenses = rawExpenses.filter(
        e => new Date(e.date).getFullYear().toString() === prevYear,
      );
      prevMoneyIn = rawMoneyIn.filter(
        m => new Date(m.date).getFullYear().toString() === prevYear,
      );
    } else {
      return { moneyInPercent: null, moneyOutPercent: null };
    }

    const prevIn = prevMoneyIn.reduce(
      (sum, e) => sum + (e.amountRupees || 0),
      0,
    );
    const prevOut = prevExpenses.reduce(
      (sum, e) => sum + (e.amountRupees || 0),
      0,
    );
    const currIn = summary.totalIn;
    const currOut = summary.totalOut;

    const calcTrend = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : null;
      return parseFloat((((curr - prev) / prev) * 100).toFixed(1));
    };

    return {
      moneyInPercent: calcTrend(currIn, prevIn),
      moneyOutPercent: calcTrend(currOut, prevOut),
    };
  }, [filterType, filterValue, rawExpenses, rawMoneyIn, summary]);

  const chartTitle = useMemo(() => {
    if (filterType === 'all_time') return 'All Time Snapshot';
    if (filterType === 'weekly') return 'Weekly Snapshot';
    if (filterType === 'yearly') return `Snapshot: ${filterValue}`;
    if (filterType === 'monthly')
      return `Snapshot: ${formatMonth(filterValue)}`;
    return 'Snapshot';
  }, [filterType, filterValue]);

  const categoryStats = useMemo(() => {
    const isDaily = filterType === 'monthly' || filterType.includes('week');
    const sourceData = activeChartType === 'expense' ? filteredData.expenses : filteredData.moneyIn;

    // Filter source data by the active period selected in the chart
    let periodData = sourceData;
    if (activeChartPeriod) {
      periodData = sourceData.filter(item => {
        const itemKey = isDaily
          ? new Date(item.date).getFullYear() + '-' + String(new Date(item.date).getMonth() + 1).padStart(2, '0') + '-' + String(new Date(item.date).getDate()).padStart(2, '0')
          : item.month;
        return itemKey === activeChartPeriod;
      });
    }

    const cats = {};
    periodData.forEach(e => {
      const name = e.category || 'Other';
      cats[name] = (cats[name] || 0) + (e.amountRupees || 0);
    });

    return Object.entries(cats)
      .map(([category, totalMoneyOut]) => ({ category, totalMoneyOut }))
      .sort((a, b) => b.totalMoneyOut - a.totalMoneyOut);
  }, [filteredData, activeChartType, activeChartPeriod, filterType]);

  const handleEditTransaction = useCallback((txn) => {
    categorySheetRef.current?.close();
    InteractionManager.runAfterInteractions(() => {
      navigation.navigate('AddExpense', { expense: txn });
    });
  }, [navigation]);

  const handleDeleteTransaction = useCallback(async (txn) => {
    try {
      await database.write(async () => {
        const record = await database.get('transactions').find(txn.id);
        await record.markAsDeleted();
      });
      // Refresh local data
      await fetchDashboardData(true);
      // If we are in the category sheet, we need to update the local categoryTxns state too
      setCategoryTxns(prev => prev.filter(t => t.id !== txn.id));
      
      syncManager.sync().catch(console.error);
    } catch (err) {
      console.warn('Failed to delete transaction:', err);
    }
  }, [fetchDashboardData]);

  const handleCategoryPress = useCallback((categoryName) => {
    const isDaily = filterType === 'monthly' || filterType.includes('week');
    const sourceData = activeChartType === 'expense' ? filteredData.expenses : filteredData.moneyIn;
    
    const txns = sourceData.filter(item => {
      const matchCat = (item.category || 'Other') === categoryName;
      if (!matchCat) return false;
      
      if (activeChartPeriod) {
        const itemKey = isDaily 
          ? new Date(item.date).getFullYear() + '-' + String(new Date(item.date).getMonth() + 1).padStart(2, '0') + '-' + String(new Date(item.date).getDate()).padStart(2, '0')
          : item.month;
        return itemKey === activeChartPeriod;
      }
      return true;
    });

    setCategoryTxns(txns.sort((a, b) => b.date - a.date));
    setSelectedCategoryName(categoryName);
    categorySheetRef.current?.open();
  }, [filteredData, activeChartType, activeChartPeriod, filterType]);

  // --- Helper to get distinct years/months for filter ---
  const filterOptions = useMemo(() => {
    const years = new Set();
    const months = new Set();
    rawExpenses.forEach(e => {
      const d = new Date(e.date);
      years.add(d.getFullYear());
      months.add(e.month);
    });
    rawMoneyIn.forEach(m => {
      const d = new Date(m.date);
      years.add(d.getFullYear());
      months.add(m.month);
    });
    return {
      years: Array.from(years).sort((a, b) => b - a),
      months: Array.from(months).sort((a, b) => b.localeCompare(a)),
    };
  }, [rawExpenses, rawMoneyIn]);

  // Update Home Screen Widget whenever data changes
  useEffect(() => {
    if (user && rawExpenses.length > 0) {
      // Calculate Current Month Spending for the Widget (Independent of HomeScreen filters)
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      const currentMonthExpenses = rawExpenses.filter(e => e.month === currentMonthKey);
      const currentMonthIncome = rawMoneyIn.filter(m => m.month === currentMonthKey);
      
      const monthTotalOut = currentMonthExpenses.reduce((sum, e) => sum + (e.amountRupees || 0), 0);
      const monthTotalIn = currentMonthIncome.reduce((sum, e) => sum + (e.amountRupees || 0), 0);

      // Group expenses by day for the last 7 days for the Chart
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7Days.push(d.toISOString().split('T')[0]);
      }

      const dailyTotals = last7Days.map(date => {
        return rawExpenses
          .filter(e => new Date(e.date).toISOString().split('T')[0] === date)
          .reduce((sum, e) => sum + (e.amountRupees || 0), 0);
      });

      // Top 3 Categories for the Widget
      const categoryTotals = currentMonthExpenses.reduce((acc, e) => {
        const cat = e.category || 'Other';
        acc[cat] = (acc[cat] || 0) + (e.amountRupees || 0);
        return acc;
      }, {});

      const sortedCategories = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

      const top3 = {
        cat1: sortedCategories[0]?.[0] || '',
        cat2: sortedCategories[1]?.[0] || '',
        cat3: sortedCategories[2]?.[0] || '',
        weight1: monthTotalOut > 0 ? (sortedCategories[0]?.[1] || 0) / monthTotalOut : 0,
        weight2: monthTotalOut > 0 ? (sortedCategories[1]?.[1] || 0) / monthTotalOut : 0,
        weight3: monthTotalOut > 0 ? (sortedCategories[2]?.[1] || 0) / monthTotalOut : 0,
      };

      updateAppWidget({
        amount: formatAmount(monthTotalOut, user?.currency),
        range: formatMonth(currentMonthKey),
        ...top3
      });
    }
  }, [rawExpenses, rawMoneyIn, user, formatAmount, currentMonthKey]);

  const FilterChip = ({ label, active, onPress }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline },
        active && { backgroundColor: theme.colors.secondary, borderColor: theme.colors.secondary }
      ]}
      onPress={() => {
        triggerHaptic('impactMedium');
        onPress();
      }}
    >
      <Text
        style={[
          styles.filterChipText,
          { color: theme.colors.subtext },
          active && { color: theme.colors.onSecondary }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (!token) {
    return (
      <View style={homeStyles.container}>
        <SafeAreaView>
          <GlobalHeader
            title="Fynace"
            subtitle="Sign in to see your financial overview"
          />
        </SafeAreaView>
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
    <SafeAreaView edges={['top']} style={[homeStyles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar backgroundColor={theme.colors.background} barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      <HomeHeader
        userName={user?.fullName}
        userImage={user?.userImage}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      {syncStatus === 'syncing' && (
        <View
          style={{
            backgroundColor: theme.colors.elevation.level1,
            paddingVertical: 8,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.outlineVariant,
          }}
        >
          <ActivityIndicator size={14} color={theme.colors.secondary} />
          <Text
            style={{
              fontSize: 13,
              color: theme.colors.onSurfaceVariant,
              fontFamily: Fonts.medium,
            }}
          >
            Syncing your data...
          </Text>
        </View>
      )}

      <BottomSheet ref={bottomSheetRef} title="Filter Data" initialHeight={0.6}>
        <ScrollView
          style={[styles.filterOptionsScroll]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <Text style={[styles.filterLabel, { color: theme.colors.subtext }]}>Preset Ranges</Text>
          <View style={styles.presetGroup}>
            <FilterChip
              label="All Time"
              active={filterType === 'all_time'}
              onPress={() => {
                triggerHaptic('impactMedium');
                bottomSheetRef.current?.close();
                InteractionManager.runAfterInteractions(() => {
                  setFilterType('all_time');
                  setFilterValue(null);
                });
              }}
            />
            <FilterChip
              label="Current Week"
              active={filterType === 'current_week'}
              onPress={() => {
                triggerHaptic('impactMedium');
                bottomSheetRef.current?.close();
                InteractionManager.runAfterInteractions(() => {
                  setFilterType('current_week');
                  setFilterValue(null);
                });
              }}
            />
            <FilterChip
              label="Last Week"
              active={filterType === 'last_week'}
              onPress={() => {
                triggerHaptic('impactMedium');
                bottomSheetRef.current?.close();
                InteractionManager.runAfterInteractions(() => {
                  setFilterType('last_week');
                  setFilterValue(null);
                });
              }}
            />
          </View>

          <Divider style={[styles.modalDivider, { backgroundColor: theme.colors.outline }]} />
          <Text style={[styles.filterLabel, { color: theme.colors.subtext }]}>By Year</Text>
          <View style={styles.presetGroup}>
            {filterOptions.years.map(y => (
              <FilterChip
                key={y}
                label={y.toString()}
                active={filterType === 'yearly' && filterValue === y.toString()}
                onPress={() => {
                  triggerHaptic('impactMedium');
                  bottomSheetRef.current?.close();
                  InteractionManager.runAfterInteractions(() => {
                    setFilterType('yearly');
                    setFilterValue(y.toString());
                  });
                }}
              />
            ))}
          </View>

          <Divider style={[styles.modalDivider, { backgroundColor: theme.colors.outline }]} />
          <Text style={[styles.filterLabel, { color: theme.colors.subtext }]}>By Month</Text>
          <View style={styles.presetGroup}>
            {filterOptions.months.map(m => (
              <FilterChip
                key={m}
                label={formatMonth(m)}
                active={filterType === 'monthly' && filterValue === m}
                onPress={() => {
                  triggerHaptic('impactMedium');
                  bottomSheetRef.current?.close();
                  InteractionManager.runAfterInteractions(() => {
                    setFilterType('monthly');
                    setFilterValue(m);
                  });
                }}
              />
            ))}
          </View>
        </ScrollView>
      </BottomSheet>

      {loading && !rawExpenses.length ? (
        <HomeSkeleton />
      ) : (
        <ScrollView
          contentContainerStyle={homeStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.secondary]}
              progressBackgroundColor={theme.colors.surfaceVariant}
              tintColor={theme.colors.secondary}
            />
          }
        >
          <View style={homeStyles.statsRow}>
            <StatCard
              label="Money In"
              value={summary.totalIn || 0}
              trend={comparisonPercent.moneyInPercent !== null}
              trendValue={
                comparisonPercent.moneyInPercent !== null
                  ? `${comparisonPercent.moneyInPercent >= 0 ? '+' : ''}${comparisonPercent.moneyInPercent
                  }%`
                  : ''
              }
              type="in"
            />
            <StatCard
              label="Money Out"
              value={summary.totalOut || 0}
              trend={comparisonPercent.moneyOutPercent !== null}
              trendValue={
                comparisonPercent.moneyOutPercent !== null
                  ? `${comparisonPercent.moneyOutPercent >= 0 ? '+' : ''}${comparisonPercent.moneyOutPercent
                  }%`
                  : ''
              }
              type="out"
            />
          </View>

          <View style={homeStyles.balanceContainer}>
            <Text style={homeStyles.balanceLabel}>Amount Left</Text>
            <Text style={homeStyles.balanceAmount}>{formatAmount(summary.balance, user?.currency)}</Text>
          </View>

          <BarChartCard
            title="Activity summary"
            rawExpenses={rawExpenses}
            rawMoneyIn={rawMoneyIn}
            categories={categoryStats}
            totalIncome={activeChartType === 'expense' ? summary.totalIn : summary.totalOut}
            filterType={filterType}
            filterValue={filterValue}
            activeType={activeChartType}
            onTypeChange={setActiveChartType}
            onSelectPeriod={setActiveChartPeriod}
            onCategoryPress={handleCategoryPress}
            granularity={filterType === 'monthly' || filterType.includes('week') ? 'daily' : 'monthly'}
            onFilterPress={() => bottomSheetRef.current?.open()}
          />
        </ScrollView>
      )}

      <BottomSheet 
        ref={categorySheetRef} 
        title={`${selectedCategoryName} Transactions`}
        initialHeight={0.7}
      >
        <View style={{ paddingBottom: 40 }}>
          {categoryTxns.length > 0 ? (
            categoryTxns.map((item, index) => {
              const currentDate = formatItemDate(item.date);
              const prevDate = index > 0 ? formatItemDate(categoryTxns[index - 1].date) : null;
              const showDateHeader = currentDate && currentDate !== prevDate;

              return (
                <View key={item.id || item._id || index}>
                  {showDateHeader && (
                    <View style={homeStyles.dateHeader}>
                      <Text style={homeStyles.dateHeaderText}>{currentDate}</Text>
                    </View>
                  )}
                  <ExpenseCard
                    item={item}
                    formatItemTime={formatItemTime}
                    transformMonthLabel={transformMonthLabel}
                    onEdit={handleEditTransaction}
                    onDelete={null} 
                  />
                </View>
              );
            })
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 20, color: theme.colors.subtext }}>
              No transactions found
            </Text>
          )}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  syncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  syncText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
  },
  headerWrapper: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
  },
  filterOptionsScroll: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: Fonts.semibold,
    marginBottom: 12,
    marginTop: 8,
  },
  presetGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
  },
  modalDivider: {
    marginVertical: 12,
  },
});
