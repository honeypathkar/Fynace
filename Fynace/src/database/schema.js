import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 3,
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
        { name: 'name', type: 'string' },
        { name: 'type', type: 'string' }, // 'expense' or 'income'
        { name: 'icon', type: 'string', isOptional: true },
        { name: 'synced', type: 'boolean' },
        { name: 'updated_at', type: 'number' },
        { name: 'is_deleted', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'expenses',
      columns: [
        {
          name: 'remote_id',
          type: 'string',
          isOptional: true,
          isIndexed: true,
        },
        { name: 'item_name', type: 'string' },
        { name: 'amount', type: 'number' },
        { name: 'category', type: 'string' },
        { name: 'month', type: 'string' }, // 'YYYY-MM'
        { name: 'date', type: 'string' }, // ISO string
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'money_in', type: 'number' },
        { name: 'money_out', type: 'number' },
        { name: 'remaining', type: 'number' },
        { name: 'synced', type: 'boolean' },
        { name: 'updated_at', type: 'number' },
        { name: 'is_deleted', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'money_in',
      columns: [
        {
          name: 'remote_id',
          type: 'string',
          isOptional: true,
          isIndexed: true,
        },
        { name: 'source', type: 'string' },
        { name: 'amount', type: 'number' },
        { name: 'category', type: 'string' },
        { name: 'month', type: 'string' }, // 'YYYY-MM'
        { name: 'date', type: 'string' }, // ISO string
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'synced', type: 'boolean' },
        { name: 'updated_at', type: 'number' },
        { name: 'is_deleted', type: 'boolean' },
      ],
    }),
  ],
});
