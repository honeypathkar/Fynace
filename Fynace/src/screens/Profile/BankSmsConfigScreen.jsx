import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Platform,
  ToastAndroid,
  FlatList,
} from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plus, Trash2, Building2, AlertTriangle, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import GlobalHeader from '../../components/GlobalHeader';
import BottomSheet from '../../components/BottomSheet';
import { useAuth } from '../../hooks/useAuth';
import { apiClient } from '../../api/client';
import Fonts from '../../../assets/fonts';

const FALLBACK_BANKS = [
  {
    name: 'State Bank of India',
    ids: ['SBIINB', 'SBIPSG', 'SBISMS'],
    id: 'f_sbi',
  },
  { name: 'Punjab National Bank', ids: ['PNBSMS', 'PNBOTP'], id: 'f_pnb' },
  { name: 'Bank of Baroda', ids: ['BOBSMS', 'BOBOTP'], id: 'f_bob' },
  { name: 'HDFC Bank', ids: ['HDFCBK', 'HDFCSM'], id: 'f_hdfc' },
  { name: 'ICICI Bank', ids: ['ICICIB', 'ICICIS'], id: 'f_icici' },
  { name: 'Axis Bank', ids: ['AXISBK'], id: 'f_axis' },
  { name: 'Kotak Mahindra Bank', ids: ['KOTAKB'], id: 'f_kotak' },
  { name: 'Airtel Payments Bank', ids: ['AIRBNK'], id: 'f_airtel' },
  { name: 'Paytm Payments Bank', ids: ['PAYTMB'], id: 'f_paytm' },
];

const BankSmsConfigScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [availableBanks, setAvailableBanks] = useState([]);
  const [selectedBanks, setSelectedBanks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bankToDelete, setBankToDelete] = useState(null);

  const bottomSheetRef = useRef(null);
  const deleteSheetRef = useRef(null);
  const STORAGE_KEY = `@bank_sms_config_${user?._id || user?.id || 'guest'}`;

  useEffect(() => {
    fetchBanks();
    loadConfig();
  }, [user]);

  const fetchBanks = async () => {
    try {
      const response = await apiClient.get('/banks');
      if (response.data && response.data.length > 0) {
        setAvailableBanks(response.data);
      } else {
        setAvailableBanks(FALLBACK_BANKS);
      }
    } catch (err) {
      console.warn('Using fallback banks list due to API error');
      setAvailableBanks(FALLBACK_BANKS);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSelectedBanks(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load bank config', err);
    }
  };

  const saveConfig = async config => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (err) {
      console.error('Failed to save bank config', err);
    }
  };

  const handleAddBank = bankId => {
    const bank = availableBanks.find(b => b._id === bankId || b.id === bankId);
    if (!bank) return;

    // Check if already added
    if (selectedBanks.some(b => b.name === bank.name)) {
      if (Platform.OS === 'android') {
        ToastAndroid.show(
          'Bank already added to your list',
          ToastAndroid.SHORT,
        );
      }
      return;
    }

    const newConfig = [...selectedBanks, { name: bank.name, ids: bank.ids }];
    setSelectedBanks(newConfig);
    saveConfig(newConfig);
  };

  const confirmDelete = () => {
    if (!bankToDelete) return;
    const newConfig = selectedBanks.filter(b => b.name !== bankToDelete.name);
    setSelectedBanks(newConfig);
    saveConfig(newConfig);
    deleteSheetRef.current?.close();
    setBankToDelete(null);
  };

  const openDeleteSheet = bank => {
    setBankToDelete(bank);
    deleteSheetRef.current?.open();
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <GlobalHeader
        title="Bank SMS Config"
        titleColor="#F8FAFC"
        backgroundColor="transparent"
        showLeftIcon
        leftIconName="arrow-left"
        leftIconColor="#F8FAFC"
        onLeftIconPress={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Tracked Banks</Text>
            <Text style={styles.subtitle}>
              Manage banks for automatic tracking
            </Text>
          </View>
          <Pressable
            style={styles.addButton}
            onPress={() => bottomSheetRef.current?.open()}
          >
            <Plus size={20} color="#FFFFFF" strokeWidth={3} />
          </Pressable>
        </View>

        {selectedBanks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Building2 size={48} color="#64748B" />
            </View>
            <Text style={styles.emptyText}>No banks added yet</Text>
            <Text style={styles.emptySubtext}>
              Add your bank to start tracking expenses from SMS alerts
              automatically.
            </Text>
            <Pressable
              style={styles.emptyAddButton}
              onPress={() => bottomSheetRef.current?.open()}
            >
              <Text style={styles.emptyAddButtonText}>Add Your First Bank</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={selectedBanks}
            keyExtractor={item => item.name}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.bankCard}>
                <View style={styles.bankInfo}>
                  <View style={styles.bankIconContainer}>
                    <Building2 size={24} color="#3A6FF8" />
                  </View>
                  <View style={styles.bankDetails}>
                    <Text style={styles.bankName}>{item.name}</Text>
                    <Text style={styles.bankIds}>
                      Sender IDs: {item.ids?.join(', ')}
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => openDeleteSheet(item)}
                  style={styles.deleteButton}
                >
                  <Trash2 size={20} color="#EF4444" />
                </Pressable>
              </View>
            )}
          />
        )}
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        title="Select Bank"
        options={availableBanks.map(b => ({
          label: b.name,
          value: b._id || b.id,
        }))}
        onSelect={handleAddBank}
        initialHeight={0.7}
      />

      <BottomSheet
        ref={deleteSheetRef}
        title="Remove Bank"
        initialHeight={0.45}
      >
        <View style={styles.deleteSheetContent}>
          <View style={styles.deleteWarningIcon}>
            <AlertTriangle size={32} color="#EF4444" />
          </View>
          <Text style={styles.deleteText}>
            Are you sure you want to remove{' '}
            <Text style={{ color: '#F8FAFC' }}>{bankToDelete?.name}</Text> from
            tracking?
          </Text>
          <View style={styles.deleteActions}>
            <Pressable
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => deleteSheetRef.current?.close()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.confirmButton]}
              onPress={confirmDelete}
            >
              <Text style={styles.confirmButtonText}>Remove</Text>
            </Pressable>
          </View>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

export default BankSmsConfigScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#94A3B8',
    marginTop: 4,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#3A6FF8',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#3A6FF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  listContent: {
    paddingBottom: 40,
  },
  bankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bankIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(58, 111, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  bankDetails: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: '#F8FAFC',
  },
  bankIds: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#64748B',
    marginTop: 2,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: '#F8FAFC',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 20,
    marginBottom: 32,
  },
  emptyAddButton: {
    backgroundColor: '#3A6FF8',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  emptyAddButtonText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
  },
  deleteSheetContent: {
    padding: 24,
    alignItems: 'center',
  },
  deleteWarningIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  deleteActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: '#94A3B8',
  },
  confirmButton: {
    backgroundColor: '#EF4444',
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
  },
});
