import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import BottomSheet from '../BottomSheet';
import styles from './styles';

const FilterSheet = ({
  sheetRef,
  visible,
  onClose,
  selectedMonth,
  months,
  selectedCategory,
  categories,
  transformMonthLabel,
  onSelectMonth,
  onSelectCategory,
}) => {
  if (!visible) return null;

  return (
    <BottomSheet
      ref={sheetRef}
      title="Filters"
      onClose={onClose}
      initialHeight={0.7}
      footer={
        <View style={styles.actionMenuFooter}>
          <Button
            mode="outlined"
            onPress={() => {
              onClose();
              sheetRef.current?.close();
            }}
            textColor="#94A3B8"
            style={styles.actionMenuButton}
          >
            Done
          </Button>
        </View>
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.filterSheetScrollContent}
      >
        {/* Month Filter Section */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Month</Text>
          <TouchableOpacity
            style={[
              styles.filterSheetItem,
              selectedMonth === 'All' && styles.filterSheetItemSelected,
            ]}
            onPress={() => onSelectMonth('All')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterSheetItemText,
                selectedMonth === 'All' && styles.filterSheetItemTextSelected,
              ]}
            >
              All Months
            </Text>
            {selectedMonth === 'All' && (
              <View style={styles.filterSheetCheckmark}>
                <Text style={styles.filterSheetCheckmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
          {months.map(month => (
            <TouchableOpacity
              key={month}
              style={[
                styles.filterSheetItem,
                selectedMonth === month && styles.filterSheetItemSelected,
              ]}
              onPress={() => onSelectMonth(month)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterSheetItemText,
                  selectedMonth === month && styles.filterSheetItemTextSelected,
                ]}
              >
                {transformMonthLabel(month)}
              </Text>
              {selectedMonth === month && (
                <View style={styles.filterSheetCheckmark}>
                  <Text style={styles.filterSheetCheckmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Category Filter Section */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Category</Text>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterSheetItem,
                selectedCategory === category && styles.filterSheetItemSelected,
              ]}
              onPress={() => onSelectCategory(category)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterSheetItemText,
                  selectedCategory === category &&
                    styles.filterSheetItemTextSelected,
                ]}
              >
                {category}
              </Text>
              {selectedCategory === category && (
                <View style={styles.filterSheetCheckmark}>
                  <Text style={styles.filterSheetCheckmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </BottomSheet>
  );
};

export default FilterSheet;
