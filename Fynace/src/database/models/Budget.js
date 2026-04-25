import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Budget extends Model {
  static table = 'budgets';

  @field('remote_id') remoteId;
  @field('category_id') categoryId;
  @field('month') month;
  @field('monthly_limit') monthlyLimit;
  @field('notified_thresholds') notifiedThresholds; // JSON string
  @field('synced') synced;
  @field('updated_at') updatedAt;
  @field('is_deleted') isDeleted;

  @readonly @date('created_at') createdAt;

  get limitRupees() {
    return (Number(this.monthlyLimit) || 0) / 100;
  }

  get thresholds() {
    try {
      return JSON.parse(this.notifiedThresholds || '[]');
    } catch (e) {
      return [];
    }
  }
}
