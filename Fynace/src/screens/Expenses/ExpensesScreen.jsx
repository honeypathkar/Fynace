import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Animated,
  LayoutAnimation,
  View,
  Platform,
  ToastAndroid,
  KeyboardAvoidingView,
  ScrollView,
  UIManager,
  Easing,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Button, Card, Chip, Text, useTheme } from 'react-native-paper';
import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
  types,
} from '@react-native-documents/picker';
import * as XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import GlobalHeader from '../../components/GlobalHeader';
import { useAuth } from '../../hooks/useAuth';
import { apiClient, parseApiError } from '../../api/client';
import { themeAssets } from '../../theme';
import { useBottomBar } from '../../context/BottomBarContext';
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  Pencil,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePrivacy } from '../../context/PrivacyContext';
import Fonts from '../../../assets/fonts';
import BottomSheet from '../../components/BottomSheet';
import {
  SkeletonPulse,
  AnimatedExpenseCard,
  ExpenseCard,
  ExpenseSummary,
  ExpenseSearch,
  ExpenseComparison,
  FABMenu,
  FilterSheet,
} from '../../components/expenses';
import expenseStyles from '../../components/expenses/styles';
import { database } from '../../database';
import { Q } from '@nozbe/watermelondb';
import { syncManager } from '../../sync/SyncManager';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ExpensesScreen = () => {
  const { token } = useAuth();
  const theme = useTheme();
  const navigation = useNavigation();
  const {
    isVisible: isBottomBarVisible,
    hideBottomBar,
    showBottomBar,
  } = useBottomBar();
  const { isPrivacyMode, togglePrivacyMode } = usePrivacy();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [months, setMonths] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState();
  const [allTimeSummary, setAllTimeSummary] = useState();
  const [comparison, setComparison] = useState();
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState({
    default: [],
    custom: [],
    all: [],
  });
  const [initialLoad, setInitialLoad] = useState(true);
  const [fabOpen, setFabOpen] = useState(false);
  const [lastCreatedAt, setLastCreatedAt] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const [loadingFilters, setLoadingFilters] = useState(false);
  const fabMenuSheetRef = useRef(null);
  const filterSheetRef = useRef(null);
  const deleteSheetRef = useRef(null);
  const lastCreatedAtRef = useRef(null);
  const hasMoreRef = useRef(true);
  const loadingMoreRef = useRef(false);

  const transformMonthLabel = useCallback(month => {
    const [year, monthIndex] = month.split('-');
    const date = new Date(Number(year), Number(monthIndex) - 1);
    return date.toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric',
    });
  }, []);

  const formatItemDate = useCallback(dateString => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  const formatItemTime = useCallback(dateString => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }, []);

  const getCurrentMonth = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, []);

  const fetchFilters = useCallback(async () => {
    if (months.length > 0 && categories.all.length > 0) return;

    try {
      setLoadingFilters(true);
      const [monthlyResponse, categoriesResponse] = await Promise.all([
        apiClient.get('/chart/monthly').catch(() => ({ data: { data: [] } })),
        apiClient.get('/categories').catch(() => ({
          data: { data: { default: [], custom: [], all: [] } },
        })),
      ]);

      const monthsFetched =
        monthlyResponse.data?.data?.map(item => item.month) || [];

      // Always merge with local data
      const [allLocalExpenses, allLocalMoneyIn, allLocalCategories] =
        await Promise.all([
          database.get('expenses').query(Q.where('is_deleted', false)).fetch(),
          database.get('money_in').query(Q.where('is_deleted', false)).fetch(),
          database
            .get('categories')
            .query(Q.where('is_deleted', false))
            .fetch(),
        ]);

      const localMonths = [
        ...new Set([
          ...allLocalExpenses.map(e => e.month),
          ...allLocalMoneyIn.map(m => m.month),
        ]),
      ].filter(Boolean);

      const combinedMonths = [...new Set([...monthsFetched, ...localMonths])];
      const sortedMonths = combinedMonths.sort((a, b) => b.localeCompare(a));

      console.log(`Navigation found months: ${sortedMonths.join(', ')}`);
      setMonths(sortedMonths);

      const remoteCategories = categoriesResponse.data?.data?.all || [];
      const localCategoryNames = allLocalCategories.map(c => c.name);
      const combinedCategories = [
        ...new Set([...remoteCategories, ...localCategoryNames]),
      ];

      setCategories({
        default: categoriesResponse.data?.data?.default || [],
        custom: categoriesResponse.data?.data?.custom || [],
        all: combinedCategories,
      });
    } catch (err) {
      console.warn('Failed to fetch filters', err);
    } finally {
      setLoadingFilters(false);
    }
  }, [months.length, categories.all.length]);

  const fetchExpenses = useCallback(
    async (
      monthSelection = selectedMonth,
      lastCreated = null,
      append = false,
      categorySelection = selectedCategory,
      searchSelection = debouncedSearch,
      currentCount = 0,
    ) => {
      try {
        if (!append) {
          setLoading(true);
          loadingMoreRef.current = false;
        } else {
          setLoadingMore(true);
          loadingMoreRef.current = true;
        }

        // Build query clauses
        const clauses = [Q.where('is_deleted', false)];

        if (monthSelection !== 'All') {
          clauses.push(Q.where('month', monthSelection));
        }

        if (categorySelection !== 'All') {
          clauses.push(Q.where('category', categorySelection));
        }

        if (searchSelection) {
          clauses.push(
            Q.where(
              'item_name',
              Q.like(`%${Q.sanitizeLikeString(searchSelection)}%`),
            ),
          );
        }

        const offset = append ? currentCount : 0;
        const query = database
          .get('expenses')
          .query(
            ...clauses,
            Q.sortBy('date', Q.desc),
            Q.skip(offset),
            Q.take(20),
          );

        const [newExpenses, totalCount] = await Promise.all([
          query.fetch(),
          append
            ? Promise.resolve(0)
            : database
                .get('expenses')
                .query(...clauses)
                .fetchCount(),
        ]);

        if (!append) {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setExpenses(newExpenses);

          // Only calculate summary on initial fetch or filter change
          const summaryClauses = [Q.where('is_deleted', false)];
          if (monthSelection !== 'All') {
            summaryClauses.push(Q.where('month', monthSelection));
          }

          const [allIn, allOut] = await Promise.all([
            database
              .get('money_in')
              .query(...summaryClauses)
              .fetch(),
            database
              .get('expenses')
              .query(...summaryClauses)
              .fetch(),
          ]);

          const totalMoneyOut = allOut.reduce(
            (sum, exp) => sum + (exp.moneyOut || exp.amount || 0),
            0,
          );
          const totalMoneyIn = allIn.reduce(
            (sum, entry) => sum + (entry.amount || 0),
            0,
          );
          const remaining = totalMoneyIn - totalMoneyOut;

          const breakdownObj = allOut.reduce((acc, exp) => {
            const amt = exp.moneyOut || exp.amount || 0;
            acc[exp.category] = (acc[exp.category] || 0) + amt;
            return acc;
          }, {});

          const breakdown = Object.entries(breakdownObj).map(
            ([name, value]) => ({
              name,
              value,
            }),
          );
          const finalSummary = {
            totalMoneyIn,
            totalMoneyOut,
            remaining,
            totalExpenses: allOut.length,
          };

          if (monthSelection === 'All') {
            setAllTimeSummary(finalSummary);
            setSummary(null);
          } else {
            setSummary(finalSummary);
          }
          setCategoryBreakdown(breakdown);

          const hasMoreData = totalCount > newExpenses.length;
          setHasMore(hasMoreData);
          hasMoreRef.current = hasMoreData;
        } else {
          if (newExpenses.length > 0) {
            setExpenses(prev => [...prev, ...newExpenses]);
          }
          const hasMoreData = newExpenses.length === 20;
          setHasMore(hasMoreData);
          hasMoreRef.current = hasMoreData;
        }

        const newLastCreated =
          newExpenses.length > 0
            ? newExpenses[newExpenses.length - 1].date // Use date for reliable pagination if sorted by date
            : null;
        setLastCreatedAt(newLastCreated);
        lastCreatedAtRef.current = newLastCreated;
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to fetch local expenses');
      } finally {
        setLoading(false);
        setLoadingMore(false);
        loadingMoreRef.current = false;
        setInitialLoad(false);
      }
    },
    [selectedMonth, selectedCategory, debouncedSearch],
  );

  const loadMoreExpenses = useCallback(() => {
    // Use refs to get fresh state values
    const currentHasMore = hasMoreRef.current;
    const currentlyLoadingMore = loadingMoreRef.current;

    if (!currentlyLoadingMore && currentHasMore && !loading) {
      fetchExpenses(
        selectedMonth,
        lastCreatedAtRef.current,
        true,
        selectedCategory,
        debouncedSearch,
        expenses.length,
      );
    }
  }, [
    loading,
    selectedMonth,
    selectedCategory,
    debouncedSearch,
    fetchExpenses,
    expenses.length,
  ]);

  const fetchMonthsAndData = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const monthlyResponse = await apiClient
        .get('/chart/monthly')
        .catch(() => ({ data: { data: [] } }));

      const [allLocalExpenses, allLocalMoneyIn] = await Promise.all([
        database.get('expenses').query(Q.where('is_deleted', false)).fetch(),
        database.get('money_in').query(Q.where('is_deleted', false)).fetch(),
      ]);

      const localMonths = [
        ...new Set([
          ...allLocalExpenses.map(e => e.month),
          ...allLocalMoneyIn.map(m => m.month),
        ]),
      ].filter(Boolean);

      const combinedMonths = [
        ...new Set([
          ...(monthlyResponse.data?.data?.map(item => item.month) || []),
          ...localMonths,
        ]),
      ];
      const sortedMonths = combinedMonths.sort((a, b) => b.localeCompare(a));
      setMonths(sortedMonths);

      // By default, show all expenses
      setLastCreatedAt(null);
      setHasMore(true);
      lastCreatedAtRef.current = null;
      hasMoreRef.current = true;
      await fetchExpenses('All', null, false, 'All', '', 0);
    } catch (err) {
      const apiError = parseApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [token, fetchExpenses]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Trigger background sync (force full sync on manual refresh)
      await syncManager.sync(true);

      // Refresh months and categories locally/remotely
      const [monthlyResponse, categoriesResponse] = await Promise.all([
        apiClient.get('/chart/monthly').catch(() => ({ data: { data: [] } })),
        apiClient
          .get('/categories')
          .catch(() => ({ data: { data: { all: [] } } })),
      ]);

      const [allLocalExpenses, allLocalMoneyIn, allLocalCategories] =
        await Promise.all([
          database.get('expenses').query(Q.where('is_deleted', false)).fetch(),
          database.get('money_in').query(Q.where('is_deleted', false)).fetch(),
          database
            .get('categories')
            .query(Q.where('is_deleted', false))
            .fetch(),
        ]);

      const localMonths = [
        ...new Set([
          ...allLocalExpenses.map(e => e.month),
          ...allLocalMoneyIn.map(m => m.month),
        ]),
      ].filter(Boolean);

      const combinedMonths = [
        ...new Set([
          ...(monthlyResponse.data?.data?.map(item => item.month) || []),
          ...localMonths,
        ]),
      ];
      const sortedMonths = combinedMonths.sort((a, b) => b.localeCompare(a));
      setMonths(sortedMonths);

      const remoteCategories = categoriesResponse.data?.data?.all || [];
      const localCategoryNames = allLocalCategories.map(c => c.name);
      const combinedCategories = [
        ...new Set([...remoteCategories, ...localCategoryNames]),
      ];

      setCategories({
        default: categoriesResponse.data?.data?.default || [],
        custom: categoriesResponse.data?.data?.custom || [],
        all: combinedCategories,
      });

      // Refresh current expenses view from local DB
      setLastCreatedAt(null);
      setHasMore(true);
      lastCreatedAtRef.current = null;
      hasMoreRef.current = true;
      await fetchExpenses(
        selectedMonth,
        null,
        false,
        selectedCategory,
        debouncedSearch,
        0,
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedMonth, selectedCategory, debouncedSearch, fetchExpenses]);

  useFocusEffect(
    useCallback(() => {
      if (!token) return;

      const refreshAll = async () => {
        // Run background sync only if online
        syncManager.sync().catch(console.error);

        // Fetch months and data
        if (initialLoad) {
          await fetchMonthsAndData();
        } else {
          // If already loaded once, just refresh the current view
          setLastCreatedAt(null);
          setHasMore(true);
          lastCreatedAtRef.current = null;
          hasMoreRef.current = true;
          await fetchExpenses(
            selectedMonth,
            null,
            false,
            selectedCategory,
            debouncedSearch,
            0,
          );
        }
      };

      refreshAll();
    }, [
      token,
      initialLoad,
      selectedMonth,
      selectedCategory,
      debouncedSearch,
      fetchExpenses,
      fetchMonthsAndData,
    ]),
  );

  const filteredExpenses = useMemo(() => expenses, [expenses]);

  const renderItem = useCallback(
    ({ item, index }) => {
      const skipAnimation = index >= 20;
      const currentDate = formatItemDate(item.date);
      const prevDate =
        index > 0 ? formatItemDate(expenses[index - 1].date) : null;
      const showDateHeader = currentDate && currentDate !== prevDate;

      return (
        <View>
          {showDateHeader && (
            <View style={expenseStyles.dateHeader}>
              <Text style={expenseStyles.dateHeaderText}>{currentDate}</Text>
            </View>
          )}
          <AnimatedExpenseCard index={index} skipAnimation={skipAnimation}>
            <ExpenseCard
              item={item}
              transformMonthLabel={transformMonthLabel}
              formatItemTime={formatItemTime}
              onEdit={openForm}
              onDelete={handleDeleteExpense}
            />
          </AnimatedExpenseCard>
        </View>
      );
    },
    [
      expenses,
      formatItemDate,
      transformMonthLabel,
      formatItemTime,
      openForm,
      handleDeleteExpense,
    ],
  );

  const expenseCategories = useMemo(() => {
    const unique = new Set([
      ...expenses.map(expense => expense.category).filter(Boolean),
      ...(categories.all || []),
    ]);
    return ['All', ...Array.from(unique)];
  }, [expenses, categories.all]);

  const displaySummary = useMemo(() => {
    return selectedMonth === 'All' ? allTimeSummary : summary;
  }, [allTimeSummary, summary, selectedMonth]);

  const comparisonKeys = ['moneyIn', 'moneyOut', 'remaining'];

  const comparisonChipStyles = useMemo(
    () =>
      StyleSheet.create({
        positive: {
          backgroundColor: '#1E3A5F',
        },
        negative: {
          backgroundColor: '#5F1E1E',
        },
      }),
    [],
  );

  const handleUploadExcel = useCallback(async () => {
    try {
      setUploading(true);
      setError(null);

      const [pickerResult] = await pick({
        mode: 'open',
        type: [types.xlsx, types.csv, types.plainText],
      });

      if (!pickerResult) {
        return;
      }

      const file = await keepLocalCopy(pickerResult);

      const filePath = file.fileCopyUri || file.uri;
      if (!filePath) {
        throw new Error('Unable to read the selected file');
      }

      const normalizedPath =
        Platform.OS === 'ios' ? filePath.replace('file://', '') : filePath;

      const fileContent = await RNFS.readFile(normalizedPath, 'base64');
      const workbook = XLSX.read(fileContent, { type: 'base64' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      await apiClient.post('/expenses/upload', {
        expenses: jsonData,
      });

      if (selectedMonth) {
        await fetchExpenses(selectedMonth, null, false);
      } else {
        await fetchMonthsAndData();
      }
    } catch (err) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
      const apiError = parseApiError(err);
      setError(apiError.message);
    } finally {
      setUploading(false);
    }
  }, [fetchExpenses, fetchMonthsAndData, months, selectedMonth]);

  const openForm = (expense = null) => {
    navigation.navigate('AddExpense', { expense });
  };

  const toggleFab = () => {
    setFabOpen(true);
    fabMenuSheetRef.current?.open();
  };

  const handleOpenFilters = () => {
    filterSheetRef.current?.open();
    fetchFilters();
  };

  const handleAddManually = () => {
    fabMenuSheetRef.current?.close();
    setTimeout(() => {
      setFabOpen(false);
      openForm();
    }, 200);
  };

  const handleImportExcel = () => {
    fabMenuSheetRef.current?.close();
    setTimeout(() => {
      setFabOpen(false);
      navigation.navigate('ExcelUpload');
    }, 200);
  };

  const handleSmsFetch = () => {
    fabMenuSheetRef.current?.close();
    setTimeout(() => {
      setFabOpen(false);
      navigation.navigate('SmsFetch');
    }, 200);
  };

  const handleFilterMonth = useCallback(async month => {
    filterSheetRef.current?.close();
    // Short delay to let animation start smoothly
    setTimeout(() => {
      setSelectedMonth(month);
    }, 100);
  }, []);

  const handleFilterCategory = useCallback(category => {
    filterSheetRef.current?.close();
    // Short delay to let animation start smoothly
    setTimeout(() => {
      setSelectedCategory(category);
    }, 100);
  }, []);

  const handleDeleteExpense = useCallback(expense => {
    setExpenseToDelete(expense);
    deleteSheetRef.current?.open();
  }, []);

  const confirmDeleteExpense = async () => {
    if (!expenseToDelete) return;

    try {
      setIsDeleting(true);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Deleting expense...', ToastAndroid.SHORT);
      }

      await apiClient.delete(
        `/expenses/${expenseToDelete.id || expenseToDelete._id}`,
      );

      if (Platform.OS === 'android') {
        ToastAndroid.show('Expense deleted successfully', ToastAndroid.SHORT);
      }

      deleteSheetRef.current?.close();
      setExpenseToDelete(null);

      // Refresh expenses
      setLastCreatedAt(null);
      setHasMore(true);
      lastCreatedAtRef.current = null;
      hasMoreRef.current = true;
      await fetchExpenses(selectedMonth, null, false);
      await fetchMonthsAndData();
    } catch (err) {
      const apiError = parseApiError(err);
      setError(apiError.message);
      if (Platform.OS === 'android') {
        ToastAndroid.show(
          apiError.message || 'Failed to delete expense',
          ToastAndroid.LONG,
        );
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!token) {
    return (
      <View style={expenseStyles.container}>
        <GlobalHeader
          title="Track expenses effortlessly"
          subtitle="Log in from the Profile tab to manage your spending"
        />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={expenseStyles.container}>
      <View style={expenseStyles.keyboardView}>
        <GlobalHeader
          title="Expenses"
          titleColor="#F8FAFC"
          backgroundColor="transparent"
          renderRightComponent={() => (
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
            >
              <Pressable
                onPress={togglePrivacyMode}
                style={({ pressed }) => [
                  {
                    padding: 8,
                    borderRadius: 12,
                    backgroundColor: isPrivacyMode ? '#1E293B' : 'transparent',
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                {isPrivacyMode ? (
                  <Eye size={20} color="#3A6FF8" />
                ) : (
                  <EyeOff size={20} color="#94A3B8" />
                )}
              </Pressable>
              <TouchableOpacity
                onPress={handleOpenFilters}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 12,
                  backgroundColor: '#1E293B',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Filter size={18} color="#F8FAFC" />
                <Text
                  style={{
                    color: '#F8FAFC',
                    fontFamily: Fonts.semibold,
                    fontSize: 13,
                  }}
                >
                  Filters
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
        {/* <Text
          variant="bodyMedium"
          style={[expenseStyles.subtitle, { color: '#94A3B8' }]}
        >
          {selectedMonth === 'All'
            ? 'Showing all expenses'
            : `Showing data for ${transformMonthLabel(selectedMonth)}`}
        </Text> */}
        {initialLoad && expenses.length === 0 ? (
          <ScrollView contentContainerStyle={expenseStyles.skeletonContainer}>
            <Card style={expenseStyles.summaryCard}>
              <Card.Content>
                <View style={expenseStyles.summaryHeader}>
                  <SkeletonPulse style={expenseStyles.skeletonTitleShort} />
                  <SkeletonPulse style={expenseStyles.skeletonButton} />
                </View>
                <View style={expenseStyles.summaryGrid}>
                  {[0, 1, 2, 3].map(index => (
                    <View
                      key={`summary-skeleton-${index}`}
                      style={expenseStyles.summaryItem}
                    >
                      <SkeletonPulse style={expenseStyles.skeletonLabel} />
                      <SkeletonPulse style={expenseStyles.skeletonValue} />
                    </View>
                  ))}
                </View>
              </Card.Content>
            </Card>
            <Card style={expenseStyles.comparisonCard}>
              <Card.Content>
                {[0, 1, 2].map(index => (
                  <View
                    key={`comparison-skeleton-${index}`}
                    style={expenseStyles.comparisonRow}
                  >
                    <SkeletonPulse style={expenseStyles.skeletonLabelWide} />
                    <View style={expenseStyles.comparisonValues}>
                      <SkeletonPulse style={expenseStyles.skeletonChipValue} />
                      <SkeletonPulse style={expenseStyles.skeletonChip} />
                    </View>
                  </View>
                ))}
              </Card.Content>
            </Card>
            {[0, 1, 2].map(index => (
              <Card
                key={`list-skeleton-${index}`}
                style={expenseStyles.expenseItem}
              >
                <Card.Content>
                  <SkeletonPulse style={expenseStyles.skeletonLabelWide} />
                  <SkeletonPulse style={expenseStyles.skeletonNotes} />
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
        ) : (
          <FlashList
            contentContainerStyle={expenseStyles.listContent}
            data={filteredExpenses}
            keyExtractor={item => item.id || item._id}
            onEndReached={loadMoreExpenses}
            onEndReachedThreshold={0.5}
            estimatedItemSize={100}
            onScrollBeginDrag={() => hideBottomBar()}
            onScrollEndDrag={e => {
              const { contentOffset } = e.nativeEvent;
              if (contentOffset.y <= 0) {
                showBottomBar();
              }
            }}
            onMomentumScrollEnd={e => {
              const { contentOffset } = e.nativeEvent;
              if (contentOffset.y <= 0) {
                showBottomBar();
              }
            }}
            scrollEventThrottle={16}
            ListFooterComponent={
              loadingMore ? (
                <View style={expenseStyles.loadMoreContainer}>
                  <Text style={expenseStyles.loadMoreText}>
                    Loading more...
                  </Text>
                </View>
              ) : null
            }
            ListHeaderComponent={
              <View style={expenseStyles.listHeader}>
                {error ? (
                  <Card style={expenseStyles.errorCard}>
                    <Card.Content>
                      <Text
                        variant="titleSmall"
                        style={expenseStyles.errorTitle}
                      >
                        Something went wrong
                      </Text>
                      <Text
                        variant="bodyMedium"
                        style={expenseStyles.errorText}
                      >
                        {error}
                      </Text>
                      <Button onPress={fetchMonthsAndData}>Retry</Button>
                    </Card.Content>
                  </Card>
                ) : null}

                <ExpenseSummary
                  allTimeSummary={displaySummary}
                  onAddPress={openForm}
                />

                <ExpenseComparison comparison={comparison} />

                <ExpenseSearch
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />

                {/* <TouchableOpacity
                  style={expenseStyles.filterButton}
                  onPress={() => {
                  filterSheetRef.current?.open();
                  fetchFilters();
                }}
  activeOpacity={0.7}
                >
                  <Filter size={20} color="#94A3B8" />
                  <Text style={expenseStyles.filterButtonText}>Filters</Text>
                  <ChevronDown size={18} color="#94A3B8" />
                </TouchableOpacity> */}
              </View>
            }
            renderItem={renderItem}
            ListEmptyComponent={
              <View style={expenseStyles.emptyState}>
                <Text variant="titleMedium" style={expenseStyles.emptyTitle}>
                  No expenses yet
                </Text>
                <Text variant="bodyMedium" style={expenseStyles.emptySubtitle}>
                  Add your first expense or import from a spreadsheet to begin
                  tracking.
                </Text>
                <TouchableOpacity
                  style={expenseStyles.emptyButton}
                  onPress={openForm}
                  activeOpacity={0.8}
                >
                  <Plus size={20} color="#F8FAFC" />
                  <Text style={expenseStyles.emptyButtonText}>Add expense</Text>
                </TouchableOpacity>
              </View>
            }
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        )}

        {/* FAB Button */}
        <TouchableOpacity
          style={[
            expenseStyles.fabButton,
            { bottom: isBottomBarVisible ? 100 : 20 },
          ]}
          onPress={toggleFab}
          activeOpacity={0.8}
        >
          <Plus size={28} color="#F8FAFC" />
        </TouchableOpacity>

        {/* Action Menu Bottom Sheet */}
        <FABMenu
          sheetRef={fabMenuSheetRef}
          onClose={() => setFabOpen(false)}
          onAddManually={handleAddManually}
          onImportExcel={handleImportExcel}
          onSmsFetch={handleSmsFetch}
          uploading={uploading}
        />

        <FilterSheet
          sheetRef={filterSheetRef}
          onClose={() => {}}
          selectedMonth={selectedMonth}
          months={months}
          selectedCategory={selectedCategory}
          categories={['All', ...categories.all]}
          transformMonthLabel={transformMonthLabel}
          onSelectMonth={handleFilterMonth}
          onSelectCategory={handleFilterCategory}
          loading={loadingFilters}
        />

        {/* Delete Confirmation Sheet */}
        <BottomSheet
          ref={deleteSheetRef}
          title="Delete Expense"
          initialHeight={0.5}
          onClose={() => setExpenseToDelete(null)}
        >
          <View style={expenseStyles.deleteContent}>
            <View style={expenseStyles.deleteHeader}>
              <View style={expenseStyles.deleteIconContainer}>
                <AlertTriangle size={24} color="#EF4444" />
              </View>
              <Text style={expenseStyles.deleteTitle}>Confirm Deletion</Text>
            </View>

            <Text style={expenseStyles.deleteMessage}>
              Are you sure you want to delete "
              {expenseToDelete?.itemName || expenseToDelete?.category}"?
            </Text>

            <View style={expenseStyles.deleteDetails}>
              <Text style={expenseStyles.deleteAmount}>
                ₹
                {(
                  expenseToDelete?.amount ||
                  expenseToDelete?.moneyOut ||
                  0
                ).toLocaleString()}
              </Text>
              {expenseToDelete?.category && (
                <Chip
                  style={expenseStyles.deleteCategoryChip}
                  textStyle={expenseStyles.deleteCategoryText}
                >
                  {expenseToDelete.category}
                </Chip>
              )}
            </View>

            <Text style={expenseStyles.deleteWarning}>
              This action cannot be undone.
            </Text>

            <View style={expenseStyles.deleteActions}>
              <Button
                mode="outlined"
                onPress={() => deleteSheetRef.current?.close()}
                style={expenseStyles.deleteCancelButton}
                textColor="#94A3B8"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={confirmDeleteExpense}
                style={expenseStyles.deleteConfirmButton}
                buttonColor="#EF4444"
                loading={isDeleting}
                disabled={isDeleting}
              >
                Delete
              </Button>
            </View>
          </View>
        </BottomSheet>
      </View>
    </SafeAreaView>
  );
};

export default ExpensesScreen;
