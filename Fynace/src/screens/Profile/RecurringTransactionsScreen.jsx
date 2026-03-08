import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Text, Card, IconButton, Switch, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Calendar,
  Trash2,
  Pause,
  Play,
  ArrowLeft,
  Clock,
} from 'lucide-react-native';
import GlobalHeader from '../../components/GlobalHeader';
import { database } from '../../database';
import { Q } from '@nozbe/watermelondb';
import Fonts from '../../../assets/fonts';
import { usePrivacy } from '../../context/PrivacyContext';
import { useAuth } from '../../hooks/useAuth';

const calculateNextDate = (lastDate, frequency) => {
  if (!lastDate || !frequency) return null;
  const date = new Date(lastDate);
  const now = new Date();

  while (date <= now) {
    const prevDate = new Date(date);
    switch (frequency.toLowerCase()) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        return null;
    }
    // Safety break: if date doesn't advance (e.g. invalid frequency), stop loop.
    if (date <= prevDate) break;
  }
  return date;
};

const RecurringTransactionsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { formatAmount } = usePrivacy();
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecurring();
  }, []);

  const fetchRecurring = async () => {
    try {
      setLoading(true);
      const txs = await database
        .get('transactions')
        .query(Q.where('is_recurring', true), Q.where('is_deleted', false))
        .fetch();
      setRecurringTransactions(txs);
    } catch (error) {
      console.error('Error fetching recurring transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (item, value) => {
    try {
      await database.write(async () => {
        // Ensure we have a fresh model instance
        const record = await database.get('transactions').find(item.id);
        await record.update(r => {
          r.isActive = value;
          r.synced = false;
        });
      });
      // Re-fetch to update UI with fresh model instances
      await fetchRecurring();
    } catch (error) {
      console.error('Error toggling transaction status:', error);
    }
  };

  const deleteRecurring = async item => {
    try {
      await database.write(async () => {
        const record = await database.get('transactions').find(item.id);
        await record.update(r => {
          r.isDeleted = true;
          r.synced = false;
        });
      });
      await fetchRecurring();
    } catch (error) {
      console.error('Error deleting recurring transaction:', error);
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconBox,
              {
                borderColor:
                  item.type === 'expense'
                    ? 'rgba(239, 68, 68, 0.2)'
                    : 'rgba(34, 197, 94, 0.2)',
              },
            ]}
          >
            <Clock
              size={20}
              color={item.type === 'expense' ? '#EF4444' : '#22C55E'}
            />
          </View>
          <View>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.categorySub}>
              {item.category || 'Uncategorized'}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.amount,
            { color: item.type === 'expense' ? '#EF4444' : '#22C55E' },
          ]}
        >
          {item.type === 'expense' ? '-' : '+'}
          {formatAmount(item.amountRupees, user?.currency)}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBody}>
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Calendar size={14} color="#94A3B8" />
            <Text style={styles.detailLabel}>Next</Text>
            <Text style={styles.detailValue}>
              {(() => {
                const next = calculateNextDate(item.date, item.frequency);
                return next
                  ? next.toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                    })
                  : 'N/A';
              })()}
            </Text>
          </View>

          <View style={styles.detailSeparator} />

          <View style={styles.detailItem}>
            <Clock size={14} color="#94A3B8" />
            <Text style={styles.detailLabel}>Freq</Text>
            <Text style={[styles.detailValue, { textTransform: 'capitalize' }]}>
              {item.frequency || 'Monthly'}
            </Text>
          </View>

          <View style={styles.detailSeparator} />

          <View style={styles.detailItem}>
            <Text
              style={[
                styles.statusBadge,
                { color: item.isActive ? '#22C55E' : '#94A3B8' },
              ]}
            >
              {item.isActive ? 'ACTIVE' : 'PAUSED'}
            </Text>
            <Switch
              value={item.isActive}
              onValueChange={val => toggleActive(item, val)}
              color="#3A6FF8"
              style={{ transform: [{ scale: 0.7 }], marginLeft: -4 }}
            />
          </View>
        </View>
        {/* 
        <IconButton
          icon={() => <Trash2 size={18} color="#EF4444" />}
          onPress={() => deleteRecurring(item)}
          style={styles.deleteBtn}
        /> */}
      </View>
    </Card>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <GlobalHeader
        title="Recurring Transactions"
        showLeftIcon
        leftIconName="arrow-left"
        onLeftIconPress={() => navigation.goBack()}
        backgroundColor="transparent"
        titleColor="#F8FAFC"
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#3A6FF8" size="large" />
        </View>
      ) : (
        <FlatList
          data={recurringTransactions}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Clock size={48} color="#334155" />
              </View>
              <Text style={styles.emptyTitle}>No recurring transactions</Text>
              <Text style={styles.emptySubtitle}>
                You can set any transaction as recurring while adding a new
                expense.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default RecurringTransactionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  listContent: {
    padding: 15,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 17,
    fontFamily: Fonts.bold,
    color: '#F8FAFC',
    marginBottom: 2,
  },
  categorySub: {
    fontSize: 13,
    color: '#94A3B8',
    fontFamily: Fonts.medium,
  },
  amount: {
    fontSize: 18,
    fontFamily: Fonts.bold,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  cardBody: {
    padding: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.medium,
  },
  detailValue: {
    fontSize: 12,
    color: '#3A6FF8',
    fontFamily: Fonts.bold,
  },
  detailSeparator: {
    width: 1,
    height: 16,
    backgroundColor: '#334155',
  },
  statusBadge: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    letterSpacing: 0.5,
  },
  deleteBtn: {
    margin: 0,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: '#F8FAFC',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: Fonts.regular,
  },
});
