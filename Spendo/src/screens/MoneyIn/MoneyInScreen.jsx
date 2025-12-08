import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Platform,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import GlobalHeader from '../../components/GlobalHeader';
import { useAuth } from '../../hooks/useAuth';
import { apiClient, parseApiError } from '../../api/client';
import PrimaryButton from '../../components/PrimaryButton';
import BottomSheet from '../../components/BottomSheet';
import { Plus } from 'lucide-react-native';
import {
  MoneyInHistoryCard,
  EmptyState,
  MoneyInForm,
  moneyInStyles,
} from '../../components/money-in';

const MoneyInScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [moneyInHistory, setMoneyInHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [formVisible, setFormVisible] = useState(false);
  const [formValues, setFormValues] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const bottomSheetRef = React.useRef(null);

  const fetchMoneyInHistory = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [historyResponse, totalResponse] = await Promise.all([
        apiClient.get('/money-in/history'),
        apiClient.get('/money-in/total'),
      ]);
      setMoneyInHistory(historyResponse.data?.data || []);
      setTotal(totalResponse.data?.data?.total || 0);
    } catch (err) {
      const apiError = parseApiError(err);
      if (Platform.OS === 'android') {
        ToastAndroid.show(apiError.message || 'Failed to fetch money in history', ToastAndroid.LONG);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchMoneyInHistory();
    }, [fetchMoneyInHistory])
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openForm = () => {
    setFormValues({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    bottomSheetRef.current?.open();
  };

  const closeForm = () => {
    bottomSheetRef.current?.close();
  };

  const handleAddMoneyIn = async () => {
    try {
      if (!formValues.amount || Number(formValues.amount) <= 0) {
        if (Platform.OS === 'android') {
          ToastAndroid.show('Please enter a valid amount', ToastAndroid.LONG);
        }
        return;
      }

      setSaving(true);
      await apiClient.post('/money-in', {
        amount: Number(formValues.amount),
        date: formValues.date,
        notes: formValues.notes,
      });
      closeForm();
      await fetchMoneyInHistory();
    } catch (err) {
      const apiError = parseApiError(err);
      if (Platform.OS === 'android') {
        ToastAndroid.show(apiError.message || 'Failed to add money in', ToastAndroid.LONG);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    // Delete entry directly with toast confirmation
    try {
      await apiClient.delete(`/money-in/${id}`);
      await fetchMoneyInHistory();
      if (Platform.OS === 'android') {
        ToastAndroid.show('Entry deleted successfully', ToastAndroid.SHORT);
      }
    } catch (err) {
      const apiError = parseApiError(err);
      if (Platform.OS === 'android') {
        ToastAndroid.show(apiError.message || 'Failed to delete entry', ToastAndroid.LONG);
      }
    }
  };

  if (!token) {
    return (
      <SafeAreaView edges={['top']} style={moneyInStyles.container}>
        <GlobalHeader
          title="Money In"
          subtitle="Log in to track your income"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={moneyInStyles.container}>
      <StatusBar backgroundColor="#0F172A" barStyle="light-content" />
      <GlobalHeader
        title="Money In History"
        subtitle={`Total: ₹${total.toLocaleString()}`}
        backgroundColor="transparent"
        titleColor="#F8FAFC"
        subtitleColor="#94A3B8"
        showLeftIcon={true}
        leftIconName="ArrowLeft"
        onLeftIconPress={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity
            style={moneyInStyles.addButton}
            onPress={openForm}
            activeOpacity={0.7}
          >
            <Plus size={20} color="#3A6FF8" />
            <Text style={moneyInStyles.addButtonText}>Add</Text>
          </TouchableOpacity>
        }
      />

      {loading && !moneyInHistory.length ? (
        <View style={moneyInStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#3A6FF8" />
        </View>
      ) : (
        <FlatList
          data={moneyInHistory}
          keyExtractor={(item) => item._id}
          contentContainerStyle={moneyInStyles.listContent}
          renderItem={({ item }) => (
            <MoneyInHistoryCard
              item={item}
              onDelete={handleDelete}
              formatDate={formatDate}
              formatTime={formatTime}
            />
          )}
          ListEmptyComponent={<EmptyState />}
        />
      )}

      <BottomSheet
        ref={bottomSheetRef}
        title="Add Money In"
        onClose={() =>
          setFormValues({
            amount: '',
            date: new Date().toISOString().split('T')[0],
            notes: '',
          })
        }
        footer={
          <View style={moneyInStyles.formActions}>
            <Button
              mode="outlined"
              onPress={closeForm}
              textColor="#94A3B8"
              style={moneyInStyles.formButton}
            >
              Cancel
            </Button>
            <PrimaryButton
              title="Save"
              onPress={handleAddMoneyIn}
              loading={saving}
              style={moneyInStyles.formButton}
              buttonColor="#3A6FF8"
            />
          </View>
        }
      >
        <MoneyInForm
          formValues={formValues}
          onFormValueChange={setFormValues}
          onSave={handleAddMoneyIn}
          onCancel={closeForm}
          saving={saving}
        />
      </BottomSheet>
    </SafeAreaView>
  );
};

export default MoneyInScreen;

