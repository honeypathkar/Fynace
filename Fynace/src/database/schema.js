import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 10,
  tables: [
    tableSchema({
      name: 'users',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'email', type: 'string' },
        { name: 'synced', type: 'boolean' },
        { name: 'updated_at', type: 'number' },
        { name: 'is_deleted', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'banks',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'balance', type: 'number' },
        { name: 'synced', type: 'boolean' },
        { name: 'updated_at', type: 'number' },
        { name: 'is_deleted', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'categories',
      columns: [
        {
          name: 'remote_id',
          type: 'string',
          isOptional: true,
          isIndexed: true,
        },
        { name: 'name', type: 'string' },
        { name: 'type', type: 'string' }, // 'expense' or 'income'
        { name: 'icon', type: 'string', isOptional: true },
        { name: 'synced', type: 'boolean' },
        { name: 'updated_at', type: 'number' },
        { name: 'is_deleted', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'budgets',
      columns: [
        {
          name: 'remote_id',
          type: 'string',
          isOptional: true,
          isIndexed: true,
        },
        { name: 'category_id', type: 'string' }, // local or remote id
        { name: 'month', type: 'string' }, // YYYY-MM
        { name: 'monthly_limit', type: 'number' }, // integer paise
        { name: 'notified_thresholds', type: 'string' }, // JSON stringified array [50, 70, 80]
        { name: 'synced', type: 'boolean' },
        { name: 'updated_at', type: 'number' },
        { name: 'is_deleted', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'transactions',
      columns: [
        {
          name: 'remote_id',
          type: 'string',
          isOptional: true,
          isIndexed: true,
        },
        { name: 'type', type: 'string' }, // 'income' | 'expense'
        { name: 'name', type: 'string' },
        { name: 'amount', type: 'number' }, // integer paise (e.g. ₹120.50 → 12050)
        { name: 'category', type: 'string', isOptional: true }, // Denormalized category name
        { name: 'category_id', type: 'string', isOptional: true }, // remote Category _id
        { name: 'note', type: 'string', isOptional: true },
        { name: 'date', type: 'number' }, // epoch ms
        { name: 'month', type: 'string' }, // denormalized 'YYYY-MM' for fast dashboard filtering
        { name: 'merchant_name', type: 'string', isOptional: true },
        { name: 'upi_id', type: 'string', isOptional: true },
        { name: 'upi_intent', type: 'boolean' },
        { name: 'is_recurring', type: 'boolean' },
        { name: 'frequency', type: 'string', isOptional: true }, // daily, weekly, monthly, yearly
        { name: 'is_active', type: 'boolean' },
        { name: 'synced', type: 'boolean' },
        { name: 'updated_at', type: 'number' },
        { name: 'is_deleted', type: 'boolean' },
      ],
    }),
  ],
});
