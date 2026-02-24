import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class MoneyIn extends Model {
  static table = 'money_in';

  @field('remote_id') remoteId;
  @field('source') source;
  @field('amount') amount;
  @field('category') category;
  @field('month') month;
  @field('date') date;
  @field('notes') notes;
  @field('synced') synced;
  @field('updated_at') updatedAt;
  @field('is_deleted') isDeleted;

  @readonly @date('created_at') createdAt;
}
