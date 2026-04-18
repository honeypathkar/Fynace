import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  ToastAndroid,
  KeyboardAvoidingView,
  StyleSheet,
} from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronDown } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import GlobalHeader from '../../components/GlobalHeader';
import TextInputField from '../../components/TextInputField';
import PrimaryButton from '../../components/PrimaryButton';
import { MonthPicker, CategoryPicker } from '../../components/expenses';
import { apiClient, parseApiError } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import { themeAssets } from '../../theme';
import Fonts from '../../../assets/fonts';
import { database } from '../../database';
import { Q } from '@nozbe/watermelondb';
import { syncManager } from '../../sync/SyncManager';
import NetInfo from '@react-native-community/netinfo';

const defaultFormState = {
  month: '',
  itemName: '',
  category: '',
  categoryId: '',
  amount: '',
  notes: '',
  type: 'expense',
  isRecurring: false,
  frequency: 'monthly',
};

const AddExpenseScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = useAuth();
  const theme = useTheme();

  const editingExpense = route.params?.expense;
  const editingExpenseId = editingExpense?.id;

  const [formValues, setFormValues] = useState(defaultFormState);
  const [savingExpense, setSavingExpense] = useState(false);
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [categories, setCategories] = useState({
    default: [],
    custom: [],
    all: [],
  });
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Initialize form
  useEffect(() => {
    if (editingExpense) {
      setFormValues({
        month: editingExpense.month || '',
        itemName: editingExpense.itemName || '',
        category: editingExpense.category || '',
        categoryId: editingExpense.categoryId || '',
        amount: editingExpense.amountRupees
          ? editingExpense.amountRupees.toString()
          : editingExpense.amount
          ? (editingExpense.amount / 100).toString()
          : '',
        notes: editingExpense.notes || '',
        type: editingExpense.type || 'expense',
        isRecurring: editingExpense.isRecurring || false,
        frequency: editingExpense.frequency || 'monthly',
      });
    } else {
      // Auto-select current month for new expense
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      setFormValues(prev => ({ ...prev, month: `${year}-${month}` }));
    }
  }, [editingExpense]);

  const fetchCategories = useCallback(async () => {
    try {
      const localCategories = await database
        .get('categories')
        .query(Q.where('is_deleted', false))
        .fetch();
      setCategories({
        all: localCategories,
        default: [],
        custom: [],
      });
    } catch (err) {
      console.warn('Failed to fetch local categories');
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const transformMonthLabel = useCallback(month => {
    if (!month) return 'Select a month';
    const [year, monthIndex] = month.split('-');
    const date = new Date(Number(year), Number(monthIndex) - 1);
    return date.toLocaleDateString('default', {
      month: 'long',
      year: 'numeric',
    });
  }, []);

  const generateMonthOptions = useCallback(() => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    for (let i = 0; i <= 12; i++) {
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

  const updateFormValue = (key, value) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  };

  const createCategory = useCallback(
    async categoryName => {
      const trimmedName = categoryName.trim();
      if (!trimmedName || creatingCategory) return;
      
      try {
        setCreatingCategory(true);
        
        // Check if category already exists
        const existing = await database
          .get('categories')
          .query(Q.where('name', trimmedName), Q.where('is_deleted', false))
          .fetch();
          
        if (existing.length > 0) {
          const existingCat = existing[0];
          updateFormValue('category', existingCat.name);
          updateFormValue('categoryId', existingCat.id);
          return true;
        }

        await database.write(async () => {
          const newCategory = await database.get('categories').create(record => {
            record.name = trimmedName;
            record.type = 'expense';
            record.synced = false;
            record.updatedAt = Date.now();
            record.isDeleted = false;
          });
          
          // Auto-select the newly created category
          updateFormValue('category', newCategory.name);
          updateFormValue('categoryId', newCategory.id);
        });

        await fetchCategories();
        setNewCategoryName('');
        setShowAddCategory(false);

        // Background sync
        syncManager.sync().catch(console.error);
        return true;
      } catch (err) {
        console.error('Failed to create category', err);
        return false;
      } finally {
        setCreatingCategory(false);
      }
    },
    [fetchCategories, creatingCategory],
  );

  const handleSave = async () => {
    try {
      setSavingExpense(true);

      if (!formValues.month) {
        if (Platform.OS === 'android')
          ToastAndroid.show('Please select a month', ToastAndroid.LONG);
        return;
      }

      if (!formValues.itemName) {
        if (Platform.OS === 'android')
          ToastAndroid.show('Item name is required', ToastAndroid.LONG);
        return;
      }

      const networkState = await NetInfo.fetch();
      const isOnline =
        networkState.isConnected && networkState.isInternetReachable;

      // ─── Step 1: Save to local WatermelonDB first ───────────────────
      let localRecord;
      await database.write(async () => {
        if (editingExpenseId) {
          const expense = await database
            .get('transactions')
            .find(editingExpenseId);
          await expense.update(record => {
            record.month = formValues.month;
            record.name = formValues.itemName;
            record.category = formValues.category;
            record.categoryId = formValues.categoryId;
            record.amount = (Number(formValues.amount) || 0) * 100;
            record.note = formValues.notes;
            record.type = formValues.type;
            record.isRecurring = formValues.isRecurring;
            record.frequency = formValues.isRecurring
              ? formValues.frequency
              : null;
            record.isActive = true;
            record.synced = false; // will be marked true after API call if online
            record.updatedAt = Date.now();
          });
          localRecord = await database
            .get('transactions')
            .find(editingExpenseId);
        } else {
          localRecord = await database.get('transactions').create(record => {
            record.month = formValues.month;
            record.name = formValues.itemName;
            record.category = formValues.category;
            record.categoryId = formValues.categoryId;
            record.amount = (Number(formValues.amount) || 0) * 100;
            record.note = formValues.notes;
            record.type = formValues.type;
            record.isRecurring = formValues.isRecurring;
            record.frequency = formValues.isRecurring
              ? formValues.frequency
              : null;
            record.isActive = true;
            record.date = new Date().getTime();
            record.synced = false;
            record.updatedAt = Date.now();
            record.isDeleted = false;
          });
        }
      });

      // ─── Step 2: If online, immediately sync with backend ────────────
      let syncedToBackend = false;
      if (isOnline && localRecord) {
        try {
          const payload = {
            type: formValues.type,
            name: formValues.itemName,
            amount: Number(formValues.amount) || 0, // in Rupees
            categoryId: formValues.categoryId,
            note: formValues.notes,
            date: localRecord.date || Date.now(),
            isRecurring: formValues.isRecurring,
            frequency: formValues.isRecurring ? formValues.frequency : null,
            isActive: true,
            watermelonId: localRecord.id,
          };

          let remoteId = localRecord.remoteId;

          if (editingExpenseId && remoteId) {
            await apiClient.put(`transactions/${remoteId}`, payload);
          } else {
            const response = await apiClient.post('transactions', payload);
            remoteId = response.data?.data?._id;
          }

          // Mark as synced and store remoteId
          await database.write(async () => {
            await localRecord.update(record => {
              record.synced = true;
              if (remoteId) record.remoteId = remoteId;
            });
          });
          syncedToBackend = true;
        } catch (apiErr) {
          // Network call failed — record is saved locally, sync will retry later
          console.warn(
            'Direct API sync failed, will retry via background sync:',
            apiErr.message,
          );
        }
      }

      if (Platform.OS === 'android') {
        ToastAndroid.show(
          syncedToBackend
            ? editingExpenseId
              ? 'Expense updated ✓'
              : 'Expense added ✓'
            : editingExpenseId
            ? 'Updated locally, will sync soon'
            : 'Saved locally, will sync soon',
          ToastAndroid.SHORT,
        );
      }

      navigation.goBack();

      // If not synced yet, trigger background sync
      if (!syncedToBackend) {
        syncManager.sync(true).catch(console.error);
      }
    } catch (err) {
      if (Platform.OS === 'android') {
        ToastAndroid.show(err.message || 'Failed to save', ToastAndroid.LONG);
      }
    } finally {
      setSavingExpense(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {editingExpenseId ? 'Edit Expense' : 'Add Expense'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Month</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setMonthPickerVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.pickerText}>
                {transformMonthLabel(formValues.month)}
              </Text>
              <ChevronDown size={20} color="#808080" />
            </TouchableOpacity>
          </View>

          <TextInputField
            label="Item Name"
            value={formValues.itemName}
            onChangeText={value => updateFormValue('itemName', value)}
            placeholder="Enter item name"
          />

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Category (Optional)</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setCategoryPickerVisible(true)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pickerText,
                  !formValues.category && styles.pickerPlaceholder,
                ]}
              >
                {formValues.category || 'Select a category'}
              </Text>
              <ChevronDown size={20} color="#808080" />
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
            numberOfLines={4}
          />

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Transaction Type</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {['expense', 'income'].map(t => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.pickerButton,
                    { flex: 1, justifyContent: 'center' },
                    formValues.type === t && {
                      borderColor: '#d3d3ff',
                      backgroundColor: 'rgba(58, 111, 248, 0.1)',
                    },
                  ]}
                  onPress={() => updateFormValue('type', t)}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      { textTransform: 'capitalize' },
                      formValues.type === t && { color: '#d3d3ff' },
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View
            style={[
              styles.inputWrapper,
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              },
            ]}
          >
            <View>
              <Text style={styles.inputLabel}>Is Recurring?</Text>
              <Text style={{ color: '#808080', fontSize: 12 }}>
                Automatically repeat this transaction
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                updateFormValue('isRecurring', !formValues.isRecurring)
              }
              style={{
                width: 50,
                height: 26,
                borderRadius: 13,
                backgroundColor: formValues.isRecurring ? '#d3d3ff' : '#1A1A1A',
                justifyContent: 'center',
                paddingHorizontal: 2,
              }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: '#FFF',
                  alignSelf: formValues.isRecurring ? 'flex-end' : 'flex-start',
                }}
              />
            </TouchableOpacity>
          </View>

          {formValues.isRecurring && (
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Frequency</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {['daily', 'weekly', 'monthly', 'yearly'].map(f => (
                  <TouchableOpacity
                    key={f}
                    style={[
                      styles.pickerButton,
                      { paddingVertical: 8, paddingHorizontal: 12 },
                      formValues.frequency === f && {
                        borderColor: '#d3d3ff',
                        backgroundColor: 'rgba(58, 111, 248, 0.1)',
                      },
                    ]}
                    onPress={() => updateFormValue('frequency', f)}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        { fontSize: 14, textTransform: 'capitalize' },
                        formValues.frequency === f && { color: '#d3d3ff' },
                      ]}
                    >
                      {f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            title={editingExpenseId ? 'Update Expense' : 'Save Expense'}
            onPress={handleSave}
            loading={savingExpense}
            buttonColor="#d3d3ff"
          />
        </View>
      </KeyboardAvoidingView>

      <MonthPicker
        visible={monthPickerVisible}
        monthOptions={monthOptions}
        selectedMonth={formValues.month}
        onSelectMonth={month => {
          updateFormValue('month', month);
          setMonthPickerVisible(false);
        }}
        onClose={() => setMonthPickerVisible(false)}
      />

      <CategoryPicker
        visible={categoryPickerVisible}
        categories={categories.all}
        selectedCategory={formValues.category}
        onSelectCategory={category => {
          updateFormValue('category', category.name);
          updateFormValue('categoryId', category.remoteId || '');
          setCategoryPickerVisible(false);
        }}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: Fonts.semibold,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#808080',
    fontSize: 14,
    fontFamily: Fonts.semibold,
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#121212',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  pickerText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  pickerPlaceholder: {
    color: '#808080',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: '#000000',
  },
});

export default AddExpenseScreen;
