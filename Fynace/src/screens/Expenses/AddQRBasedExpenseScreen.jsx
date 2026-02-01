import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  ToastAndroid,
  KeyboardAvoidingView,
  Linking,
  Alert,
} from 'react-native';
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
import { apiClient, parseApiError } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import Fonts from '../../../assets/fonts';

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
    allParams: initialValues?.allParams || {}, // Store original parameters
  });

  const [saving, setSaving] = useState(false);

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
      baseParams.am = String(formValues.amount); // MUST be string
      baseParams.cu = 'INR';

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
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

      const upiUrl = `upi://pay?${upiQuery}`;

      console.log('🚀 Generated UPI URL:', upiUrl);
      console.log('📦 Final Params:', baseParams);

      try {
        await Linking.openURL(upiUrl);

        Alert.alert('Payment Initiated', 'Did you complete the payment?', [
          { text: 'No', style: 'cancel' },
          { text: 'Yes', onPress: () => saveExpense() },
        ]);
      } catch (err) {
        console.error('UPI Open Error:', err);

        Alert.alert(
          'UPI Error',
          'Unable to open UPI app. Please check if a UPI app is installed.',
        );
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
        month: formValues.month,
        itemName: formValues.itemName,
        category: 'Shopping', // Default category for QR
        amount: Number(formValues.amount),
        notes: formValues.notes,
      };

      await apiClient.post('/expenses', payload);

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
            <ChevronLeft size={28} color="#F8FAFC" />
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
                <CheckCircle2 size={20} color="#22C55E" />
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
            leftIcon={
              formValues.upiId ? (
                <Send size={20} color="#FFF" />
              ) : (
                <CreditCard size={20} color="#FFF" />
              )
            }
          />
        </View>
      </KeyboardAvoidingView>
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
    paddingTop: 10,
  },
  infoCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    marginBottom: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  qrInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  qrInfoText: {
    color: '#22C55E',
    fontFamily: Fonts.semibold,
    fontSize: 14,
  },
  upiText: {
    color: '#94A3B8',
    fontSize: 12,
    fontFamily: Fonts.medium,
    marginLeft: 28,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
});

export default AddQRBasedExpenseScreen;
