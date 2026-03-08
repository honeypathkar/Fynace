import { database } from '../database';
import { apiClient } from '../api/client';
import { Q } from '@nozbe/watermelondb';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

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

    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      console.log('Sync skipped: Device is offline');
      return;
    }

    // Time-based check (once every 5 mins unless forced)
    const LAST_SYNC_ATTEMPT = '@fynace/last-sync-attempt';
    const lastSyncTime = await AsyncStorage.getItem(LAST_SYNC_ATTEMPT);
    const now = Date.now();
    if (!force && lastSyncTime && now - Number(lastSyncTime) < 300000) {
      console.log('Sync skipped: Recently synced');
      return;
    }

    try {
      this.status = 'syncing';
      this.notify();

      if (force) {
        await AsyncStorage.removeItem(LAST_SYNC_KEY);
      }

      await this.pushChanges();
      await this.pullChanges();

      await AsyncStorage.setItem(LAST_SYNC_ATTEMPT, String(now));
      this.status = 'idle';
    } catch (error) {
      this.status = 'error';
      console.error('Sync failed:', error);
    } finally {
      this.notify();
    }
  }

  async pushChanges() {
    // Push updated transactions
    const unsyncedTxns = await database
      .get('transactions')
      .query(Q.where('synced', false))
      .fetch();

    for (const txn of unsyncedTxns) {
      try {
        const payload = {
          type: txn.type,
          name: txn.name,
          amount: (txn.amount || 0) / 100, // Send as Rupees (API handles conversion to Paise)
          categoryId: txn.categoryId,
          note: txn.note,
          date: txn.date || Date.now(),
          merchantName: txn.merchantName,
          upiId: txn.upiId,
          upiIntent: txn.upiIntent,
          watermelonId: txn.id,
          isRecurring: txn.isRecurring,
          frequency: txn.frequency,
          isActive: txn.isActive,
        };

        let remoteId = txn.remoteId;

        if (txn.isDeleted) {
          if (remoteId) await apiClient.delete(`transactions/${remoteId}`);
        } else {
          if (remoteId) {
            await apiClient.put(`transactions/${remoteId}`, payload);
          } else {
            const response = await apiClient.post('transactions', payload);
            remoteId = response.data.data?._id;
          }
        }

        await database.write(async () => {
          await txn.update(record => {
            record.synced = true;
            if (remoteId) record.remoteId = remoteId;
          });
        });
      } catch (err) {
        console.error('Failed to push transaction:', txn.id, err);
      }
    }

    // Push new categories
    const unsyncedCategories = await database
      .get('categories')
      .query(Q.where('synced', false))
      .fetch();

    for (const cat of unsyncedCategories) {
      try {
        await apiClient.post('categories', { name: cat.name });
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
      const response = await apiClient.get('sync', {
        params: { lastSyncTime: lastSync || 0 },
      });

      const { transactions = [], categories = [] } = response.data.data || {};
      const remoteTimestamp = response.data.timestamp || Date.now();

      await database.write(async () => {
        // Sync Categories First (so we can map them)
        const catCollection = database.get('categories');
        for (const remote of categories) {
          if (!remote.name) continue;

          let existing = [];
          if (remote._id) {
            existing = await catCollection
              .query(Q.where('remote_id', remote._id))
              .fetch();
          }

          if (existing.length === 0) {
            await catCollection.create(record => {
              record.remoteId = remote._id; // Store mongo ObjectId
              record.name = remote.name;
              record.type = remote.type || 'expense';
              record.synced = true;
              record.updated_at = new Date(remote.updatedAt).getTime();
              record.isDeleted = !!remote.isDeleted;
            });
          }
        }

        // Sync Transactions
        const txCollection = database.get('transactions');
        for (const remote of transactions) {
          const remoteDate = remote.date || remote.createdAt;
          if (!remoteDate) continue;

          let existing = await txCollection
            .query(Q.where('remote_id', remote._id))
            .fetch();

          // Fallback map by watermelonId directly stored in remote DB
          if (existing.length === 0 && remote.watermelonId) {
            existing = await txCollection
              .query(Q.where('id', remote.watermelonId))
              .fetch();
          }

          if (existing.length === 0) {
            await txCollection.create(record => {
              record.remoteId = remote._id;
              record.type = remote.type;
              record.name = remote.name;
              record.amount = Math.round((remote.amount || 0) * 100);
              record.category = remote.categoryName || ''; // Fix for category filter
              record.categoryId = remote.categoryId;
              record.note = remote.note;
              record.date = new Date(remoteDate).getTime();

              const d = new Date(remoteDate);
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              record.month = `${d.getFullYear()}-${mm}`;

              record.merchantName = remote.merchantName;
              record.upiId = remote.upiId;
              record.upiIntent = remote.upiIntent;
              record.isRecurring = !!remote.isRecurring;
              record.frequency = remote.frequency;
              record.isActive =
                remote.isActive !== undefined ? remote.isActive : true;
              record.synced = true;
              record.updated_at = new Date(remote.updatedAt).getTime();
              record.isDeleted = !!remote.isDeleted;
            });
          } else {
            const record = existing[0];
            await record.update(r => {
              if (remote._id) r.remoteId = remote._id;
              r.type = remote.type;
              r.name = remote.name;
              r.amount = Math.round((remote.amount || 0) * 100);
              r.category = remote.categoryName || ''; // Fix for category filter
              r.categoryId = remote.categoryId;
              r.note = remote.note;
              r.date = new Date(remoteDate).getTime();
              const d = new Date(remoteDate);
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              r.month = `${d.getFullYear()}-${mm}`;
              r.isDeleted = !!remote.isDeleted;
              r.isRecurring = !!remote.isRecurring;
              r.frequency = remote.frequency;
              r.isActive =
                remote.isActive !== undefined ? remote.isActive : true;
              r.synced = true;
            });
          }
        }
      });

      await AsyncStorage.setItem(LAST_SYNC_KEY, String(remoteTimestamp));
    } catch (err) {
      console.error('Failed to pull changes:', err);
    }
  }
}

export const syncManager = new SyncManager();
