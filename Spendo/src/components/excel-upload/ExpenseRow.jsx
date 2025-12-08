import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { Edit2, X } from 'lucide-react-native';
import TextInputField from '../TextInputField';
import PrimaryButton from '../PrimaryButton';
import styles from './styles';

const ExpenseRow = ({
  item,
  index,
  editingIndex,
  editedData,
  formatMonthForDisplay,
  parseMonth,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onEditDataChange,
}) => {
  const isEditing = editingIndex === index;

  return (
    <Card style={styles.dataRow}>
      <Card.Content>
        {isEditing ? (
          <View style={styles.editForm}>
            <TextInputField
              label="Month (e.g., June 2025 or 2025-06)"
              value={formatMonthForDisplay(editedData?.month || '')}
              onChangeText={(value) => {
                const parsed = parseMonth(value) || value;
                onEditDataChange({ ...editedData, month: parsed });
              }}
              placeholder="June 2025"
            />
            <TextInputField
              label="Item Name"
              value={editedData?.itemName || ''}
              onChangeText={(value) =>
                onEditDataChange({ ...editedData, itemName: value })
              }
              placeholder="Item name"
            />
            <TextInputField
              label="Category"
              value={editedData?.category || ''}
              onChangeText={(value) =>
                onEditDataChange({ ...editedData, category: value })
              }
              placeholder="Category (optional)"
            />
            <TextInputField
              label="Amount"
              value={editedData?.amount?.toString() || ''}
              keyboardType="numeric"
              onChangeText={(value) =>
                onEditDataChange({ ...editedData, amount: value })
              }
              placeholder="0"
            />
            <TextInputField
              label="Notes"
              value={editedData?.notes || ''}
              onChangeText={(value) =>
                onEditDataChange({ ...editedData, notes: value })
              }
              placeholder="Notes (optional)"
              multiline
              numberOfLines={2}
            />
            <View style={styles.editActions}>
              <Button
                mode="outlined"
                onPress={onCancel}
                textColor="#94A3B8"
                style={styles.editButton}
              >
                Cancel
              </Button>
              <PrimaryButton
                title="Save"
                onPress={onSave}
                style={styles.editButton}
                buttonColor="#22C55E"
              />
            </View>
          </View>
        ) : (
          <View style={styles.rowContent}>
            <View style={styles.rowInfo}>
              <Text variant="titleSmall" style={styles.rowItemName}>
                {item.itemName || 'N/A'}
              </Text>
              <Text variant="bodySmall" style={styles.rowDetails}>
                {item.category && `${item.category} • `}
                {formatMonthForDisplay(item.month)}
              </Text>
              {item.notes && (
                <Text variant="bodySmall" style={styles.rowNotes}>
                  {item.notes}
                </Text>
              )}
              <Text variant="titleMedium" style={styles.rowAmount}>
                ₹{typeof item.amount === 'number'
                  ? item.amount.toLocaleString('en-IN')
                  : String(item.amount || 0)}
              </Text>
            </View>
            <View style={styles.rowActions}>
              <TouchableOpacity
                onPress={() => onEdit(index)}
                style={styles.actionButton}
              >
                <Edit2 size={18} color="#3A6FF8" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onDelete(index)}
                style={styles.actionButton}
              >
                <X size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

export default ExpenseRow;

