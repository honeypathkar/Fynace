import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import schema from './schema';
import Expense from './models/Expense';
import Category from './models/Category';
import User from './models/User';
import Bank from './models/Bank';
import MoneyIn from './models/MoneyIn';

const adapter = new SQLiteAdapter({
  schema,
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
  modelClasses: [Expense, Category, User, Bank, MoneyIn],
});
