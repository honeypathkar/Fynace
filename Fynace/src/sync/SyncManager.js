import { database } from '../database';
import { apiClient } from '../api/client';
import { Q } from '@nozbe/watermelondb';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_SYNC_KEY = '@fynace/last-sync-time';

class SyncManager {
  constructor() {
    this.status = 'idle'; // idle, syncing, error
    this.listeners = new Set();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.status));
  }

  async sync(force = false) {
    if (this.status === 'syncing') return;

    try {
      this.status = 'syncing';
      this.notify();

      if (force) {
        await AsyncStorage.removeItem(LAST_SYNC_KEY);
        console.log('Force sync: Clear last sync time');
      }

      console.log('Sync starting (push)...');
      await this.pushChanges();
      console.log('Sync pulling changes...');
      await this.pullChanges();

      this.status = 'idle';
      console.log('Sync completed successfully.');
    } catch (error) {
      this.status = 'error';
      console.error('Sync failed:', error);
    } finally {
      this.notify();
    }
  }

  async pushChanges() {
    // 1. Push Expenses
    const unsyncedExpenses = await database
      .get('expenses')
      .query(Q.where('synced', false))
      .fetch();

    for (const expense of unsyncedExpenses) {
      try {
        const payload = {
          month: expense.month,
          itemName: expense.itemName,
          category: expense.category,
          amount: expense.amount,
          notes: expense.notes,
          date: expense.date,
        };

        let remoteId = expense.remoteId;
        if (!expense.isDeleted) {
          const response = await apiClient.post('/expenses', payload);
          remoteId = response.data.expense?._id;
        }

        await database.write(async () => {
          await expense.update(record => {
            record.synced = true;
            if (remoteId) record.remoteId = remoteId;
          });
        });
      } catch (err) {
        console.error('Failed to push expense:', expense.id, err);
      }
    }

    // 2. Push MoneyIn
    const unsyncedMoneyIn = await database
      .get('money_in')
      .query(Q.where('synced', false))
      .fetch();

    for (const entry of unsyncedMoneyIn) {
      try {
        const payload = {
          amount: entry.amount,
          date: entry.date,
          notes: entry.notes,
        };

        const response = await apiClient.post('/money-in', payload);
        const remoteId = response.data.data?._id;

        await database.write(async () => {
          await entry.update(record => {
            record.synced = true;
            if (remoteId) record.remoteId = remoteId;
          });
        });
      } catch (err) {
        console.error('Failed to push money_in:', entry.id, err);
      }
    }

    // 3. Push Categories
    const unsyncedCategories = await database
      .get('categories')
      .query(Q.where('synced', false))
      .fetch();

    for (const cat of unsyncedCategories) {
      try {
        await apiClient.post('/categories', { name: cat.name });
        await database.write(async () => {
          await cat.update(record => {
            record.synced = true;
          });
        });
      } catch (err) {
        console.error('Failed to push category:', cat.name, err);
      }
    }
  }

  async pullChanges() {
    try {
      const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);

      const response = await apiClient.get('/sync', {
        params: { lastSyncTime: lastSync || 0 },
      });

      const {
        expenses = [],
        moneyIn = [],
        categories = [],
      } = response.data.data || {};
      const remoteTimestamp = response.data.timestamp || Date.now();

      console.log(
        `Sync Pulled: ${expenses.length} expenses, ${moneyIn.length} moneyIn, ${categories.length} categories`,
      );

      await database.write(async () => {
        // Process Expenses
        const expenseCollection = database.get('expenses');
        for (const remote of expenses) {
          const remoteDate = remote.date || remote.createdAt;
          if (!remoteDate) continue;

          // Build a robust query: match by remote_id OR (itemName + date + amount)
          const searchClauses = [Q.where('remote_id', remote._id)];

          // Only fallback to name/date if it looks like it could be the same item
          searchClauses.push(
            Q.and(
              Q.where('item_name', remote.itemName || ''),
              Q.where('date', remoteDate),
              Q.where('amount', remote.amount || 0),
            ),
          );

          const existing = await expenseCollection
            .query(Q.or(...searchClauses))
            .fetch();

          if (existing.length === 0) {
            console.log(`Sync: Creating new local expense: ${remote.itemName}`);
            await expenseCollection.create(record => {
              record.remoteId = remote._id;
              record.itemName = remote.itemName || 'Unnamed';
              record.amount = remote.amount;
              record.category = remote.category;
              record.month = remote.month;
              record.date = remoteDate;
              record.notes = remote.notes;
              record.moneyIn = remote.moneyIn || 0;
              record.moneyOut = remote.moneyOut || 0;
              record.remaining = remote.remaining || 0;
              record.synced = true;
              record.updatedAt = new Date(
                remote.updatedAt || remote.createdAt,
              ).getTime();
              record.isDeleted = !!remote.isDeleted;
            });
          } else {
            // Update existing record with remote ID if it was missing
            const record = existing[0];
            await record.update(r => {
              if (remote._id) r.remoteId = remote._id;
              r.isDeleted = !!remote.isDeleted;
              r.synced = true;
            });
          }
        }

        // Process MoneyIn
        const miCollection = database.get('money_in');
        for (const remote of moneyIn) {
          const remoteDate = remote.date || remote.createdAt;
          if (!remoteDate) continue;

          const searchClauses = [Q.where('remote_id', remote._id)];
          searchClauses.push(
            Q.and(
              Q.where('date', remoteDate),
              Q.where('amount', remote.amount || 0),
            ),
          );

          const existing = await miCollection
            .query(Q.or(...searchClauses))
            .fetch();

          if (existing.length === 0) {
            await miCollection.create(record => {
              record.remoteId = remote._id;
              record.amount = remote.amount;
              record.date = remoteDate;
              record.notes = remote.notes;
              record.source = remote.source || 'Remote';
              record.month = remoteDate.substring(0, 7);
              record.category = remote.category || 'General';
              record.synced = true;
              record.updatedAt = new Date(
                remote.updatedAt || remoteDate,
              ).getTime();
              record.isDeleted = !!remote.isDeleted;
            });
          } else {
            const record = existing[0];
            await record.update(r => {
              if (remote._id) r.remoteId = remote._id;
              r.isDeleted = !!remote.isDeleted;
              r.synced = true;
            });
          }
        }

        // Process Categories
        const catCollection = database.get('categories');
        for (const remote of categories) {
          if (!remote.name) continue;

          const existing = await catCollection
            .query(Q.where('name', remote.name))
            .fetch();

          if (existing.length === 0) {
            await catCollection.create(record => {
              record.name = remote.name;
              record.type = 'expense';
              record.synced = true;
              record.updatedAt = new Date(
                remote.updatedAt || remote.createdAt || Date.now(),
              ).getTime();
              record.isDeleted = false;
            });
          }
        }
      });

      await AsyncStorage.setItem(LAST_SYNC_KEY, String(remoteTimestamp));
    } catch (err) {
      console.error('Failed to pull changes:', err);
      throw err;
    }
  }
}

export const syncManager = new SyncManager();
