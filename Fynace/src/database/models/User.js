import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class User extends Model {
  static table = 'users';

  @field('name') name;
  @field('email') email;
  @field('synced') synced;
  @field('updated_at') updatedAt;
  @field('is_deleted') isDeleted;

  @readonly @date('created_at') createdAt;
}
