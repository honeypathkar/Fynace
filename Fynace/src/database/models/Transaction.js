import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Transaction extends Model {
  static table = 'transactions';

  @field('remote_id') remoteId; // MongoDB _id after sync
  @field('type') type; // 'income' | 'expense'
  @field('name') name;
  @field('amount') amount; // integer paise (e.g. 12050 = ₹120.50)
  @field('category') category; // Denormalized category name
  @field('category_id') categoryId; // remote Category _id string
  @field('note') note;
  @field('date') date; // epoch ms
  @field('month') month; // 'YYYY-MM'
  @field('merchant_name') merchantName;
  @field('upi_id') upiId;
  @field('upi_intent') upiIntent;
  @field('is_recurring') isRecurring;
  @field('frequency') frequency; // 'daily' | 'weekly' | 'monthly' | 'yearly'
  @field('is_active') isActive;
  @field('synced') synced;
  @field('updated_at') updatedAt;
  @field('is_deleted') isDeleted;

  @readonly @date('created_at') createdAt;

  /** Returns amount in rupees for display */
  get amountRupees() {
    return (Number(this.amount) || 0) / 100;
  }

  /** Returns formatted amount string (e.g. "₹120.50") */
  get formattedAmount() {
    return `₹${this.amountRupees.toFixed(2)}`;
  }

  // --- LEGACY COMPATIBILITY GETTERS ---
  // To prevent widespread crashes in UI components that expect old `Expense`/`MoneyIn` properties.

  get itemName() {
    return this.name;
  }

  get moneyOut() {
    return this.type === 'expense' ? this.amountRupees : 0;
  }

  get moneyIn() {
    return this.type === 'income' ? this.amountRupees : 0;
  }

  get categoryName() {
    return this.category || '';
  }
}
