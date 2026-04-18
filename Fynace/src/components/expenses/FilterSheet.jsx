import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { Button, Text } from 'react-native-paper';
import BottomSheet from '../BottomSheet';
import styles from './styles';
import Fonts from '../../../assets/fonts';

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
  loading = false,
}) => {
  return (
    <BottomSheet
      ref={sheetRef}
      title="Filters"
      onClose={onClose}
      initialHeight={0.8}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.filterSheetScrollContent,
          loading && {
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 200,
          },
        ]}
      >
        {loading ? (
          <View style={{ paddingVertical: 40 }}>
            <ActivityIndicator color="#d3d3ff" size="large" />
            <Text
              style={{
                marginTop: 12,
                color: '#808080',
                fontFamily: Fonts.medium,
              }}
            >
              Loading filters...
            </Text>
          </View>
        ) : (
          <>
            {/* Type Filter Section */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Transaction Type</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {['All', 'expense', 'income'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeFilterItem,
                      selectedType === type && styles.filterSheetItemSelected,
                    ]}
                    onPress={() => onSelectType(type)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterSheetItemText,
                        selectedType === type &&
                          styles.filterSheetItemTextSelected,
                        { textTransform: 'capitalize' },
                      ]}
                    >
                      {type === 'All'
                        ? 'All'
                        : type === 'expense'
                        ? 'Expenses'
                        : 'Income'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
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
                    selectedMonth === 'All' &&
                      styles.filterSheetItemTextSelected,
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

            {/* Category Filter Section */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Category</Text>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterSheetItem,
                    selectedCategory === category &&
                      styles.filterSheetItemSelected,
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
          </>
        )}
      </ScrollView>
    </BottomSheet>
  );
};

export default FilterSheet;
