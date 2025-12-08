import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  FlatList,
  LayoutAnimation,
  View,
  Platform,
  ToastAndroid,
  KeyboardAvoidingView,
  ScrollView,
  UIManager,
  Easing,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Button, Card, Chip, Text, useTheme } from 'react-native-paper';
import TextInputField from '../../components/TextInputField';
import BottomSheet from '../../components/BottomSheet';
import PrimaryButton from '../../components/PrimaryButton';
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
} from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Fonts from '../../../assets/fonts';
import {
  SkeletonPulse,
  AnimatedExpenseCard,
  ExpenseCard,
  ExpenseSummary,
  ExpenseSearch,
  ExpenseComparison,
  FABMenu,
  MonthPicker,
  FilterSheet,
  CategoryPicker,
} from '../../components/expenses';
import expenseStyles from '../../components/expenses/styles';

const defaultFormState = {
  month: '',
  itemName: '',
  category: '',
  amount: '',
  notes: '',
};

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
  const { isVisible: isBottomBarVisible, hideBottomBar, showBottomBar } = useBottomBar();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [months, setMonths] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState();
  const [allTimeSummary, setAllTimeSummary] = useState();
  const [comparison, setComparison] = useState();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [formVisible, setFormVisible] = useState(false);
  const [formValues, setFormValues] = useState(defaultFormState);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [savingExpense, setSavingExpense] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [fabOpen, setFabOpen] = useState(false);
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [categories, setCategories] = useState({
    default: [],
    custom: [],
    all: [],
  });
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const bottomSheetRef = useRef(null);
  const fabMenuSheetRef = useRef(null);
  const filterSheetRef = useRef(null);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const loadingMoreRef = useRef(false);

  const transformMonthLabel = useCallback(month => {
    const [year, monthIndex] = month.split('-');
    const date = new Date(Number(year), Number(monthIndex) - 1);
    return date.toLocaleDateString('default', {
      month: 'long',
      year: 'numeric',
    });
  }, []);

  // Parse month string (like "June 2025") to YYYY-MM format
  const parseMonthToYYYYMM = useCallback(monthString => {
    if (!monthString) return null;

    // Check if already in YYYY-MM format
    const yyyyMMRegex = /^\d{4}-\d{2}$/;
    if (yyyyMMRegex.test(monthString.trim())) {
      return monthString.trim();
    }

    // Try to parse month names like "June 2025", "June2025", "Jun 2025"
    const monthNames = [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december',
      'jan',
      'feb',
      'mar',
      'apr',
      'may',
      'jun',
      'jul',
      'aug',
      'sep',
      'oct',
      'nov',
      'dec',
    ];

    const cleanString = monthString.toString().toLowerCase().trim();
    const yearMatch = cleanString.match(/(\d{4})/);
    const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();

    for (let i = 0; i < monthNames.length; i++) {
      if (cleanString.includes(monthNames[i])) {
        const monthIndex = i >= 12 ? i - 12 : i;
        const month = String(monthIndex + 1).padStart(2, '0');
        return `${year}-${month}`;
      }
    }

    return null;
  }, []);

  const generateMonthOptions = useCallback(() => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Generate last 12 months and next 12 months
    for (let i = -12; i <= 12; i++) {
      const date = new Date(currentYear, currentMonth + i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthKey = `${year}-${String(month).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('default', {
        month: 'long',
        year: 'numeric',
      });
      options.push({ key: monthKey, label: monthLabel });
    }
    return options;
  }, []);

  const monthOptions = useMemo(
    () => generateMonthOptions(),
    [generateMonthOptions],
  );

  const fetchExpenses = useCallback(
    async (month = 'All', pageNum = 1, append = false) => {
      try {
        if (pageNum === 1) {
        setLoading(true);
          loadingMoreRef.current = false;
        } else {
          setLoadingMore(true);
          loadingMoreRef.current = true;
        }
        setSelectedMonth(month);

        // Fetch expenses - all time or by month
        const expensesPromise =
          month === 'All'
            ? apiClient.get('/expenses/all', {
                params: { page: pageNum, limit: 20 },
              })
            : apiClient.get(`/expenses/${month}`, {
                params: { page: pageNum, limit: 20 },
              });

        const [expensesResponse, allTimeSummaryResponse] = await Promise.all([
          expensesPromise,
          apiClient
            .get('/expenses/summary/all-time')
            .catch(() => ({ data: { summary: null } })),
        ]);

        // Only use LayoutAnimation for initial load, not for pagination
        if (!append) {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
        const newExpenses = expensesResponse.data?.expenses || [];
        if (append) {
          setExpenses(prev => [...prev, ...newExpenses]);
        } else {
          setExpenses(newExpenses);
        }
        setAllTimeSummary(allTimeSummaryResponse?.data?.summary || null);

        // Check if there are more expenses - prioritize backend hasMore
        const backendHasMore = expensesResponse.data?.hasMore;
        let hasMoreData = false;

        if (backendHasMore !== undefined) {
          // Use backend's hasMore if available
          hasMoreData = backendHasMore;
        } else {
          // Fallback: check if we got a full page of results
          hasMoreData = newExpenses.length >= 20;
        }

        setHasMore(hasMoreData);
        setPage(pageNum);
        // Update refs for fresh state in callbacks
        pageRef.current = pageNum;
        hasMoreRef.current = hasMoreData;

        // Debug logging
        console.log('Pagination Debug:', {
          page: pageNum,
          received: newExpenses.length,
          hasMore: hasMoreData,
          backendHasMore: backendHasMore,
          total: expensesResponse.data?.total,
          append,
        });

        // Only fetch comparison if a specific month is selected
        if (month !== 'All') {
          const availableMonths = months.length > 0 ? months : [month];
        const currentMonthIndex = availableMonths.indexOf(month);
        if (currentMonthIndex > 0) {
          const previousMonth = availableMonths[currentMonthIndex - 1];
            try {
          const compareResponse = await apiClient.get('/expenses/compare', {
            params: {
              month1: previousMonth,
              month2: month,
            },
          });
          setComparison(compareResponse.data?.comparison);
            } catch (err) {
              setComparison(undefined);
            }
          } else {
            setComparison(undefined);
          }
        } else {
          setComparison(undefined);
        }
      } catch (err) {
        const apiError = parseApiError(err);
        setError(apiError.message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        loadingMoreRef.current = false;
      }
    },
    [months, selectedMonth],
  );

  const loadMoreExpenses = useCallback(() => {
    // Use refs to get fresh state values
    const currentPage = pageRef.current;
    const currentHasMore = hasMoreRef.current;
    const currentlyLoadingMore = loadingMoreRef.current;

    console.log('loadMoreExpenses called:', {
      currentPage,
      currentHasMore,
      currentlyLoadingMore,
      loading,
      selectedMonth,
      expensesCount: expenses.length,
    });

    if (!currentlyLoadingMore && currentHasMore && !loading) {
      const nextPage = currentPage + 1;
      console.log('Loading page:', nextPage);
      fetchExpenses(selectedMonth, nextPage, true);
    } else {
      console.log('Skipping load more:', {
        currentlyLoadingMore,
        currentHasMore,
        loading,
        reason: currentlyLoadingMore
          ? 'already loading'
          : !currentHasMore
          ? 'no more data'
          : 'initial loading',
      });
    }
  }, [loading, selectedMonth, fetchExpenses, expenses.length]);

  const fetchMonthsAndData = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const monthlyResponse = await apiClient.get('/chart/monthly');
      const monthsFetched =
        monthlyResponse.data?.data?.map(item => item.month) || [];

      const sortedMonths = monthsFetched.sort((a, b) => a.localeCompare(b));
      setMonths(sortedMonths);

      // By default, show all expenses (not filtered by month)
      setPage(1);
      setHasMore(true);
      pageRef.current = 1;
      hasMoreRef.current = true;
      await fetchExpenses('All', 1, false);
    } catch (err) {
      const apiError = parseApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [token, fetchExpenses]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh months list
      const monthlyResponse = await apiClient.get('/chart/monthly');
      const monthsFetched =
        monthlyResponse.data?.data?.map(item => item.month) || [];
      const sortedMonths = monthsFetched.sort((a, b) => a.localeCompare(b));
      setMonths(sortedMonths);

      // Refresh current expenses view
      setPage(1);
      setHasMore(true);
      pageRef.current = 1;
      hasMoreRef.current = true;
      await fetchExpenses(selectedMonth, 1, false);
    } catch (err) {
      const apiError = parseApiError(err);
      setError(apiError.message);
    } finally {
      setRefreshing(false);
    }
  }, [selectedMonth, fetchExpenses]);

  const fetchCategories = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingCategories(true);
      const response = await apiClient.get('/categories');
      setCategories(
        response.data?.data || { default: [], custom: [], all: [] },
      );
    } catch (err) {
      const apiError = parseApiError(err);
      console.warn('Failed to fetch categories:', apiError.message);
    } finally {
      setLoadingCategories(false);
    }
  }, [token]);

  const createCategory = useCallback(
    async categoryName => {
      if (!token || !categoryName.trim() || creatingCategory) return;
      try {
        setCreatingCategory(true);
        await apiClient.post('/categories', { name: categoryName.trim() });
        await fetchCategories();
        setNewCategoryName('');
        setShowAddCategory(false);
      } catch (err) {
        const apiError = parseApiError(err);
        if (Platform.OS === 'android') {
          ToastAndroid.show(
            apiError.message || 'Failed to create category',
            ToastAndroid.LONG,
          );
        }
      } finally {
        setCreatingCategory(false);
      }
    },
    [token, fetchCategories, creatingCategory],
  );

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      let isMounted = true;
      let hasFetched = false;

      const loadData = async () => {
        // Prevent multiple simultaneous fetches
        if (hasFetched) return;
        hasFetched = true;

        try {
          // Fetch months list (only if empty)
          if (months.length === 0) {
            const monthlyResponse = await apiClient.get('/chart/monthly');
            const monthsFetched =
              monthlyResponse.data?.data?.map(item => item.month) || [];
            const sortedMonths = monthsFetched.sort((a, b) =>
              a.localeCompare(b),
            );

            if (isMounted) {
              setMonths(sortedMonths);
            }
          }

          // Only fetch expenses if we don't have any or if it's initial load
          if (isMounted && (expenses.length === 0 || initialLoad)) {
            setPage(1);
            setHasMore(true);
            pageRef.current = 1;
            hasMoreRef.current = true;

            // Fetch expenses directly without using fetchExpenses callback to avoid dependency issues
            try {
              setLoading(true);
              const expensesPromise =
                selectedMonth === 'All'
                  ? apiClient.get('/expenses/all', {
                      params: { page: 1, limit: 20 },
                    })
                  : apiClient.get(`/expenses/${selectedMonth}`, {
                      params: { page: 1, limit: 20 },
                    });

              const [expensesResponse, allTimeSummaryResponse] =
                await Promise.all([
                  expensesPromise,
                  apiClient
                    .get('/expenses/summary/all-time')
                    .catch(() => ({ data: { summary: null } })),
                ]);

              if (isMounted) {
                const newExpenses = expensesResponse.data?.expenses || [];
                setExpenses(newExpenses);
                setAllTimeSummary(
                  allTimeSummaryResponse?.data?.summary || null,
                );

                const backendHasMore = expensesResponse.data?.hasMore;
                const hasMoreData =
                  backendHasMore !== undefined
                    ? backendHasMore
                    : newExpenses.length >= 20;
                setHasMore(hasMoreData);
                pageRef.current = 1;
                hasMoreRef.current = hasMoreData;
              }
            } catch (err) {
              if (isMounted) {
                const apiError = parseApiError(err);
                setError(apiError.message);
              }
            } finally {
              if (isMounted) {
                setLoading(false);
                setInitialLoad(false);
              }
            }
          } else if (isMounted) {
            setInitialLoad(false);
          }

          // Fetch categories (only if empty)
          if (categories.all.length === 0) {
            const categoriesResponse = await apiClient.get('/categories');
            if (isMounted) {
              setCategories(
                categoriesResponse.data?.data || {
                  default: [],
                  custom: [],
                  all: [],
                },
              );
            }
          }
        } catch (err) {
          if (isMounted) {
            const apiError = parseApiError(err);
            setError(apiError.message);
          }
        }
      };

      loadData();

      return () => {
        isMounted = false;
      };
    }, [token]), // Only depend on token to prevent constant refetching
  );

  const filteredExpenses = useMemo(() => {
    let list = expenses;
    if (selectedCategory !== 'All') {
      list = list.filter(expense => expense.category === selectedCategory);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        expense =>
          (expense.itemName || expense.category || '')
            .toLowerCase()
            .includes(query) ||
          (expense.category || '').toLowerCase().includes(query) ||
          (expense.notes || '').toLowerCase().includes(query),
      );
    }
    return list;
  }, [expenses, searchQuery, selectedCategory]);

  const expenseCategories = useMemo(() => {
    const unique = new Set(
      expenses.map(expense => expense.category).filter(Boolean),
    );
    return ['All', ...Array.from(unique)];
  }, [expenses]);

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

      if (!jsonData.length) {
        throw new Error('No data found in the selected file');
      }

      await apiClient.post('/expenses/upload', {
        expenses: jsonData,
      });

      if (selectedMonth) {
        await fetchExpenses(selectedMonth, 1, false);
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

  const updateFormValue = (key, value) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  };

  const openForm = (expense = null) => {
    if (expense) {
      // Pre-fill form for editing
      setEditingExpenseId(expense._id);
      setFormValues({
        month: expense.month || (selectedMonth !== 'All' ? selectedMonth : ''),
        itemName: expense.itemName || '',
        category: expense.category || '',
        amount: expense.amount?.toString() || '',
        notes: expense.notes || '',
      });
    } else {
      // Reset form for adding new expense
      setEditingExpenseId(null);
      setFormValues(prev => ({
      ...defaultFormState,
        month: selectedMonth !== 'All' ? selectedMonth : prev.month,
      }));
    }
    bottomSheetRef.current?.open();
  };

  const closeForm = useCallback(() => {
    setEditingExpenseId(null);
    setFormValues(defaultFormState);
    // Don't call bottomSheetRef.current?.close() here to avoid circular dependency
    // The BottomSheet will handle closing itself
  }, []);

  const handleFormClose = useCallback(() => {
    // Reset form state when BottomSheet closes
    setEditingExpenseId(null);
    setFormValues(defaultFormState);
  }, []);

  const toggleFab = () => {
    setFabOpen(true);
    fabMenuSheetRef.current?.open();
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
      if (Platform.OS === 'android') {
        ToastAndroid.show('SMS fetch feature coming soon!', ToastAndroid.LONG);
      }
    }, 200);
  };

  const handleFilterMonth = useCallback(async (month) => {
    setFilterSheetVisible(false);
    filterSheetRef.current?.close();
    // Small delay to allow sheet to start closing
    setTimeout(async () => {
      setSelectedMonth(month);
      setPage(1);
      setHasMore(true);
      pageRef.current = 1;
      hasMoreRef.current = true;
      setExpenses([]); // Clear current expenses
      await fetchExpenses(month, 1, false);
    }, 100);
  }, [fetchExpenses]);

  const handleFilterCategory = useCallback((category) => {
    setFilterSheetVisible(false);
    filterSheetRef.current?.close();
    // Small delay to allow sheet to start closing
    setTimeout(() => {
      setSelectedCategory(category);
    }, 100);
  }, []);

  const handleAddExpense = async () => {
    try {
      setSavingExpense(true);

      // Parse month to YYYY-MM format if needed
      const parsedMonth = parseMonthToYYYYMM(formValues.month);
      if (!parsedMonth) {
        if (Platform.OS === 'android') {
          ToastAndroid.show('Please select a valid month', ToastAndroid.LONG);
        }
        return;
      }

      const payload = {
        month: parsedMonth,
        itemName: formValues.itemName,
        category: formValues.category || '',
        amount: Number(formValues.amount) || 0,
        notes: formValues.notes,
      };

      if (!payload.itemName) {
        if (Platform.OS === 'android') {
          ToastAndroid.show('Item name is required', ToastAndroid.LONG);
        }
        return;
      }

      if (editingExpenseId) {
        // Update existing expense
        await apiClient.put(`/expenses/${editingExpenseId}`, payload);
      } else {
        // Create new expense
      await apiClient.post('/expenses', payload);
      }

      // Close the sheet - handleFormClose will reset form state
      bottomSheetRef.current?.close();
      setPage(1);
      setHasMore(true);
      pageRef.current = 1;
      hasMoreRef.current = true;
      // Refresh expenses based on current filter
      await fetchExpenses(selectedMonth, 1, false);
      await fetchMonthsAndData();
    } catch (err) {
      const apiError = parseApiError(err);
      setError(apiError.message);
      if (Platform.OS === 'android') {
        ToastAndroid.show(apiError.message, ToastAndroid.LONG);
      }
    } finally {
      setSavingExpense(false);
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
    <KeyboardAvoidingView
        style={expenseStyles.keyboardView}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
      <GlobalHeader
        title="Expenses"
        subtitle={
          selectedMonth === 'All'
            ? 'Showing all expenses'
            : `Showing data for ${transformMonthLabel(selectedMonth)}`
        }
        backgroundColor="transparent"
        titleColor="#F8FAFC"
        subtitleColor="#94A3B8"
      />
      {loading && initialLoad ? (
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
            <Card key={`list-skeleton-${index}`} style={expenseStyles.expenseItem}>
              <Card.Content>
                <SkeletonPulse style={expenseStyles.skeletonLabelWide} />
                <SkeletonPulse style={expenseStyles.skeletonNotes} />
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      ) : (
        <FlatList
          contentContainerStyle={expenseStyles.listContent}
          data={filteredExpenses}
          keyExtractor={item => item._id}
          onEndReached={loadMoreExpenses}
          onEndReachedThreshold={0.2}
          removeClippedSubviews={false}
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
          ListFooterComponent={
            loadingMore ? (
              <View style={expenseStyles.loadMoreContainer}>
                <Text style={expenseStyles.loadMoreText}>Loading more...</Text>
              </View>
            ) : null
          }
          ListHeaderComponent={
            <View style={expenseStyles.listHeader}>
              {error ? (
                <Card style={expenseStyles.errorCard}>
                  <Card.Content>
                    <Text variant="titleSmall" style={expenseStyles.errorTitle}>
                      Something went wrong
                    </Text>
                    <Text variant="bodyMedium" style={expenseStyles.errorText}>
                      {error}
                    </Text>
                    <Button onPress={fetchMonthsAndData}>Retry</Button>
                  </Card.Content>
                </Card>
              ) : null}

              <ExpenseSummary
                allTimeSummary={allTimeSummary}
                onAddPress={openForm}
              />

              <ExpenseComparison comparison={comparison} />

              <ExpenseSearch
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />

              <TouchableOpacity
                style={expenseStyles.filterButton}
                onPress={() => {
                  setFilterSheetVisible(true);
                  filterSheetRef.current?.open();
                }}
                activeOpacity={0.7}
              >
                <Filter size={20} color="#94A3B8" />
                <Text style={expenseStyles.filterButtonText}>Filters</Text>
                <ChevronDown size={18} color="#94A3B8" />
              </TouchableOpacity>
                  </View>
          }
          renderItem={({ item, index }) => {
            const skipAnimation = index >= 20;
            return (
              <AnimatedExpenseCard index={index} skipAnimation={skipAnimation}>
                <ExpenseCard
                  item={item}
                  transformMonthLabel={transformMonthLabel}
                  onEdit={openForm}
                />
              </AnimatedExpenseCard>
            );
          }}
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
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}

      <BottomSheet
        ref={bottomSheetRef}
        title={editingExpenseId ? 'Edit Expense' : 'Add Expense'}
        onClose={handleFormClose}
        footer={
          <View style={expenseStyles.formActions}>
                    <Button
                      mode="outlined"
              onPress={() => {
                bottomSheetRef.current?.close();
              }}
              textColor="#94A3B8"
              style={expenseStyles.formButton}
            >
              Cancel
                    </Button>
            <PrimaryButton
              title={editingExpenseId ? 'Update' : 'Save'}
              onPress={handleAddExpense}
              loading={savingExpense}
              style={expenseStyles.formButton}
              buttonColor="#3A6FF8"
            />
                    </View>
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          <View style={expenseStyles.inputWrapper}>
            <Text style={expenseStyles.inputLabel}>Month</Text>
            <TouchableOpacity
              style={expenseStyles.monthPickerButton}
              onPress={() => setMonthPickerVisible(true)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  expenseStyles.monthPickerText,
                  !formValues.month && expenseStyles.monthPickerPlaceholder,
                ]}
              >
                {formValues.month
                  ? transformMonthLabel(formValues.month)
                  : 'Select a month'}
                      </Text>
              <ChevronDown size={20} color="#94A3B8" />
            </TouchableOpacity>
                    </View>
          <TextInputField
            label="Item Name"
            value={formValues.itemName}
            onChangeText={value => updateFormValue('itemName', value)}
            placeholder="Enter item name"
          />
          <View style={expenseStyles.inputWrapper}>
            <Text style={expenseStyles.inputLabel}>Category (Optional)</Text>
            <TouchableOpacity
              style={expenseStyles.monthPickerButton}
              onPress={() => setCategoryPickerVisible(true)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  expenseStyles.monthPickerText,
                  !formValues.category && expenseStyles.monthPickerPlaceholder,
                ]}
              >
                {formValues.category || 'Select a category'}
                      </Text>
              <ChevronDown size={20} color="#94A3B8" />
            </TouchableOpacity>
                    </View>
          <TextInputField
                label="Amount"
                value={formValues.amount}
                keyboardType="numeric"
            onChangeText={value => updateFormValue('amount', value)}
            placeholder="0"
          />
          <TextInputField
                label="Notes"
                value={formValues.notes}
            onChangeText={value => updateFormValue('notes', value)}
            placeholder="Optional notes"
                multiline
            numberOfLines={3}
              />
            </ScrollView>
      </BottomSheet>

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

      <MonthPicker
        visible={monthPickerVisible}
        monthOptions={monthOptions}
        selectedMonth={formValues.month}
        onSelectMonth={(month) => updateFormValue('month', month)}
        onClose={() => setMonthPickerVisible(false)}
      />

      <FilterSheet
        sheetRef={filterSheetRef}
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        selectedMonth={selectedMonth}
        months={months}
        selectedCategory={selectedCategory}
        categories={expenseCategories}
        transformMonthLabel={transformMonthLabel}
        onSelectMonth={handleFilterMonth}
        onSelectCategory={handleFilterCategory}
      />

      <CategoryPicker
        visible={categoryPickerVisible}
        categories={categories.all}
        selectedCategory={formValues.category}
        onSelectCategory={(category) => updateFormValue('category', category)}
        onClose={() => setCategoryPickerVisible(false)}
        showAddCategory={showAddCategory}
        newCategoryName={newCategoryName}
        creatingCategory={creatingCategory}
        onCreateCategory={createCategory}
        onShowAddCategory={() => setShowAddCategory(true)}
        onHideAddCategory={() => {
          setShowAddCategory(false);
          setNewCategoryName('');
        }}
        onNewCategoryNameChange={setNewCategoryName}
      />
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ExpensesScreen;
