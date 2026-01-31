import React, { useRef, useEffect } from 'react';
import { FlatList, TextInput, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Plus, X } from 'lucide-react-native';
import BottomSheet from '../BottomSheet';
import styles from './styles';

const CategoryPicker = ({
  visible,
  categories,
  selectedCategory,
  onSelectCategory,
  onClose,
  showAddCategory,
  newCategoryName,
  creatingCategory,
  onCreateCategory,
  onShowAddCategory,
  onHideAddCategory,
  onNewCategoryNameChange,
}) => {
  const bottomSheetRef = useRef(null);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.open();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      title="Select Category"
      onClose={onClose}
      initialHeight={0.6}
    >
      <FlatList
        data={categories}
        keyExtractor={item => item}
        ListHeaderComponent={
          showAddCategory ? (
            <View style={styles.addCategoryContainer}>
              <TextInput
                placeholder="Enter new category name"
                placeholderTextColor="#94A3B8"
                value={newCategoryName}
                onChangeText={onNewCategoryNameChange}
                style={styles.addCategoryInput}
                autoFocus
              />
              <View style={styles.addCategoryActions}>
                <TouchableOpacity
                  style={styles.addCategoryCancelButton}
                  onPress={onHideAddCategory}
                >
                  <X size={20} color="#94A3B8" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.addCategorySaveButton,
                    (creatingCategory || !newCategoryName.trim()) &&
                      styles.addCategorySaveButtonDisabled,
                  ]}
                  onPress={() => onCreateCategory(newCategoryName)}
                  disabled={creatingCategory || !newCategoryName.trim()}
                  activeOpacity={0.7}
                >
                  <Text style={styles.addCategorySaveText}>
                    {creatingCategory ? 'Adding...' : 'Add'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addCategoryButton}
              onPress={onShowAddCategory}
            >
              <Plus size={20} color="#3A6FF8" />
              <Text style={styles.addCategoryButtonText}>Add New Category</Text>
            </TouchableOpacity>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.monthPickerItem,
              selectedCategory === item && styles.monthPickerItemSelected,
            ]}
            onPress={() => {
              onSelectCategory(item);
              bottomSheetRef.current?.close();
            }}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.monthPickerItemText,
                selectedCategory === item && styles.monthPickerItemTextSelected,
              ]}
            >
              {item}
            </Text>
            {selectedCategory === item && (
              <View style={styles.monthPickerCheckmark}>
                <Text style={styles.monthPickerCheckmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.monthPickerList}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </BottomSheet>
  );
};

export default CategoryPicker;
