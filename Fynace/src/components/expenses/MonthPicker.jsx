import React, { useRef, useEffect } from 'react';
import BottomSheet from '../BottomSheet';

const MonthPicker = ({
  visible,
  monthOptions,
  selectedMonth,
  onSelectMonth,
  onClose,
}) => {
  const bottomSheetRef = useRef(null);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.open();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const options = monthOptions.map(option => ({
    value: option.key,
    label: option.label,
  }));

  return (
    <BottomSheet
      ref={bottomSheetRef}
      title="Select Month"
      options={options}
      selectedValue={selectedMonth}
      onSelect={onSelectMonth}
      onClose={onClose}
      initialHeight={0.6}
    />
  );
};

export default MonthPicker;
