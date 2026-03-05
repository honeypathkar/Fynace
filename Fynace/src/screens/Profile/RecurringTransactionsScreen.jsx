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
                backgroundColor:
                  item.type === 'expense'
                    ? 'rgba(239, 68, 68, 0.1)'
                    : 'rgba(34, 197, 94, 0.1)',
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
            <Text style={styles.subtitle}>
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
        <View style={styles.infoRow}>
          <Calendar size={14} color="#94A3B8" />
          <Text style={styles.infoText}>Frequency: </Text>
          <Chip style={styles.frequencyChip} textStyle={styles.frequencyText}>
            {item.frequency || 'Monthly'}
          </Chip>
        </View>

        <View style={styles.actions}>
          <View style={styles.activeToggle}>
            <Text
              style={[
                styles.statusText,
                { color: item.isActive ? '#22C55E' : '#94A3B8' },
              ]}
            >
              {item.isActive ? 'Active' : 'Paused'}
            </Text>
            <Switch
              value={item.isActive}
              onValueChange={val => toggleActive(item, val)}
              color="#3A6FF8"
            />
          </View>

          <IconButton
            icon={() => <Trash2 size={20} color="#EF4444" />}
            onPress={() => deleteRecurring(item)}
          />
        </View>
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
    padding: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.medium,
  },
  amount: {
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardBody: {
    padding: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.medium,
  },
  frequencyChip: {
    backgroundColor: 'rgba(58, 111, 248, 0.1)',
    height: 28,
    justifyContent: 'center',
  },
  frequencyText: {
    fontSize: 11,
    color: '#3A6FF8',
    textTransform: 'capitalize',
    fontFamily: Fonts.bold,
    lineHeight: 14,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    textTransform: 'uppercase',
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
