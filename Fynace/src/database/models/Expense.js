import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Expense extends Model {
  static table = 'expenses';

  @field('remote_id') remoteId;
  @field('item_name') itemName;
  @field('amount') amount;
  @field('category') category;
  @field('month') month;
  @field('date') date;
  @field('notes') notes;
  @field('money_in') moneyIn;
  @field('money_out') moneyOut;
  @field('remaining') remaining;
  @field('synced') synced;
  @field('updated_at') updatedAt;
  @field('is_deleted') isDeleted;

  @readonly @date('created_at') createdAt;
}
