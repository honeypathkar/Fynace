import {
  schemaMigrations,
  addColumns,
} from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
  migrations: [
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
