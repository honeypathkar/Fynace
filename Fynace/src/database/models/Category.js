import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Category extends Model {
  static table = 'categories';

  @field('name') name;
  @field('type') type;
  @field('icon') icon;
  @field('synced') synced;
  @field('updated_at') updatedAt;
  @field('is_deleted') isDeleted;

  @readonly @date('created_at') createdAt;
}
