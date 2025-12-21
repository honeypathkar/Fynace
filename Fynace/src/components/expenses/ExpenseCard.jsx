import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { Pencil } from 'lucide-react-native';
import styles from './styles';

const ExpenseCard = ({ item, transformMonthLabel, onEdit }) => {
  return (
    <Card style={styles.expenseItem}>
      <Card.Title
        title={item.itemName || item.category}
        subtitle={
          item.category
            ? `${item.category} • ${transformMonthLabel(item.month)}`
            : transformMonthLabel(item.month)
        }
        titleStyle={styles.expenseTitle}
        subtitleStyle={styles.expenseSubtitle}
        right={() => (
          <View style={styles.expenseAmounts}>
            {item.amount > 0 ? (
              <Text style={styles.expenseAmount}>
                ₹{item.amount.toLocaleString()}
              </Text>
            ) : item.moneyOut > 0 ? (
              <Text style={styles.moneyOut}>
                -₹{item.moneyOut.toLocaleString()}
              </Text>
            ) : item.moneyIn > 0 ? (
              <Text style={styles.moneyIn}>
                +₹{item.moneyIn.toLocaleString()}
              </Text>
            ) : null}
            <TouchableOpacity
              onPress={() => onEdit(item)}
              style={styles.editButton}
              activeOpacity={0.7}
            >
              <Pencil size={18} color="#94A3B8" />
            </TouchableOpacity>
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
};

export default ExpenseCard;

