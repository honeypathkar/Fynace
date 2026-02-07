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
    return (
      <Card style={styles.expenseItem}>
        <Card.Title
          title={item.itemName || item.category}
          subtitle={
            item.category
              ? `${item.category} • ${transformMonthLabel(
                  item.month,
                )}\n${formatItemTime(item.createdAt)}`
              : `${transformMonthLabel(item.month)}\n${formatItemTime(
                  item.createdAt,
                )}`
          }
          titleStyle={styles.expenseTitle}
          subtitleStyle={styles.expenseSubtitle}
          right={() => (
            <View style={styles.expenseAmounts}>
              {item.amount > 0 ? (
                <Text style={styles.expenseAmount}>
                  {formatAmount(item.amount, user?.currency)}
                </Text>
              ) : item.moneyOut > 0 ? (
                <Text style={styles.moneyOut}>
                  {isPrivacyMode
                    ? '******'
                    : `-${formatAmount(item.moneyOut, user?.currency)}`}
                </Text>
              ) : item.moneyIn > 0 ? (
                <Text style={styles.moneyIn}>
                  {isPrivacyMode
                    ? '******'
                    : `+${formatAmount(item.moneyIn, user?.currency)}`}
                </Text>
              ) : null}
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
        {item.notes ? (
          <Card.Content>
            <Text variant="bodyMedium" style={styles.expenseNotes}>
              {item.notes}
            </Text>
          </Card.Content>
        ) : null}
      </Card>
    );
  },
);

export default ExpenseCard;
