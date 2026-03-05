import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { Pencil, Trash2 } from 'lucide-react-native';
import styles from './styles';
import { usePrivacy } from '../../context/PrivacyContext';
import { useAuth } from '../../hooks/useAuth';

const ExpenseCard = React.memo(
  ({ item, transformMonthLabel, formatItemTime, onEdit, onDelete }) => {
    const { user } = useAuth();
    const { formatAmount, isPrivacyMode } = usePrivacy();

    // The new unified Transaction model uses 'name', 'amountRupees', 'type', 'note'
    // category will be displayed if mapped, or passed down
    const titleText = item.name || 'Transaction';
    const amountVal = item.amountRupees || (item.amount || 0) / 100;

    // Fallback for generating "YYYY-MM" if item doesn't have month stored natively
    const dateObj = new Date(item.date);
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yyyy = dateObj.getFullYear();
    const derivedMonth = `${yyyy}-${mm}`;

    const subtitleText = item.categoryName
      ? `${item.categoryName} • ${transformMonthLabel(
          derivedMonth,
        )}\n${formatItemTime(item.date)}`
      : `${transformMonthLabel(derivedMonth)}\n${formatItemTime(item.date)}`;

    return (
      <Card style={styles.expenseItem}>
        <Card.Title
          title={titleText}
          subtitle={subtitleText}
          titleStyle={styles.expenseTitle}
          subtitleStyle={styles.expenseSubtitle}
          right={() => (
            <View style={styles.expenseAmounts}>
              {item.type === 'expense' ? (
                <Text style={styles.moneyOut}>
                  {isPrivacyMode
                    ? '******'
                    : `-${formatAmount(amountVal, user?.currency)}`}
                </Text>
              ) : item.type === 'income' ? (
                <Text style={styles.moneyIn}>
                  {isPrivacyMode
                    ? '******'
                    : `+${formatAmount(amountVal, user?.currency)}`}
                </Text>
              ) : (
                <Text style={styles.expenseAmount}>
                  {formatAmount(amountVal, user?.currency)}
                </Text>
              )}
              <TouchableOpacity
                onPress={() => onEdit(item)}
                style={styles.editButton}
                activeOpacity={0.7}
              >
                <Pencil size={18} color="#94A3B8" />
              </TouchableOpacity>
              {onDelete && (
                <TouchableOpacity
                  onPress={() => onDelete(item)}
                  style={styles.deleteButton}
                  activeOpacity={0.7}
                >
                  <Trash2 size={18} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          )}
        />
        {item.note || item.notes ? (
          <Card.Content>
            <Text variant="bodyMedium" style={styles.expenseNotes}>
              {item.note || item.notes}
            </Text>
          </Card.Content>
        ) : null}
      </Card>
    );
  },
);

export default ExpenseCard;
