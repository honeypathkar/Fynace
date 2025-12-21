import React from 'react';
import { FlatList, Modal, TouchableOpacity, View, Platform, StatusBar } from 'react-native';
import { Text } from 'react-native-paper';
import styles from './styles';

const MonthPicker = ({
  visible,
  monthOptions,
  selectedMonth,
  onSelectMonth,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === 'android'}
    >
      {Platform.OS === 'android' && visible && (
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
      )}
      <View style={styles.monthPickerModal}>
        <TouchableOpacity
          style={styles.monthPickerBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.monthPickerContainer}>
          <View style={styles.monthPickerHeader}>
            <Text style={styles.monthPickerTitle}>Select Month</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.monthPickerCloseButton}
            >
              <Text style={styles.monthPickerCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={monthOptions}
            keyExtractor={item => item.key}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.monthPickerItem,
                  selectedMonth === item.key && styles.monthPickerItemSelected,
                ]}
                onPress={() => {
                  onSelectMonth(item.key);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.monthPickerItemText,
                    selectedMonth === item.key &&
                      styles.monthPickerItemTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
                {selectedMonth === item.key && (
                  <View style={styles.monthPickerCheckmark}>
                    <Text style={styles.monthPickerCheckmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.monthPickerList}
          />
        </View>
      </View>
    </Modal>
  );
};

export default MonthPicker;

