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
  const [lastCreatedAt, setLastCreatedAt] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const lastCreatedAtRef = React.useRef(null);
  const hasMoreRef = React.useRef(true);
  const loadingMoreRef = React.useRef(false);
  const [formVisible, setFormVisible] = useState(false);
  const [formValues, setFormValues] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const bottomSheetRef = React.useRef(null);

  const fetchMoneyInHistory = useCallback(
    async (lastCreated = null, append = false) => {
      if (!token) return;
      try {
        if (!lastCreated) {
          setLoading(true);
          loadingMoreRef.current = false;
        } else {
          setLoadingMore(true);
          loadingMoreRef.current = true;
        }

        const params = { limit: 20 };
        if (lastCreated) {
          params.lastCreatedAt = lastCreated;
        }

        const [historyResponse, totalResponse] = await Promise.all([
          apiClient.get('/money-in/history', { params }),
          !lastCreated
            ? apiClient.get('/money-in/total')
            : Promise.resolve(null),
        ]);

        const newEntries = historyResponse.data?.data || [];
        const backendHasMore = historyResponse.data?.hasMore;
        const hasMoreData =
          backendHasMore !== undefined
            ? backendHasMore
            : newEntries.length >= 20;

        if (append) {
          setMoneyInHistory(prev => [...prev, ...newEntries]);
        } else {
          setMoneyInHistory(newEntries);
        }

        if (totalResponse) {
          setTotal(totalResponse.data?.data?.total || 0);
        }

        const newLastCreatedAt =
          newEntries.length > 0
            ? newEntries[newEntries.length - 1].createdAt
            : null;
        setLastCreatedAt(newLastCreatedAt);
        lastCreatedAtRef.current = newLastCreatedAt;
        setHasMore(hasMoreData);
        hasMoreRef.current = hasMoreData;
      } catch (err) {
        const apiError = parseApiError(err);
        if (Platform.OS === 'android') {
          ToastAndroid.show(
            apiError.message || 'Failed to fetch money in history',
            ToastAndroid.LONG,
          );
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        loadingMoreRef.current = false;
      }
    },
    [token],
  );

  const loadMore = useCallback(() => {
    if (!loadingMoreRef.current && hasMoreRef.current && !loading) {
      fetchMoneyInHistory(lastCreatedAtRef.current, true);
    }
  }, [loading, fetchMoneyInHistory]);

  useFocusEffect(
    useCallback(() => {
      fetchMoneyInHistory();
    }, [fetchMoneyInHistory]),
  );

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = dateString => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
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
      let finalDate = formValues.date;
      const todayStr = new Date().toISOString().split('T')[0];

      // If user picks today, send full ISO string to preserve the "true" recording time
      if (finalDate === todayStr) {
        finalDate = new Date().toISOString();
      }

      await apiClient.post('/money-in', {
        amount: Number(formValues.amount),
        date: finalDate,
        notes: formValues.notes,
      });
      closeForm();
      await fetchMoneyInHistory();
    } catch (err) {
      const apiError = parseApiError(err);
      if (Platform.OS === 'android') {
        ToastAndroid.show(
          apiError.message || 'Failed to add money in',
          ToastAndroid.LONG,
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async id => {
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
        ToastAndroid.show(
          apiError.message || 'Failed to delete entry',
          ToastAndroid.LONG,
        );
      }
    }
  };

  if (!token) {
    return (
      <SafeAreaView edges={['top']} style={moneyInStyles.container}>
        <GlobalHeader title="Money In" subtitle="Log in to track your income" />
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
          keyExtractor={item => item._id}
          contentContainerStyle={moneyInStyles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          renderItem={({ item }) => (
            <MoneyInHistoryCard
              item={item}
              onDelete={handleDelete}
              formatDate={formatDate}
              formatTime={formatTime}
            />
          )}
          ListEmptyComponent={<EmptyState />}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ padding: 20 }}>
                <ActivityIndicator size="small" color="#3A6FF8" />
              </View>
            ) : null
          }
        />
      )}

      <BottomSheet
        ref={bottomSheetRef}
        title="Add Money In"
        initialHeight={0.7}
        onClose={() =>
          setFormValues({
            amount: '',
            date: new Date().toISOString().split('T')[0],
            notes: '',
          })
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
