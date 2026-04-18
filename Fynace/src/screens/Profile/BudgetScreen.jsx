import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Dimensions,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import {
  Text,
  ProgressBar,
  FAB,
  Portal,
  Modal,
  TextInput,
  IconButton,
  Button,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  ChevronRight,
  Plus,
  Trash2,
  TrendingDown,
  Target,
  Layout,
  AlertTriangle,
} from 'lucide-react-native';
import GlobalHeader from '../../components/GlobalHeader';
import { apiClient } from '../../api/client';
import Fonts from '../../../assets/fonts';
import BottomSheet from '../../components/BottomSheet';
import { themeAssets } from '../../theme';

const { width } = Dimensions.get('window');

const BudgetScreen = () => {
  const navigation = useNavigation();
  const theme = themeAssets.palette;
  const isDark = true;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [limitAmount, setLimitAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  const categorySheetRef = useRef(null);
  const deleteSheetRef = useRef(null);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [budgetRes, catRes] = await Promise.all([
        apiClient.get('budgets').catch(() => ({ data: { data: [] } })),
        apiClient
          .get('categories')
          .catch(() => ({ data: { data: { all: [] } } })),
      ]);
      setBudgets(budgetRes.data.data || []);
      setCategories(catRes.data.data.all || []);
    } catch (error) {
      console.error('Fetch budget data error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchInitialData();
    }, [fetchInitialData]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  }, [fetchInitialData]);

  const handleSaveBudget = async () => {
    if (!selectedCategory || !limitAmount) return;

    setIsSubmitting(true);
    try {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        '0',
      )}`;

      await apiClient.post('budgets', {
        categoryName: selectedCategory.name,
        monthlyLimit: parseFloat(limitAmount),
        month,
      });

      setIsModalVisible(false);
      setLimitAmount('');
      setSelectedCategory(null);
      fetchInitialData();
    } catch (error) {
      console.error('Save budget error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBudget = budget => {
    setBudgetToDelete(budget);
    deleteSheetRef.current?.open();
  };

  const confirmDeleteBudget = async () => {
    if (!budgetToDelete) return;

    try {
      setIsSubmitting(true);
      await apiClient.delete(`budgets/${budgetToDelete._id}`);
      deleteSheetRef.current?.close();
      setBudgetToDelete(null);
      fetchInitialData();
    } catch (error) {
      console.error('Delete budget error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totals = useMemo(() => {
    const totalBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.totalSpent, 0);
    const percentage = totalBudget > 0 ? totalSpent / totalBudget : 0;
    return { totalBudget, totalSpent, percentage };
  }, [budgets]);

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <GlobalHeader
        title="Budgets"
        titleColor={theme.text}
        backgroundColor="transparent"
        showLeftIcon
        leftIconName="arrow-left"
        leftIconColor={theme.text}
        onLeftIconPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.summaryHeader}>
            <View>
              <Text style={[styles.summaryLabel, { color: theme.subtext }]}>
                Total Monthly Budget
              </Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                ₹{totals.totalBudget.toLocaleString()}
              </Text>
            </View>
            <View
              style={[
                styles.targetIcon,
                {
                  backgroundColor: isDark
                    ? 'rgba(58, 111, 248, 0.1)'
                    : 'rgba(58, 111, 248, 0.05)',
                },
              ]}
            >
              <Target size={24} color={theme.secondary} />
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressLabels}>
              <Text style={[styles.progressText, { color: theme.subtext }]}>
                Spent: ₹{totals.totalSpent.toLocaleString()}
              </Text>
              <Text style={[styles.progressText, { color: theme.subtext }]}>
                {Math.round(totals.percentage * 100)}%
              </Text>
            </View>
            <ProgressBar
              progress={Math.min(totals.percentage, 1)}
              color={totals.percentage > 0.9 ? theme.error : theme.secondary}
              style={[styles.progressBar, { backgroundColor: theme.border }]}
            />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Category Budgets
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.subtext }]}>
            Monthly limits per category
          </Text>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator
            size="large"
            color={theme.primary}
            style={{ marginTop: 40 }}
          />
        ) : budgets.length === 0 ? (
          <View style={styles.emptyState}>
            <Layout size={48} color={theme.placeholder} />
            <Text style={[styles.emptyText, { color: theme.subtext }]}>
              No budgets set for this month
            </Text>
            <Button
              mode="contained"
              onPress={() => setIsModalVisible(true)}
              style={[styles.emptyButton, { backgroundColor: theme.primary }]}
              labelStyle={{ fontFamily: Fonts.bold }}
            >
              Set First Budget
            </Button>
          </View>
        ) : (
          budgets.map(budget => {
            const ratio =
              budget.monthlyLimit > 0
                ? budget.totalSpent / budget.monthlyLimit
                : 0;
            const isOver = ratio >= 1;
            const isWarning = ratio >= 0.8;

            return (
              <View
                key={budget._id}
                style={[
                  styles.budgetCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.categoryName, { color: theme.text }]}>
                    {budget.categoryName}
                  </Text>
                  <TouchableOpacity onPress={() => handleDeleteBudget(budget)}>
                    <Trash2 size={18} color={theme.subtext} />
                  </TouchableOpacity>
                </View>

                <View style={styles.cardValues}>
                  <Text style={[styles.spentValue, { color: theme.text }]}>
                    ₹{budget.totalSpent.toLocaleString()}
                    <Text style={[styles.limitValue, { color: theme.subtext }]}>
                      {' '}
                      / ₹{budget.monthlyLimit.toLocaleString()}
                    </Text>
                  </Text>
                  {isOver && (
                    <Text style={[styles.overText, { color: theme.error }]}>
                      Over Budget!
                    </Text>
                  )}
                </View>

                <ProgressBar
                  progress={Math.min(ratio, 1)}
                  color={
                    isOver
                      ? theme.error
                      : isWarning
                        ? theme.warning
                        : theme.success
                  }
                  style={[
                    styles.cardProgress,
                    { backgroundColor: theme.border },
                  ]}
                />
              </View>
            );
          })
        )}

        {/* Delete Confirmation Sheet */}
        <BottomSheet
          ref={deleteSheetRef}
          title="Delete Budget"
          initialHeight={0.5}
          onClose={() => setBudgetToDelete(null)}
        >
          <View style={styles.deleteContent}>
            <View style={styles.deleteHeader}>
              <View style={styles.deleteIconContainer}>
                <AlertTriangle size={24} color="#EF4444" />
              </View>
              <Text style={[styles.deleteTitle, { color: theme.text }]}>
                Confirm Deletion
              </Text>
            </View>

            <Text style={[styles.deleteMessage, { color: theme.subtext }]}>
              Are you sure you want to delete the budget for "
              {budgetToDelete?.categoryName}"?
            </Text>

            <View
              style={[styles.deleteDetails, { backgroundColor: theme.surface }]}
            >
              <Text style={[styles.deleteAmount, { color: theme.text }]}>
                Limit: ₹{budgetToDelete?.monthlyLimit.toLocaleString()}
              </Text>
            </View>

            <Text style={[styles.deleteWarning, { color: theme.error }]}>
              This action cannot be undone.
            </Text>

            <View style={styles.deleteActions}>
              <Button
                mode="outlined"
                onPress={() => deleteSheetRef.current?.close()}
                style={styles.deleteCancelButton}
                contentStyle={{ height: 48 }}
                textColor={theme.subtext}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={confirmDeleteBudget}
                style={styles.deleteConfirmButton}
                contentStyle={{ height: 48 }}
                buttonColor="#EF4444"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Delete
              </Button>
            </View>
          </View>
        </BottomSheet>
      </ScrollView>

      <FAB
        icon={({ size, color }) => <Plus size={size} color="#000000" />}
        style={[styles.fab, { backgroundColor: '#d3d3ff' }]}
        onPress={() => setIsModalVisible(true)}
      />

      <Portal>
        <Modal
          visible={isModalVisible}
          onDismiss={() => setIsModalVisible(false)}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Set Category Budget
          </Text>

          <TouchableOpacity
            style={[
              styles.categoryPicker,
              { backgroundColor: theme.background, borderColor: theme.border },
            ]}
            onPress={() => categorySheetRef.current?.open()}
          >
            <Text
              style={[
                styles.pickerText,
                { color: theme.text },
                !selectedCategory && { color: theme.placeholder },
              ]}
            >
              {selectedCategory ? selectedCategory.name : 'Select Category'}
            </Text>
            <ChevronRight size={20} color={theme.subtext} />
          </TouchableOpacity>

          <TextInput
            label="Monthly Limit (₹)"
            value={limitAmount}
            onChangeText={setLimitAmount}
            keyboardType="numeric"
            mode="outlined"
            style={[styles.input, { backgroundColor: theme.background }]}
            outlineColor={theme.border}
            activeOutlineColor={theme.primary}
            textColor={theme.text}
          />

          <View style={styles.modalActions}>
            <Button
              onPress={() => setIsModalVisible(false)}
              textColor={theme.subtext}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSaveBudget}
              loading={isSubmitting}
              disabled={isSubmitting || !selectedCategory || !limitAmount}
              style={{ flex: 1, backgroundColor: theme.primary }}
              labelStyle={{ fontFamily: Fonts.bold }}
            >
              Save
            </Button>
          </View>
        </Modal>
      </Portal>

      <BottomSheet
        ref={categorySheetRef}
        title="Select Category"
        options={categories.map(c => ({ label: c, value: c }))}
        selectedValue={selectedCategory?.name}
        onSelect={val => setSelectedCategory({ name: val, id: val })}
        initialHeight={0.5}
      />
    </SafeAreaView>
  );
};

export default BudgetScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  summaryCard: {
    borderRadius: 24,
    padding: 20,
    marginTop: 10,
    borderWidth: 1,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  summaryValue: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    marginTop: 4,
  },
  targetIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    marginTop: 10,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  sectionHeader: {
    marginTop: 32,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    marginTop: 2,
  },
  budgetCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  cardValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  spentValue: {
    fontSize: 18,
    fontFamily: Fonts.bold,
  },
  limitValue: {
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  overText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    textTransform: 'uppercase',
  },
  cardProgress: {
    height: 6,
    borderRadius: 3,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 20,
    borderRadius: 16,
    elevation: 4,
  },
  deleteContent: {
    // padding: 20,
    paddingBottom: 40,
  },
  deleteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  deleteIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
  },
  deleteMessage: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.medium,
    marginBottom: 20,
  },
  deleteDetails: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  deleteAmount: {
    fontSize: 18,
    fontFamily: Fonts.bold,
  },
  deleteWarning: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    marginBottom: 24,
    textAlign: 'center',
  },
  deleteActions: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteCancelButton: {
    flex: 1,
    borderRadius: 12,
    borderColor: '#1A1A1A',
  },
  deleteConfirmButton: {
    flex: 1,
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 24,
  },
  modalContainer: {
    padding: 24,
    margin: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    marginBottom: 24,
  },
  categoryPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  pickerText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  input: {
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
});
