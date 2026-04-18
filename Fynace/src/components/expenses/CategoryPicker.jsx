import React, { useRef, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Keyboard, TouchableOpacity } from 'react-native';
import { Portal, Modal, Text, TextInput } from 'react-native-paper';
import { X } from 'lucide-react-native';
import BottomSheet from '../BottomSheet';
import PrimaryButton from '../PrimaryButton';
import { spacing } from '../BottomSheet/styles';
import Fonts from '../../../assets/fonts';

const CategoryPicker = ({
  visible,
  categories,
  selectedCategory,
  onSelectCategory,
  onClose,
  creatingCategory,
  onCreateCategory,
}) => {
  const bottomSheetRef = useRef(null);
  const [internalNewCategory, setInternalNewCategory] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.open();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const formattedOptions = useMemo(() => {
    const opts = categories.map(cat => ({
      label: cat.name,
      value: cat.name,
    }));

    opts.unshift({
      label: 'Add New Category',
      value: 'ADD_NEW_ACTION',
      showPlusIcon: true,
    });

    return opts;
  }, [categories]);

  const handleSelect = (val) => {
    if (val === 'ADD_NEW_ACTION') {
      setInternalNewCategory('');
      setIsModalVisible(true);
      return;
    }
    
    const selected = categories.find(c => c.name === val);
    if (selected) {
      onSelectCategory(selected);
      bottomSheetRef.current?.close();
    }
  };

  const handleCreateCategory = async () => {
    if (!internalNewCategory.trim() || creatingCategory) return;
    
    const success = await onCreateCategory(internalNewCategory.trim());
    
    if (success) {
      setIsModalVisible(false);
      bottomSheetRef.current?.close();
      setInternalNewCategory('');
      Keyboard.dismiss();
    }
  };

  return (
    <>
      <BottomSheet
        ref={bottomSheetRef}
        title="Select Category"
        onClose={onClose}
        initialHeight={0.6}
        options={formattedOptions}
        selectedValue={selectedCategory}
        onSelect={handleSelect}
      />

      <Portal>
        <Modal
          visible={isModalVisible}
          onDismiss={() => setIsModalVisible(false)}
          contentContainerStyle={localStyles.modalContainer}
        >
          <View style={localStyles.modalHeader}>
            <Text style={localStyles.modalTitle}>New Category</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <X size={24} color="#808080" />
            </TouchableOpacity>
          </View>

          <View style={localStyles.addForm}>
            <TextInput
              label="Category Name"
              placeholder="e.g. Subscriptions, Gifts..."
              value={internalNewCategory}
              onChangeText={setInternalNewCategory}
              mode="outlined"
              autoFocus
              style={localStyles.input}
              outlineColor="rgba(255,255,255,0.1)"
              activeOutlineColor="#FFFFFF"
              textColor="#FFFFFF"
            />
            
            <PrimaryButton
              title={creatingCategory ? "CREATING..." : "ADD CATEGORY"}
              onPress={handleCreateCategory}
              disabled={!internalNewCategory.trim() || creatingCategory}
              buttonColor="#FFFFFF"
              textColor="#000000"
              style={localStyles.saveButton}
            />
          </View>
        </Modal>
      </Portal>
    </>
  );
};

const localStyles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#000000',
    margin: 20,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
  },
  addForm: {
    gap: 20,
  },
  input: {
    backgroundColor: '#000000',
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  saveButton: {
    marginTop: 8,
  }
});

export default CategoryPicker;
