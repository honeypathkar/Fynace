import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Dialog,
  Portal,
  Searchbar,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import DocumentPicker, {
  isCancel,
  types as documentTypes,
} from 'react-native-document-picker';
import * as XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import GlobalHeader from '../../components/GlobalHeader';
import { useAuth } from '../../hooks/useAuth';
import { apiClient, parseApiError } from '../../api/client';
import { themeAssets } from '../../theme';

const defaultFormState = {
  month: '',
  category: '',
  amount: '',
  notes: '',
  moneyIn: '',
  moneyOut: '',
};

const ExpensesScreen = () => {
  const { token } = useAuth();
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState();
  const [months, setMonths] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState();
  const [comparison, setComparison] = useState();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [formVisible, setFormVisible] = useState(false);
  const [formValues, setFormValues] = useState(defaultFormState);

  const transformMonthLabel = useCallback((month) => {
    const [year, monthIndex] = month.split('-');
    const date = new Date(Number(year), Number(monthIndex) - 1);
    return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
  }, []);

  const fetchExpensesForMonth = useCallback(
    async (month, monthCollection) => {
      const availableMonths = monthCollection || months;
      try {
        setLoading(true);
        setSelectedMonth(month);

        const [expensesResponse, summaryResponse] = await Promise.all([
          apiClient.get(`/expenses/${month}`),
          apiClient.get(`/expenses/summary/${month}`),
        ]);

        setExpenses(expensesResponse.data?.expenses || []);
        setSummary(summaryResponse.data?.summary);

        const currentMonthIndex = availableMonths.indexOf(month);
        if (currentMonthIndex > 0) {
          const previousMonth = availableMonths[currentMonthIndex - 1];
          const compareResponse = await apiClient.get('/expenses/compare', {
            params: {
              month1: previousMonth,
              month2: month,
            },
          });
          setComparison(compareResponse.data?.comparison);
        } else {
          setComparison(undefined);
        }
      } catch (err) {
        const apiError = parseApiError(err);
        setError(apiError.message);
      } finally {
        setLoading(false);
      }
    },
    [months]
  );

  const fetchMonthsAndData = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const monthlyResponse = await apiClient.get('/chart/monthly');
      const monthsFetched =
        monthlyResponse.data?.data?.map((item) => item.month) || [];

      const sortedMonths = monthsFetched.sort((a, b) => a.localeCompare(b));
      setMonths(sortedMonths);

      const defaultMonth = selectedMonth || sortedMonths[sortedMonths.length - 1];
      if (defaultMonth) {
        await fetchExpensesForMonth(defaultMonth, sortedMonths);
      } else {
        setExpenses([]);
        setSummary(undefined);
        setComparison(undefined);
      }
    } catch (err) {
      const apiError = parseApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }, [fetchExpensesForMonth, selectedMonth, token]);

  useFocusEffect(
    useCallback(() => {
      fetchMonthsAndData();
    }, [fetchMonthsAndData])
  );

  const filteredExpenses = useMemo(() => {
    let list = expenses;
    if (selectedCategory !== 'All') {
      list = list.filter((expense) => expense.category === selectedCategory);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (expense) =>
          expense.category.toLowerCase().includes(query) ||
          (expense.notes || '').toLowerCase().includes(query)
      );
    }
    return list;
  }, [expenses, searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    const unique = new Set(expenses.map((expense) => expense.category));
    return ['All', ...Array.from(unique)];
  }, [expenses]);

  const comparisonKeys = ['moneyIn', 'moneyOut', 'remaining'];

  const comparisonChipStyles = useMemo(
    () =>
      StyleSheet.create({
        positive: {
          backgroundColor: theme.colors.secondaryContainer,
        },
        negative: {
          backgroundColor: '#FEE2E2',
        },
      }),
    [theme.colors.secondaryContainer]
  );

  const handleUploadExcel = useCallback(async () => {
    try {
      setUploading(true);
      setError(null);

      const file = await DocumentPicker.pickSingle({
        type: [documentTypes.xlsx, documentTypes.csv, documentTypes.plainText],
        copyTo: 'cachesDirectory',
      });

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
        await fetchExpensesForMonth(selectedMonth, months);
      } else {
        await fetchMonthsAndData();
      }
    } catch (err) {
      if (isCancel(err)) {
        return;
      }
      const apiError = parseApiError(err);
      setError(apiError.message);
    } finally {
      setUploading(false);
    }
  }, [fetchExpensesForMonth, fetchMonthsAndData, months, selectedMonth]);

  const updateFormValue = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const openForm = () => {
    setFormValues((prev) => ({
      ...defaultFormState,
      month: selectedMonth || prev.month,
    }));
    setFormVisible(true);
  };

  const closeForm = () => {
    setFormVisible(false);
  };

  const handleAddExpense = async () => {
    try {
      setLoading(true);
      const payload = {
        month: formValues.month,
        category: formValues.category,
        amount: Number(formValues.amount) || 0,
        notes: formValues.notes,
        moneyIn: Number(formValues.moneyIn) || 0,
        moneyOut: Number(formValues.moneyOut) || 0,
      };

      if (!payload.month || !payload.category) {
        Alert.alert('Missing details', 'Month and category are required');
        return;
      }

      await apiClient.post('/expenses', payload);
      closeForm();
      await fetchMonthsAndData();
    } catch (err) {
      const apiError = parseApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <View style={styles.container}>
        <GlobalHeader
          title="Track expenses effortlessly"
          subtitle="Log in from the Profile tab to manage your spending"
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <GlobalHeader
        title="Expenses"
        subtitle={
          selectedMonth
            ? `Showing data for ${transformMonthLabel(selectedMonth)}`
            : 'Pick a month to get started'
        }
        rightElement={
          <Button
            mode="contained"
            onPress={handleUploadExcel}
            loading={uploading}
            icon="upload">
            Import
          </Button>
        }
      />
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator animating size="large" />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={filteredExpenses}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              {error ? (
                <Card style={styles.errorCard}>
                  <Card.Content>
                    <Text variant="titleSmall" style={styles.errorTitle}>
                      Something went wrong
                    </Text>
                    <Text variant="bodyMedium" style={styles.errorText}>
                      {error}
                    </Text>
                    <Button onPress={fetchMonthsAndData}>Retry</Button>
                  </Card.Content>
                </Card>
              ) : null}

              <Card style={styles.summaryCard}>
                <Card.Content>
                  <View style={styles.summaryHeader}>
                    <Text variant="titleMedium">Summary</Text>
                    <Button
                      mode="outlined"
                      onPress={openForm}
                      icon="plus"
                      compact>
                      Add
                    </Button>
                  </View>
                  <View style={styles.summaryGrid}>
                    <View style={styles.summaryItem}>
                      <Text variant="labelMedium" style={styles.summaryLabel}>
                        Money In
                      </Text>
                      <Text variant="headlineSmall" style={styles.summaryValueIn}>
                        ₹{summary?.totalMoneyIn?.toLocaleString() || 0}
                      </Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text variant="labelMedium" style={styles.summaryLabel}>
                        Money Out
                      </Text>
                      <Text variant="headlineSmall" style={styles.summaryValueOut}>
                        ₹{summary?.totalMoneyOut?.toLocaleString() || 0}
                      </Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text variant="labelMedium" style={styles.summaryLabel}>
                        Remaining
                      </Text>
                      <Text variant="headlineSmall" style={styles.summaryValueRemaining}>
                        ₹{summary?.remaining?.toLocaleString() || 0}
                      </Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text variant="labelMedium" style={styles.summaryLabel}>
                        Entries
                      </Text>
                      <Text variant="headlineSmall" style={styles.summaryGeneric}>
                        {summary?.totalExpenses || 0}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>

              {comparison ? (
                <Card style={styles.comparisonCard}>
                  <Card.Title title="Month-over-month change" />
                  <Card.Content>
                    {comparisonKeys.map((key) => (
                      <View key={key} style={styles.comparisonRow}>
                        <Text variant="bodyLarge" style={styles.comparisonLabel}>
                          {key === 'moneyIn'
                            ? 'Money In'
                            : key === 'moneyOut'
                            ? 'Money Out'
                            : 'Remaining'}
                        </Text>
                        <View style={styles.comparisonValues}>
                          <Text variant="bodyMedium">
                            {comparison[key].difference >= 0 ? '+' : ''}
                            {comparison[key].difference.toLocaleString()}
                          </Text>
                          <Chip
                            compact
                            style={[
                              styles.comparisonChip,
                              comparison[key].difference >= 0
                                ? comparisonChipStyles.positive
                                : comparisonChipStyles.negative,
                            ]}>
                            {comparison[key].percentageChange.toFixed(1)}%
                          </Chip>
                        </View>
                      </View>
                    ))}
                  </Card.Content>
                </Card>
              ) : null}

              <Searchbar
                placeholder="Search by category or notes"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.search}
              />

              <View style={styles.monthSelector}>
                {months.map((month) => (
                  <Chip
                    key={month}
                    mode="outlined"
                    selected={selectedMonth === month}
                    onPress={() => fetchExpensesForMonth(month, months)}
                    style={styles.monthChip}>
                    {transformMonthLabel(month)}
                  </Chip>
                ))}
              </View>

              <View style={styles.filterRow}>
                {categories.map((category) => (
                  <Chip
                    key={category}
                    selected={selectedCategory === category}
                    onPress={() => setSelectedCategory(category)}
                    style={styles.filterChip}
                    compact>
                    {category}
                  </Chip>
                ))}
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <Card style={styles.expenseItem}>
              <Card.Title
                title={item.category}
                subtitle={transformMonthLabel(item.month)}
                // eslint-disable-next-line react/no-unstable-nested-components
                right={() => (
                  <View style={styles.expenseAmounts}>
                    {item.moneyIn ? (
                      <Text style={styles.moneyIn}>+₹{item.moneyIn.toLocaleString()}</Text>
                    ) : null}
                    {item.moneyOut ? (
                      <Text style={styles.moneyOut}>-₹{item.moneyOut.toLocaleString()}</Text>
                    ) : null}
                  </View>
                )}
              />
              {item.notes ? (
                <Card.Content>
                  <Text variant="bodyMedium" style={styles.expenseNotes}>
                    {item.notes}
                  </Text>
                </Card.Content>
              ) : null}
            </Card>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text variant="titleMedium" style={styles.emptyTitle}>
                No expenses yet
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                Add your first expense or import from a spreadsheet to begin tracking.
              </Text>
              <Button mode="contained" onPress={openForm} style={styles.emptyButton}>
                Add expense
              </Button>
            </View>
          }
        />
      )}

      <Portal>
        <Dialog visible={formVisible} onDismiss={closeForm}>
          <Dialog.Title>Add expense</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              <TextInput
                label="Month (YYYY-MM)"
                value={formValues.month}
                onChangeText={(value) => updateFormValue('month', value)}
                style={styles.input}
              />
              <TextInput
                label="Category"
                value={formValues.category}
                onChangeText={(value) => updateFormValue('category', value)}
                style={styles.input}
              />
              <TextInput
                label="Amount"
                value={formValues.amount}
                keyboardType="numeric"
                onChangeText={(value) => updateFormValue('amount', value)}
                style={styles.input}
              />
              <TextInput
                label="Money In"
                value={formValues.moneyIn}
                keyboardType="numeric"
                onChangeText={(value) => updateFormValue('moneyIn', value)}
                style={styles.input}
              />
              <TextInput
                label="Money Out"
                value={formValues.moneyOut}
                keyboardType="numeric"
                onChangeText={(value) => updateFormValue('moneyOut', value)}
                style={styles.input}
              />
              <TextInput
                label="Notes"
                value={formValues.notes}
                onChangeText={(value) => updateFormValue('notes', value)}
                multiline
                style={styles.input}
              />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={closeForm}>Cancel</Button>
            <Button onPress={handleAddExpense} loading={loading}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeAssets.palette.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: themeAssets.spacing[5],
    paddingBottom: themeAssets.spacing[6],
    gap: themeAssets.spacing[3],
  },
  listHeader: {
    gap: themeAssets.spacing[3],
  },
  summaryCard: {
    borderRadius: 18,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: themeAssets.spacing[3],
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: themeAssets.spacing[4],
  },
  summaryItem: {
    width: '45%',
  },
  summaryLabel: {
    color: themeAssets.palette.subtext,
  },
  summaryValueIn: {
    color: themeAssets.palette.success,
    fontWeight: '600',
  },
  summaryValueOut: {
    color: themeAssets.palette.error,
    fontWeight: '600',
  },
  summaryValueRemaining: {
    color: themeAssets.palette.primary,
    fontWeight: '600',
  },
  summaryGeneric: {
    color: themeAssets.palette.text,
  },
  comparisonCard: {
    borderRadius: 18,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: themeAssets.spacing[2],
  },
  comparisonLabel: {
    flex: 1,
  },
  comparisonValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: themeAssets.spacing[2],
  },
  comparisonChip: {
    alignSelf: 'flex-start',
  },
  search: {
    borderRadius: 12,
  },
  monthSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: themeAssets.spacing[2],
  },
  monthChip: {
    marginRight: themeAssets.spacing[2],
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: themeAssets.spacing[2],
  },
  filterChip: {
    marginRight: themeAssets.spacing[2],
  },
  expenseItem: {
    borderRadius: 16,
    marginBottom: themeAssets.spacing[2],
  },
  expenseAmounts: {
    alignItems: 'flex-end',
    gap: 4,
    marginRight: themeAssets.spacing[3],
  },
  moneyIn: {
    color: themeAssets.palette.success,
    fontWeight: '600',
  },
  moneyOut: {
    color: themeAssets.palette.error,
    fontWeight: '600',
  },
  expenseNotes: {
    color: themeAssets.palette.subtext,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: themeAssets.spacing[6],
    gap: themeAssets.spacing[2],
  },
  emptyTitle: {
    fontWeight: '600',
  },
  emptySubtitle: {
    textAlign: 'center',
    color: themeAssets.palette.subtext,
    paddingHorizontal: themeAssets.spacing[5],
  },
  emptyButton: {
    marginTop: themeAssets.spacing[2],
  },
  input: {
    marginBottom: themeAssets.spacing[3],
  },
  errorCard: {
    backgroundColor: '#FEE2E2',
    borderRadius: 18,
  },
  errorTitle: {
    marginBottom: themeAssets.spacing[1],
  },
  errorText: {
    marginBottom: themeAssets.spacing[1],
  },
});

export default ExpensesScreen;

