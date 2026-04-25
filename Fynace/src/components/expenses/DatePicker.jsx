import React, { useRef, useEffect, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import BottomSheet from '../BottomSheet';
import Fonts from '../../../assets/fonts';

const { width } = Dimensions.get('window');

const DatePicker = ({
  visible,
  selectedMonth, // YYYY-MM
  selectedDate, // YYYY-MM-DD
  onSelectDate,
  onClose,
}) => {
  const theme = useTheme();
  const bottomSheetRef = useRef(null);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          padding: 16,
          paddingBottom: 40,
        },
        grid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 10,
          justifyContent: 'flex-start',
        },
        dayButton: {
          width: (width - 32 - 60) / 7,
          height: (width - 32 - 60) / 7,
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.surfaceVariant,
        },
        dayText: {
          fontSize: 14,
          fontFamily: Fonts.medium,
        },
      }),
    [theme],
  );

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.open();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const daysInMonth = useMemo(() => {
    if (!selectedMonth) return [];
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month, 0);
    const numDays = date.getDate();

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    const days = [];
    for (let i = 1; i <= numDays; i++) {
      const isFuture =
        year > currentYear ||
        (year === currentYear && month > currentMonth) ||
        (year === currentYear && month === currentMonth && i > currentDay);

      days.push({
        day: i,
        dateString: `${year}-${String(month).padStart(2, '0')}-${String(
          i,
        ).padStart(2, '0')}`,
        isFuture,
      });
    }
    return days;
  }, [selectedMonth]);

  const renderDays = () => {
    return (
      <View style={styles.grid}>
        {daysInMonth.map(item => {
          const isSelected = item.dateString === selectedDate;
          return (
            <TouchableOpacity
              key={item.day}
              style={[
                styles.dayButton,
                isSelected && { backgroundColor: theme.colors.secondary },
                item.isFuture && { opacity: 0.3 },
              ]}
              disabled={item.isFuture}
              onPress={() => onSelectDate(item.dateString)}
            >
              <Text
                style={[
                  styles.dayText,
                  {
                    color: isSelected
                      ? theme.colors.onSecondary
                      : theme.colors.text,
                  },
                ]}
              >
                {item.day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      title="Select Date"
      onClose={onClose}
      initialHeight={0.55}
    >
      <View style={styles.container}>{renderDays()}</View>
    </BottomSheet>
  );
};

export default DatePicker;
