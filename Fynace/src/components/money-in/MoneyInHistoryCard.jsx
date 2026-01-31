import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { Calendar, Trash2 } from 'lucide-react-native';
import styles from './styles';

const MoneyInHistoryCard = ({ item, onDelete, formatDate, formatTime }) => {
  return (
    <Card style={styles.historyCard}>
      <Card.Content>
        <View style={styles.historyRow}>
          <View style={styles.historyInfo}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyAmount}>
                ₹{item.amount.toLocaleString()}
              </Text>
              <TouchableOpacity
                onPress={() => onDelete(item._id)}
                style={styles.deleteButton}
                activeOpacity={0.7}
              >
                <Trash2 size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
            <View style={styles.historyMeta}>
              <Calendar size={14} color="#94A3B8" />
              <Text style={styles.historyDate}>
                {formatDate(item.date)} at{' '}
                {formatTime(item.createdAt || item.date)}
              </Text>
            </View>
            {item.notes ? (
              <Text style={styles.historyNotes}>{item.notes}</Text>
            ) : null}
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

export default React.memo(MoneyInHistoryCard);
