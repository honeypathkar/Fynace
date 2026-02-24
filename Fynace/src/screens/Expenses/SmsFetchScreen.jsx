import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  Platform,
  ToastAndroid,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Text, Chip, Button, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  MessageSquare,
  Plus,
  RefreshCw,
  Calendar,
  CheckCircle2,
  Trash2,
  Check,
  X,
  CreditCard,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, PermissionsAndroid } from 'react-native';

const { SmsModule } = NativeModules;
import GlobalHeader from '../../components/GlobalHeader';
import { useAuth } from '../../hooks/useAuth';
import { apiClient, parseApiError } from '../../api/client';
import Fonts from '../../../assets/fonts';

const DATE_RANGES = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'week' },
  { label: 'Last Week', value: 'last_week' },
  { label: 'This Month', value: 'month' },
  { label: 'Last Month', value: 'last_month' },
];

const SmsFetchScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [selectedRange, setSelectedRange] = useState('today');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingIds, setAddingIds] = useState(new Set());
  const [bankConfigs, setBankConfigs] = useState([]);
  const [addedIds, setAddedIds] = useState(new Set());
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const [categories, setCategories] = useState([]);

  const userId = user?._id || user?.id || 'guest';
  const STORAGE_KEY = `@bank_sms_config_${userId}`;

  useEffect(() => {
    loadBankConfigs();
    fetchCategories();
  }, [userId]);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      setCategories(response.data?.data?.all || []);
    } catch (err) {
      // Failed to fetch categories
    }
  };

  const loadBankConfigs = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBankConfigs(JSON.parse(stored));
      }
    } catch (err) {
      // Failed to load bank configs
    }
  };

  const getSmsRange = range => {
    const now = new Date();
    let startTime = new Date();
    let endTime = new Date();

    switch (range) {
      case 'today':
        startTime.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startTime.setDate(now.getDate() - 1);
        startTime.setHours(0, 0, 0, 0);
        endTime.setDate(now.getDate() - 1);
        endTime.setHours(23, 59, 59, 999);
        return { start: startTime.getTime(), end: endTime.getTime() };
      case 'week':
        startTime.setDate(now.getDate() - 7);
        startTime.setHours(0, 0, 0, 0);
        break;
      case 'last_week':
        startTime.setDate(now.getDate() - 14);
        startTime.setHours(0, 0, 0, 0);
        endTime.setDate(now.getDate() - 7);
        endTime.setHours(23, 59, 59, 999);
        return { start: startTime.getTime(), end: endTime.getTime() };
      case 'month':
        startTime.setDate(1);
        startTime.setHours(0, 0, 0, 0);
        break;
      case 'last_month':
        startTime.setMonth(now.getMonth() - 1);
        startTime.setDate(1);
        startTime.setHours(0, 0, 0, 0);
        endTime.setDate(0); // Last day of previous month
        endTime.setHours(23, 59, 59, 999);
        return { start: startTime.getTime(), end: endTime.getTime() };
      default:
        startTime.setHours(0, 0, 0, 0);
    }

    return { start: startTime.getTime(), end: now.getTime() };
  };

  const parseSms = (body, date, address) => {
    const amountRegex = /(?:rs|inr|amt|₹)\.?\s*([\d,]+(?:\.\d{2})?)/i;
    const match = body.match(amountRegex);

    if (!match) return null;

    let amount = match[1].replace(/,/g, '');

    const merchPatterns = [
      /spent\s+at\s+([^,.\s]+(?:\s+[^,.\s]+){0,2})/i,
      /paid\s+to\s+([^,.\s]+(?:\s+[^,.\s]+){0,2})/i,
      /at\s+([^,.\s]+(?:\s+[^,.\s]+){0,2})/i,
      /toward\s+([^,.\s]+(?:\s+[^,.\s]+){0,2})/i,
      /transferred\s+to\s+([^,.\s]+(?:\s+[^,.\s]+){0,2})/i,
    ];

    let merchant = 'Bank Transaction';
    for (const pattern of merchPatterns) {
      const merchMatch = body.match(pattern);
      if (merchMatch && merchMatch[1]) {
        merchant = merchMatch[1].trim();
        break;
      }
    }

    let category = 'Others';
    const lowerBody = body.toLowerCase();
    if (
      lowerBody.includes('swiggy') ||
      lowerBody.includes('zomato') ||
      lowerBody.includes('food')
    )
      category = 'Food & Dining';
    else if (
      lowerBody.includes('uber') ||
      lowerBody.includes('ola') ||
      lowerBody.includes('fuel') ||
      lowerBody.includes('petrol')
    )
      category = 'Transport';
    else if (
      lowerBody.includes('recharge') ||
      lowerBody.includes('bill') ||
      lowerBody.includes('electricity')
    )
      category = 'Bills & Utilities';
    else if (
      lowerBody.includes('amazon') ||
      lowerBody.includes('flipkart') ||
      lowerBody.includes('myntra')
    )
      category = 'Shopping';

    return {
      id: `${address}_${date}`,
      amount: parseFloat(amount),
      itemName: merchant,
      date: new Date(date).toISOString(),
      category: category,
      bank: address,
      originalText: body,
    };
  };

  const fetchSmsTransactions = async () => {
    ToastAndroid.show(
      'SMS fetching is temporarily unavailable to comply with Play Store policies.',
      ToastAndroid.LONG,
    );
    return;

    if (Platform.OS !== 'android') {
      ToastAndroid.show(
        'SMS fetching is only available on Android.',
        ToastAndroid.LONG,
      );
      return;
    }

    if (!SmsModule) {
      ToastAndroid.show(
        'The SMS module is not initialized.',
        ToastAndroid.LONG,
      );
      return;
    }

    if (bankConfigs.length === 0) {
      ToastAndroid.show(
        'Please configure your bank SMS IDs first.',
        ToastAndroid.LONG,
      );
      return;
    }

    try {
      setLoading(true);
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        ToastAndroid.show('SMS permission denied.', ToastAndroid.SHORT);
        setLoading(false);
        return;
      }

      const { start, end } = getSmsRange(selectedRange);
      const filter = {
        box: 'inbox',
        indexFrom: 0,
        maxCount: 150,
        minDate: start,
        maxDate: end,
      };

      const bankIds = new Set(
        bankConfigs.flatMap(b => b.ids.map(id => id.toUpperCase())),
      );

      SmsModule.listSms(
        JSON.stringify(filter),
        fail => {
          setLoading(false);
        },
        (count, smsList) => {
          const sms = JSON.parse(smsList);
          const filtered = sms.filter(item => {
            const address = item.address.toUpperCase();
            const parts = address.split('-');
            return (
              bankIds.has(address) || parts.some(part => bankIds.has(part))
            );
          });

          const parsed = filtered
            .map(item => parseSms(item.body, item.date, item.address))
            .filter(item => item !== null && item.amount > 0);

          setTransactions(parsed);
          setLoading(false);

          if (parsed.length === 0) {
            ToastAndroid.show('No transactions found', ToastAndroid.SHORT);
          }
        },
      );
    } catch (err) {
      setLoading(false);
    }
  };

  const handleAddExpense = async transaction => {
    if (addedIds.has(transaction.id)) return;
    try {
      setAddingIds(prev => new Set(prev).add(transaction.id));
      const payload = {
        month: transaction.date.substring(0, 7),
        itemName: transaction.itemName,
        amount: transaction.amount,
        category: transaction.category,
        notes:
          transaction.notes || `Auto-fetched from SMS: ${transaction.bank}`,
        date: transaction.date,
      };
      await apiClient.post('/expenses', payload);
      setAddedIds(prev => new Set(prev).add(transaction.id));
    } catch (err) {
      // Error handles silently for bulk
    } finally {
      setAddingIds(prev => {
        const next = new Set(prev);
        next.delete(transaction.id);
        return next;
      });
    }
  };

  const handleAddAll = async () => {
    const toAdd = transactions.filter(t => !addedIds.has(t.id));
    if (toAdd.length === 0) return;

    setIsBulkAdding(true);
    for (const transaction of toAdd) {
      await handleAddExpense(transaction);
    }
    setIsBulkAdding(false);
    ToastAndroid.show(
      `Processed ${toAdd.length} transactions`,
      ToastAndroid.LONG,
    );
  };

  const removeTransaction = id => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const [editCategory, setEditCategory] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const startEditing = transaction => {
    setEditingId(transaction.id);
    setEditValue(transaction.itemName);
    setEditCategory(transaction.category);
    setEditNotes(transaction.notes || '');
  };

  const saveEdit = () => {
    setTransactions(prev =>
      prev.map(t =>
        t.id === editingId
          ? {
              ...t,
              itemName: editValue,
              category: editCategory,
              notes: editNotes,
            }
          : t,
      ),
    );
    setEditingId(null);
  };

  const renderItem = useCallback(
    ({ item }) => {
      const isAdded = addedIds.has(item.id);
      const isAdding = addingIds.has(item.id);
      const isEditing = editingId === item.id;

      return (
        <View style={[styles.transactionCard, isAdded && styles.fadedCard]}>
          <View style={styles.cardTop}>
            <View style={styles.amountBox}>
              <Text style={styles.currency}>₹</Text>
              <Text style={styles.amount}>
                {item.amount.toLocaleString('en-IN')}
              </Text>
            </View>
            <IconButton
              icon={() => <Trash2 size={20} color="#EF4444" />}
              onPress={() => removeTransaction(item.id)}
              disabled={isAdded || isAdding}
            />
          </View>

          <View style={styles.cardBody}>
            {isEditing ? (
              <View style={styles.editSection}>
                <View style={styles.editInputLine}>
                  <TextInput
                    style={styles.editInput}
                    value={editValue}
                    onChangeText={setEditValue}
                    autoFocus
                    placeholder="Merchant Name"
                    placeholderTextColor="#64748B"
                  />
                </View>

                <Text style={styles.editLabel}>Category</Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={categories}
                  keyExtractor={cat => cat}
                  contentContainerStyle={styles.catEditScroll}
                  renderItem={({ item: cat }) => (
                    <Chip
                      selected={editCategory === cat}
                      onPress={() => setEditCategory(cat)}
                      style={[
                        styles.catChip,
                        editCategory === cat && styles.catChipSelected,
                      ]}
                      textStyle={styles.catChipText}
                    >
                      {cat}
                    </Chip>
                  )}
                />

                <TextInput
                  style={styles.notesInput}
                  value={editNotes}
                  onChangeText={setEditNotes}
                  placeholder="Add notes..."
                  placeholderTextColor="#64748B"
                  multiline
                />

                <View style={styles.editFooter}>
                  <Button
                    mode="contained"
                    onPress={saveEdit}
                    style={styles.saveBtn}
                    labelStyle={styles.saveBtnLabel}
                  >
                    Save Changes
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => setEditingId(null)}
                    textColor="#EF4444"
                  >
                    Cancel
                  </Button>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => !isAdded && startEditing(item)}
                style={styles.nameRow}
              >
                <View style={styles.mainInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.itemName}
                  </Text>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                </View>
                {!isAdded && (
                  <Plus size={12} color="#64748B" style={{ marginLeft: 4 }} />
                )}
              </Pressable>
            )}

            {!isEditing && (
              <View style={styles.metaRow}>
                <View style={styles.bankTag}>
                  <Text style={styles.bankTagText}>{item.bank}</Text>
                </View>
                <View style={styles.dateInfo}>
                  <Calendar size={12} color="#64748B" />
                  <Text style={styles.dateText}>
                    {new Date(item.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Text>
                </View>
              </View>
            )}
            {item.notes && !isEditing && (
              <Text style={styles.notesPreview} numberOfLines={1}>
                Note: {item.notes}
              </Text>
            )}
          </View>

          <Pressable
            onPress={() => handleAddExpense(item)}
            disabled={isAdded || isAdding}
            style={[
              styles.addButton,
              isAdded && styles.addedButton,
              isAdding && styles.addingButton,
            ]}
          >
            {isAdding ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : isAdded ? (
              <CheckCircle2 size={18} color="#FFFFFF" />
            ) : (
              <Plus size={18} color="#FFFFFF" strokeWidth={3} />
            )}
            <Text style={styles.addButtonText}>
              {isAdding ? 'Adding...' : isAdded ? 'Added' : 'Add'}
            </Text>
          </Pressable>
        </View>
      );
    },
    [
      addedIds,
      addingIds,
      editingId,
      editValue,
      categories,
      editCategory,
      editNotes,
      handleAddExpense,
      removeTransaction,
      startEditing,
      saveEdit,
    ],
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <GlobalHeader
        title="SMS Transaction Fetch"
        titleColor="#F8FAFC"
        backgroundColor="transparent"
        showLeftIcon
        leftIconName="arrow-left"
        leftIconColor="#F8FAFC"
        onLeftIconPress={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <View style={styles.rangeSelector}>
          <Text style={styles.label}>Fetch Range</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={DATE_RANGES}
            keyExtractor={item => item.value}
            contentContainerStyle={styles.chipScroll}
            renderItem={({ item }) => (
              <Chip
                selected={selectedRange === item.value}
                onPress={() => setSelectedRange(item.value)}
                style={[
                  styles.chip,
                  selectedRange === item.value && styles.chipSelected,
                ]}
                textStyle={[
                  styles.chipText,
                  selectedRange === item.value && styles.chipTextSelected,
                ]}
              >
                {item.label}
              </Chip>
            )}
          />
        </View>

        <View style={styles.actionHeader}>
          <Text style={styles.resultsInfo}>
            {transactions.length} Transactions Found
          </Text>
          <Pressable
            onPress={fetchSmsTransactions}
            style={({ pressed }) => [
              styles.refreshButton,
              pressed && { opacity: 0.7 },
            ]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#3A6FF8" />
            ) : (
              <RefreshCw size={18} color="#3A6FF8" />
            )}
            <Text style={styles.refreshText}>Scan</Text>
          </Pressable>
        </View>

        {transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <CreditCard size={48} color="#64748B" />
            </View>
            <Text style={styles.emptyText}>No results yet</Text>
            <Text style={styles.emptySubtext}>
              Tap Scan to fetch transactions from your messages.
            </Text>
            <Button
              mode="contained"
              onPress={fetchSmsTransactions}
              loading={loading}
              style={styles.scanButton}
              labelStyle={styles.scanButtonLabel}
            >
              Start Scanning
            </Button>
          </View>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={renderItem}
          />
        )}
      </View>

      {transactions.length > 0 && (
        <View style={styles.footerActions}>
          <Button
            mode="contained"
            onPress={handleAddAll}
            loading={isBulkAdding}
            disabled={transactions.every(t => addedIds.has(t.id))}
            style={styles.bulkButton}
            labelStyle={styles.bulkButtonLabel}
            contentStyle={{ height: 56 }}
          >
            Add All To Expenses
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  rangeSelector: {
    marginTop: 12,
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  chipScroll: {
    paddingRight: 40,
    gap: 8,
  },
  chip: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 12,
  },
  chipSelected: {
    backgroundColor: 'rgba(58, 111, 248, 0.15)',
    borderColor: '#3A6FF8',
  },
  chipText: {
    color: '#94A3B8',
    fontFamily: Fonts.medium,
  },
  chipTextSelected: {
    color: '#3A6FF8',
    fontFamily: Fonts.bold,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsInfo: {
    fontSize: 14,
    fontFamily: Fonts.semibold,
    color: '#F8FAFC',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(58, 111, 248, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  refreshText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: '#3A6FF8',
  },
  listContent: {
    paddingBottom: 100,
  },
  transactionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  fadedCard: {
    opacity: 0.6,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: '#F8FAFC',
    marginRight: 2,
  },
  amount: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: '#F8FAFC',
  },
  cardBody: {
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemName: {
    fontSize: 16,
    fontFamily: Fonts.semibold,
    color: '#F8FAFC',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    paddingRight: 8,
    marginBottom: 6,
  },
  editInput: {
    flex: 1,
    color: '#F8FAFC',
    fontFamily: Fonts.medium,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editIconBtn: {
    padding: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bankTag: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bankTagText: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: '#94A3B8',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#64748B',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#3A6FF8',
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  addedButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  addingButton: {
    backgroundColor: '#334155',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontFamily: Fonts.bold,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: '#F8FAFC',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
    marginBottom: 24,
  },
  scanButton: {
    backgroundColor: '#3A6FF8',
    borderRadius: 12,
  },
  scanButtonLabel: {
    fontFamily: Fonts.bold,
  },
  footerActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0F172A',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  bulkButton: {
    backgroundColor: '#3A6FF8',
    borderRadius: 16,
    elevation: 4,
  },
  bulkButtonLabel: {
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  editSection: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 12,
    marginTop: 4,
  },
  editInputLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    marginBottom: 12,
  },
  editInput: {
    color: '#F8FAFC',
    fontFamily: Fonts.semibold,
    fontSize: 16,
    paddingVertical: 8,
  },
  editLabel: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  catEditScroll: {
    gap: 8,
    marginBottom: 12,
  },
  catChip: {
    backgroundColor: '#1E293B',
    height: 32,
  },
  catChipSelected: {
    backgroundColor: '#3A6FF8',
  },
  catChipText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
  },
  notesInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 10,
    color: '#F8FAFC',
    fontFamily: Fonts.regular,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  editFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  saveBtn: {
    backgroundColor: '#10B981',
    flex: 1,
    marginRight: 10,
  },
  saveBtnLabel: {
    fontFamily: Fonts.bold,
    fontSize: 13,
  },
  mainInfo: {
    flex: 1,
  },
  itemCategory: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#3A6FF8',
    marginTop: 2,
  },
  notesPreview: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 6,
    borderRadius: 4,
  },
});

export default SmsFetchScreen;
