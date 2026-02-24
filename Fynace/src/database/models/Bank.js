import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Bank extends Model {
  static table = 'banks';

  @field('name') name;
  @field('balance') balance;
  @field('synced') synced;
  @field('updated_at') updatedAt;
  @field('is_deleted') isDeleted;

  @readonly @date('created_at') createdAt;
}
