import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  ToastAndroid,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import IntentLauncher from 'react-native-intent-launcher';
import { Text, Button, useTheme, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  CreditCard,
  Send,
  CheckCircle2,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import GlobalHeader from '../../components/GlobalHeader';
import TextInputField from '../../components/TextInputField';
import PrimaryButton from '../../components/PrimaryButton';
import { CategoryPicker } from '../../components/expenses';
import { apiClient, parseApiError } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import Fonts from '../../../assets/fonts';
import { database } from '../../database';
import { Q } from '@nozbe/watermelondb';
import { syncManager } from '../../sync/SyncManager';

const AddQRBasedExpenseScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = useAuth();
  const theme = useTheme();

  const { initialValues } = route.params || {};

  const [formValues, setFormValues] = useState({
    itemName: initialValues?.name || '',
    amount: initialValues?.price || '',
    notes: initialValues?.notes || '',
    upiId: initialValues?.upiId || '',
    month: '',
    category: '',
    categoryId: '',
    allParams: initialValues?.allParams || {}, // Store original parameters
  });

  const [saving, setSaving] = useState(false);
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [categories, setCategories] = useState({
    default: [],
    custom: [],
    all: [],
  });
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  useEffect(() => {
    // Auto-select current month
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    setFormValues(prev => ({ ...prev, month: `${year}-${month}` }));
  }, []);

  const updateFormValue = (key, value) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  };

  const fetchCategories = React.useCallback(async () => {
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

  const createCategory = React.useCallback(
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

  const handlePayAndSave = async () => {
    if (!formValues.amount || !formValues.itemName) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Please enter name and amount', ToastAndroid.SHORT);
      }
      return;
    }

    if (formValues.upiId) {
      // ✅ UPI-safe parameter whitelist
      const allowedParams = [
        'pa', // payee VPA
        'pn', // payee name
        'am', // amount
        'cu', // currency
        'tr', // transaction ref
        'tn', // transaction note
        'mc', // merchant code (optional)
        'tid', // txn id (optional)
      ];

      const baseParams = {};

      // Copy only allowed params from scanned QR
      allowedParams.forEach(key => {
        if (formValues.allParams?.[key]) {
          baseParams[key] = formValues.allParams[key];
        }
      });

      // 🔒 Force correct values
      baseParams.pa = formValues.upiId;
      baseParams.pn = formValues.itemName.trim();
      baseParams.am = parseFloat(formValues.amount).toFixed(2); // Ensure 1.00 format
      baseParams.cu = 'INR';
      baseParams.mode = '02'; // Secure/Standard mode
      baseParams.orgid = ''; // Leave empty if not a merchant

      // ✅ Ensure required fields
      if (!baseParams.tr) {
        baseParams.tr = `TXN${Date.now()}`;
      }

      if (!baseParams.tn) {
        baseParams.tn = `Payment for ${formValues.itemName}`;
      }

      // 🚀 Build final UPI URL
      const upiQuery = Object.entries(baseParams)
        .filter(([_, value]) => value !== undefined && value !== '')
        .map(
          ([key, value]) =>
            `${key}=${encodeURIComponent(value).replace(/%20/g, '+')}`,
        )
        .join('&');

      const upiUrl = `upi://pay?${upiQuery}`;

      console.log('🚀 Generated UPI URL:', upiUrl);
      console.log('📦 Final Params:', baseParams);

      try {
        // Use Android Intent to show the native UPI app chooser
        await IntentLauncher.startActivity({
          action: 'android.intent.action.VIEW',
          data: upiUrl,
          // No packageName = Android shows the full UPI app chooser
        });

        Alert.alert('Payment Initiated', 'Did you complete the payment?', [
          { text: 'No', style: 'cancel' },
          { text: 'Yes', onPress: () => saveExpense() },
        ]);
      } catch (err) {
        console.error('UPI Intent Error:', err);

        if (err?.code === 'ACTIVITY_NOT_FOUND') {
          Alert.alert(
            'No UPI App Found',
            'Please install GPay, PhonePe, Paytm, or any UPI app and try again.',
          );
        } else {
          Alert.alert(
            'UPI Error',
            'An unexpected error occurred while trying to open the payment app.',
          );
        }
      }
    } else {
      // Manual entry fallback
      saveExpense();
    }
  };

  const saveExpense = async () => {
    try {
      setSaving(true);
      const payload = {
        type: 'expense',
        name: formValues.itemName.trim(),
        amount: Number(formValues.amount),
        category: formValues.category || '',
        categoryId: formValues.categoryId || '',
        note: formValues.notes || '',
        date: new Date().toISOString(),
        // UPI / QR metadata
        upiIntent: Boolean(formValues.upiId),
        merchantName: formValues.itemName.trim(),
        upiId: formValues.upiId || '',
        qrData: formValues.allParams
          ? `upi://pay?${Object.entries(formValues.allParams)
              .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
              .join('&')}`
          : '',
      };

      await apiClient.post('transactions', payload);

      if (Platform.OS === 'android') {
        ToastAndroid.show('Expense logged successfully', ToastAndroid.SHORT);
      }

      navigation.navigate('Home');
    } catch (err) {
      const apiError = parseApiError(err);
      if (Platform.OS === 'android') {
        ToastAndroid.show(apiError.message, ToastAndroid.LONG);
      }
    } finally {
      setSaving(false);
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    headerTitle: {
      color: theme.colors.text,
      fontSize: 20,
      fontFamily: Fonts.semibold,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 10,
    },
    infoCard: {
      backgroundColor: theme.colors.secondaryContainer,
      marginBottom: 24,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    qrInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    qrInfoText: {
      color: theme.colors.success,
      fontFamily: Fonts.semibold,
      fontSize: 14,
    },
    upiText: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 12,
      fontFamily: Fonts.medium,
      marginLeft: 28,
    },
    footer: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.background,
    },
    inputWrapper: {
      marginBottom: 16,
    },
    inputLabel: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 14,
      fontFamily: Fonts.semibold,
      marginBottom: 8,
    },
    pickerButton: {
      backgroundColor: theme.colors.elevation.level1,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      paddingVertical: 14,
      paddingHorizontal: 16,
      minHeight: 48,
    },
    pickerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    pickerText: {
      color: theme.colors.text,
      fontSize: 16,
    },
    pickerPlaceholder: {
      color: theme.colors.onSurfaceVariant,
    },
  }), [theme]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={28} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Expense Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <Card style={styles.infoCard}>
            <Card.Content>
              <View style={styles.qrInfoRow}>
                <CheckCircle2 size={20} color={theme.colors.success} />
                <Text style={styles.qrInfoText}>QR Scanned Successfully</Text>
              </View>
              {formValues.upiId ? (
                <Text style={styles.upiText}>UPI ID: {formValues.upiId}</Text>
              ) : null}
            </Card.Content>
          </Card>

          <TextInputField
            label="Merchant Name / Item"
            value={formValues.itemName}
            onChangeText={val => updateFormValue('itemName', val)}
            placeholder="Scanned Name"
          />

          <TextInputField
            label="Amount (₹)"
            value={formValues.amount}
            keyboardType="numeric"
            onChangeText={val => updateFormValue('amount', val)}
            placeholder="0.00"
          />

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Category (Optional)</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setCategoryPickerVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.pickerContent}>
                <Text
                  style={[
                    styles.pickerText,
                    !formValues.category && styles.pickerPlaceholder,
                  ]}
                >
                  {formValues.category || 'Select a category'}
                </Text>
                <View style={{ transform: [{ rotate: '0deg' }] }}>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>▼</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <TextInputField
            label="Notes"
            value={formValues.notes}
            onChangeText={val => updateFormValue('notes', val)}
            placeholder="Add notes..."
            multiline
            numberOfLines={3}
          />
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            title={formValues.upiId ? 'Pay & Record' : 'Record Expense'}
            onPress={handlePayAndSave}
            loading={saving}
            buttonColor={theme.colors.secondary}
            textColor={theme.colors.onSecondary}
            leftIcon={
              formValues.upiId ? (
                <Send size={20} color={theme.colors.onSecondary} />
              ) : (
                <CreditCard size={20} color={theme.colors.onSecondary} />
              )
            }
          />
        </View>
      </KeyboardAvoidingView>

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

export default AddQRBasedExpenseScreen;
