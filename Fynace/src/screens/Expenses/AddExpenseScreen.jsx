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

const defaultFormState = {
  month: '',
  itemName: '',
  category: '',
  amount: '',
  notes: '',
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
        amount: editingExpense.amount?.toString() || '',
        notes: editingExpense.notes || '',
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
        all: localCategories.map(c => c.name),
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
      if (!categoryName.trim() || creatingCategory) return;
      try {
        setCreatingCategory(true);
        await database.write(async () => {
          await database.get('categories').create(record => {
            record.name = categoryName.trim();
            record.type = 'expense';
            record.synced = false;
            record.updatedAt = Date.now();
            record.isDeleted = false;
          });
        });
        await fetchCategories();
        setNewCategoryName('');
        setShowAddCategory(false);

        // Background sync
        syncManager.sync().catch(console.error);
      } catch (err) {
        if (Platform.OS === 'android') {
          ToastAndroid.show(
            'Failed to create local category',
            ToastAndroid.LONG,
          );
        }
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

      await database.write(async () => {
        if (editingExpenseId) {
          const expense = await database.get('expenses').find(editingExpenseId);
          await expense.update(record => {
            record.month = formValues.month;
            record.itemName = formValues.itemName;
            record.category = formValues.category || '';
            record.amount = Number(formValues.amount) || 0;
            record.notes = formValues.notes;
            record.synced = false;
            record.updatedAt = Date.now();
          });
        } else {
          await database.get('expenses').create(record => {
            record.month = formValues.month;
            record.itemName = formValues.itemName;
            record.category = formValues.category || '';
            record.amount = Number(formValues.amount) || 0;
            record.notes = formValues.notes;
            record.date = new Date().toISOString();
            record.synced = false;
            record.updatedAt = Date.now();
            record.isDeleted = false;
          });
        }
      });

      if (Platform.OS === 'android') {
        ToastAndroid.show(
          editingExpenseId
            ? 'Expense updated locally'
            : 'Expense added locally',
          ToastAndroid.SHORT,
        );
      }

      navigation.goBack();

      // Proactively trigger sync in background
      syncManager.sync().catch(console.error);
    } catch (err) {
      if (Platform.OS === 'android') {
        ToastAndroid.show(
          err.message || 'Failed to save locally',
          ToastAndroid.LONG,
        );
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
            <ChevronLeft size={28} color="#F8FAFC" />
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
              <ChevronDown size={20} color="#94A3B8" />
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
            numberOfLines={4}
          />
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            title={editingExpenseId ? 'Update Expense' : 'Save Expense'}
            onPress={handleSave}
            loading={savingExpense}
            buttonColor="#3A6FF8"
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
          updateFormValue('category', category);
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
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: '#F8FAFC',
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
    color: '#94A3B8',
    fontSize: 14,
    fontFamily: Fonts.semibold,
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  pickerText: {
    color: '#F8FAFC',
    fontSize: 16,
  },
  pickerPlaceholder: {
    color: '#94A3B8',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: '#0F172A',
  },
});

export default AddExpenseScreen;
