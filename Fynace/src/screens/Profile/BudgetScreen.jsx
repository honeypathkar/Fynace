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
  useTheme,
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
import { database } from '../../database';
import { Q } from '@nozbe/watermelondb';
import { syncManager } from '../../sync/SyncManager';
import { SkeletonPulse } from '../../components/expenses';
import Fonts from '../../../assets/fonts';
import BottomSheet from '../../components/BottomSheet';

const { width } = Dimensions.get('window');

const BudgetSkeleton = () => {
  const theme = useTheme();
  return (
    <View style={{ gap: 12 }}>
      {[1, 2, 3].map(i => (
        <View
          key={i}
          style={{
            height: 120,
            borderRadius: 20,
            backgroundColor: theme.colors.elevation.level1,
            padding: 16,
            gap: 12,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <SkeletonPulse style={{ width: 120, height: 20 }} />
            <SkeletonPulse style={{ width: 24, height: 24 }} />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}
          >
            <SkeletonPulse style={{ width: 80, height: 24 }} />
            <SkeletonPulse style={{ width: 100, height: 16 }} />
          </View>
          <SkeletonPulse style={{ width: '100%', height: 6, borderRadius: 3 }} />
        </View>
      ))}
    </View>
  );
};

const BudgetScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const isDark = theme.dark;
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
      
      // Fetch Categories
      const localCats = await database.get('categories').query(Q.where('is_deleted', false)).fetch();
      setCategories(localCats);

      // Fetch Budgets
      const localBudgets = await database.get('budgets').query(Q.where('is_deleted', false)).fetch();
      
      // For each budget, calculate total spent from transactions
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      const budgetsWithSpent = await Promise.all(localBudgets.map(async (b) => {
        // Query transactions for this category and month
        const txns = await database.get('transactions').query(
          Q.and(
            Q.where('category_id', b.categoryId),
            Q.where('month', b.month),
            Q.where('type', 'expense'),
            Q.where('is_deleted', false)
          )
        ).fetch();

        const totalSpent = txns.reduce((sum, t) => sum + (t.amount || 0), 0) / 100;
        
        // Find category name
        const cat = localCats.find(c => c.remoteId === b.categoryId || c.id === b.categoryId);

        return {
          _id: b.id,
          remoteId: b.remoteId,
          categoryId: b.categoryId,
          categoryName: cat?.name || 'Unknown',
          monthlyLimit: b.limitRupees,
          totalSpent: totalSpent,
          month: b.month
        };
      }));

      // Filter for current month only (optional, but requested behavior for budget screen usually)
      setBudgets(budgetsWithSpent.filter(b => b.month === currentMonth));
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
    await syncManager.sync(true);
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

      await database.write(async () => {
        // Check if budget already exists for this category and month
        const existing = await database.get('budgets').query(
          Q.and(
            Q.where('category_id', selectedCategory.remoteId || selectedCategory.id),
            Q.where('month', month),
            Q.where('is_deleted', false)
          )
        ).fetch();

        if (existing.length > 0) {
          await existing[0].update(record => {
            record.monthlyLimit = Math.round(parseFloat(limitAmount) * 100);
            record.synced = false;
            record.updatedAt = Date.now();
          });
        } else {
          await database.get('budgets').create(record => {
            record.categoryId = selectedCategory.remoteId || selectedCategory.id;
            record.month = month;
            record.monthlyLimit = Math.round(parseFloat(limitAmount) * 100);
            record.synced = false;
            record.updatedAt = Date.now();
            record.isDeleted = false;
          });
        }
      });

      setIsModalVisible(false);
      setLimitAmount('');
      setSelectedCategory(null);
      fetchInitialData();
      
      // Trigger sync in background
      syncManager.sync().catch(console.error);
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
      
      await database.write(async () => {
        const record = await database.get('budgets').find(budgetToDelete._id);
        await record.update(r => {
          r.isDeleted = true;
          r.synced = false;
          r.updatedAt = Date.now();
        });
      });

      deleteSheetRef.current?.close();
      setBudgetToDelete(null);
      fetchInitialData();
      
      // Trigger sync in background
      syncManager.sync().catch(console.error);
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

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
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
      backgroundColor: theme.colors.elevation.level1,
      borderColor: theme.colors.outlineVariant,
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
      color: theme.colors.onSurfaceVariant,
    },
    summaryValue: {
      fontSize: 28,
      fontFamily: Fonts.bold,
      marginTop: 4,
      color: theme.colors.text,
    },
    targetIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.secondary + '1A', // 10% opacity
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
      color: theme.colors.onSurfaceVariant,
    },
    progressBar: {
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.outlineVariant,
    },
    sectionHeader: {
      marginTop: 32,
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    sectionTitle: {
      fontSize: 20,
      fontFamily: Fonts.bold,
      color: theme.colors.text,
    },
    sectionSubtitle: {
      fontSize: 14,
      fontFamily: Fonts.medium,
      marginTop: 2,
      color: theme.colors.onSurfaceVariant,
    },
    budgetCard: {
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      backgroundColor: theme.colors.elevation.level1,
      borderColor: theme.colors.outlineVariant,
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
      color: theme.colors.text,
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
      color: theme.colors.text,
    },
    limitValue: {
      fontSize: 14,
      fontFamily: Fonts.medium,
      color: theme.colors.onSurfaceVariant,
    },
    overText: {
      fontSize: 12,
      fontFamily: Fonts.bold,
      textTransform: 'uppercase',
      color: theme.colors.error,
    },
    cardProgress: {
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.outlineVariant,
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 20,
      borderRadius: 16,
      elevation: 4,
      backgroundColor: theme.colors.secondary,
    },
    deleteContent: {
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
      backgroundColor: theme.colors.error + '1A',
      justifyContent: 'center',
      alignItems: 'center',
    },
    deleteTitle: {
      fontSize: 20,
      fontFamily: Fonts.bold,
      color: theme.colors.text,
    },
    deleteMessage: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: Fonts.medium,
      marginBottom: 20,
      color: theme.colors.onSurfaceVariant,
    },
    deleteDetails: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 20,
      backgroundColor: theme.colors.surfaceVariant,
    },
    deleteAmount: {
      fontSize: 18,
      fontFamily: Fonts.bold,
      color: theme.colors.text,
    },
    deleteWarning: {
      fontSize: 14,
      fontFamily: Fonts.medium,
      marginBottom: 24,
      textAlign: 'center',
      color: theme.colors.error,
    },
    deleteActions: {
      flexDirection: 'row',
      gap: 12,
    },
    deleteCancelButton: {
      flex: 1,
      borderRadius: 12,
      borderColor: theme.colors.outline,
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
      color: theme.colors.onSurfaceVariant,
    },
    emptyButton: {
      marginTop: 24,
      backgroundColor: theme.colors.primary,
    },
    modalContainer: {
      padding: 24,
      margin: 20,
      borderRadius: 24,
      borderWidth: 1,
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.outlineVariant,
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: Fonts.bold,
      marginBottom: 24,
      color: theme.colors.text,
    },
    categoryPicker: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 16,
      backgroundColor: theme.colors.elevation.level1,
      borderColor: theme.colors.outline,
    },
    pickerText: {
      fontSize: 16,
      fontFamily: Fonts.medium,
      color: theme.colors.text,
    },
    input: {
      marginBottom: 24,
      backgroundColor: theme.colors.elevation.level1,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
    },
  }), [theme]);

  return (
    <SafeAreaView
      edges={['top']}
      style={styles.container}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <GlobalHeader
        title="Budgets"
        titleColor={theme.colors.text}
        backgroundColor="transparent"
        showLeftIcon
        leftIconName="arrow-left"
        leftIconColor={theme.colors.text}
        onLeftIconPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.summaryLabel}>
                Total Monthly Budget
              </Text>
              <Text style={styles.summaryValue}>
                ₹{totals.totalBudget.toLocaleString()}
              </Text>
            </View>
            <View style={styles.targetIcon}>
              <Target size={24} color={theme.colors.secondary} />
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>
                Spent: ₹{totals.totalSpent.toLocaleString()}
              </Text>
              <Text style={styles.progressText}>
                {Math.round(totals.percentage * 100)}%
              </Text>
            </View>
            <ProgressBar
              progress={Math.min(totals.percentage, 1)}
              color={totals.percentage > 0.9 ? theme.colors.error : theme.colors.secondary}
              style={styles.progressBar}
            />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Category Budgets
          </Text>
          <Text style={styles.sectionSubtitle}>
            Monthly limits per category
          </Text>
        </View>

        {loading && !refreshing ? (
          <BudgetSkeleton />
        ) : budgets.length === 0 ? (
          <View style={styles.emptyState}>
            <Layout size={48} color={theme.colors.outline} />
            <Text style={styles.emptyText}>
              No budgets set for this month
            </Text>
            <Button
              mode="contained"
              onPress={() => setIsModalVisible(true)}
              style={styles.emptyButton}
              labelStyle={{ fontFamily: Fonts.bold, color: theme.colors.onPrimary }}
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
                style={styles.budgetCard}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.categoryName}>
                    {budget.categoryName}
                  </Text>
                  <TouchableOpacity onPress={() => handleDeleteBudget(budget)}>
                    <Trash2 size={18} color={theme.colors.onSurfaceVariant} />
                  </TouchableOpacity>
                </View>

                <View style={styles.cardValues}>
                  <Text style={styles.spentValue}>
                    ₹{budget.totalSpent.toLocaleString()}
                    <Text style={styles.limitValue}>
                      {' '}
                      / ₹{budget.monthlyLimit.toLocaleString()}
                    </Text>
                  </Text>
                  {isOver && (
                    <Text style={styles.overText}>
                      Over Budget!
                    </Text>
                  )}
                </View>

                <ProgressBar
                  progress={Math.min(ratio, 1)}
                  color={
                    isOver
                      ? theme.colors.error
                      : isWarning
                        ? theme.colors.warning
                        : theme.colors.success
                  }
                  style={styles.cardProgress}
                />
              </View>
            );
          })
        )}

        {/* Delete Confirmation Sheet */}
        <BottomSheet
          ref={deleteSheetRef}
          title="Delete Budget"
          initialHeight={0.54}
          onClose={() => setBudgetToDelete(null)}
        >
          <View style={styles.deleteContent}>
            <View style={styles.deleteHeader}>
              <View style={styles.deleteIconContainer}>
                <AlertTriangle size={24} color={theme.colors.error} />
              </View>
              <Text style={styles.deleteTitle}>
                Confirm Deletion
              </Text>
            </View>

            <Text style={styles.deleteMessage}>
              Are you sure you want to delete the budget for "
              {budgetToDelete?.categoryName}"?
            </Text>

            <View style={styles.deleteDetails}>
              <Text style={styles.deleteAmount}>
                Limit: ₹{budgetToDelete?.monthlyLimit.toLocaleString()}
              </Text>
            </View>

            <Text style={styles.deleteWarning}>
              This action cannot be undone.
            </Text>

            <View style={styles.deleteActions}>
              <Button
                mode="outlined"
                onPress={() => deleteSheetRef.current?.close()}
                style={styles.deleteCancelButton}
                contentStyle={{ height: 48 }}
                textColor={theme.colors.onSurfaceVariant}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={confirmDeleteBudget}
                style={styles.deleteConfirmButton}
                contentStyle={{ height: 48 }}
                buttonColor={theme.colors.error}
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
        icon={({ size, color }) => <Plus size={size} color={theme.colors.onSecondary} />}
        style={styles.fab}
        onPress={() => setIsModalVisible(true)}
      />

      <Portal>
        <Modal
          visible={isModalVisible}
          onDismiss={() => setIsModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>
            Set Category Budget
          </Text>

          <TouchableOpacity
            style={styles.categoryPicker}
            onPress={() => categorySheetRef.current?.open()}
          >
            <Text
              style={[
                styles.pickerText,
                !selectedCategory && { color: theme.colors.outline },
              ]}
            >
              {selectedCategory ? selectedCategory.name : 'Select Category'}
            </Text>
            <ChevronRight size={20} color={theme.colors.onSurfaceVariant} />
          </TouchableOpacity>

          <TextInput
            label="Monthly Limit (₹)"
            value={limitAmount}
            onChangeText={setLimitAmount}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
            textColor={theme.colors.text}
          />

          <View style={styles.modalActions}>
            <Button
              onPress={() => setIsModalVisible(false)}
              textColor={theme.colors.onSurfaceVariant}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSaveBudget}
              loading={isSubmitting}
              disabled={isSubmitting || !selectedCategory || !limitAmount}
              style={{ flex: 1, backgroundColor: theme.colors.primary }}
              labelStyle={{ fontFamily: Fonts.bold, color: theme.colors.onPrimary }}
            >
              Save
            </Button>
          </View>
        </Modal>
      </Portal>

      <BottomSheet
        ref={categorySheetRef}
        title="Select Category"
        options={categories.map(c => ({ label: c.name, value: c.remoteId || c.id }))}
        selectedValue={selectedCategory?.remoteId || selectedCategory?.id}
        onSelect={val => {
          const cat = categories.find(c => (c.remoteId || c.id) === val);
          setSelectedCategory(cat);
        }}
        initialHeight={0.5}
      />
    </SafeAreaView>
  );
};

export default BudgetScreen;
