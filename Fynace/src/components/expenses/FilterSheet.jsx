import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Text, ActivityIndicator, useTheme } from 'react-native-paper';
import BottomSheet from '../BottomSheet';

const FilterSheet = ({
  sheetRef,
  onClose,
  selectedMonth,
  months,
  selectedCategory,
  categories,
  selectedType,
  onSelectType,
  transformMonthLabel,
  onSelectMonth,
  onSelectCategory,
  loading,
  styles: propStyles,
}) => {
  const theme = useTheme();
  const styles = propStyles || require('./styles').getStyles(theme);

  return (
    <BottomSheet
      ref={sheetRef}
      title="Filters"
      onClose={onClose}
      initialHeight={0.7}
    >
      <View style={styles.filterSheetContent}>
        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator color={theme.colors.secondary} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.filterSheetScrollContent}
          >
            {/* Transaction Type */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>TYPE</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {['All', 'expense', 'income'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeFilterItem,
                      selectedType === type && styles.filterSheetItemSelected,
                    ]}
                    onPress={() => onSelectType(type)}
                  >
                    <Text
                      style={[
                        styles.filterSheetItemText,
                        selectedType === type && styles.filterSheetItemTextSelected,
                        { textTransform: 'capitalize' }
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time Period */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>MONTH</Text>
              <TouchableOpacity
                style={[
                  styles.filterSheetItem,
                  selectedMonth === 'All' && styles.filterSheetItemSelected,
                ]}
                onPress={() => onSelectMonth('All')}
              >
                <Text
                  style={[
                    styles.filterSheetItemText,
                    selectedMonth === 'All' && styles.filterSheetItemTextSelected,
                  ]}
                >
                  All Time
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
                >
                  <Text
                    style={[
                      styles.filterSheetItemText,
                      selectedMonth === month &&
                        styles.filterSheetItemTextSelected,
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

            {/* Category */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>CATEGORY</Text>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterSheetItem,
                    selectedCategory === category &&
                      styles.filterSheetItemSelected,
                  ]}
                  onPress={() => onSelectCategory(category)}
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
        )}
      </View>
    </BottomSheet>
  );
};

export default React.memo(FilterSheet);
