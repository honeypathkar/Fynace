import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import schema from './schema';
import migrations from './migrations';
import Category from './models/Category';
import User from './models/User';
import Bank from './models/Bank';
import Transaction from './models/Transaction';

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  // (Optional) Database name
  dbName: 'fynace_db',
  // (optional, but recommended)
  // jsi: true,
  onSetUpError: error => {
    // Database failed to load -- display an error message or refresh the app
    console.error('Database setup error:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [Category, User, Bank, Transaction],
});
