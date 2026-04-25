import {
  schemaMigrations,
  addColumns,
  createTable,
} from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
  migrations: [
    {
      toVersion: 10,
      steps: [
        createTable({
          name: 'budgets',
          columns: [
            { name: 'remote_id', type: 'string', isOptional: true, isIndexed: true },
            { name: 'category_id', type: 'string' },
            { name: 'month', type: 'string' },
            { name: 'monthly_limit', type: 'number' },
            { name: 'notified_thresholds', type: 'string' },
            { name: 'synced', type: 'boolean' },
            { name: 'updated_at', type: 'number' },
            { name: 'is_deleted', type: 'boolean' },
          ],
        }),
      ],
    },
    {
      toVersion: 9,
      steps: [
        addColumns({
          table: 'transactions',
          columns: [{ name: 'category', type: 'string', isOptional: true }],
        }),
      ],
    },
  ],
});
