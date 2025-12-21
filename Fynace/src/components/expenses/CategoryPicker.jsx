import React from 'react';
import { FlatList, Modal, TextInput, TouchableOpacity, View, Platform, StatusBar } from 'react-native';
import { Text } from 'react-native-paper';
import { Plus, X } from 'lucide-react-native';
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
            <Text style={styles.monthPickerTitle}>Select Category</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.monthPickerCloseButton}
            >
              <Text style={styles.monthPickerCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
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
                  <Text style={styles.addCategoryButtonText}>
                    Add New Category
                  </Text>
                </TouchableOpacity>
              )
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.monthPickerItem,
                  selectedCategory === item &&
                    styles.monthPickerItemSelected,
                ]}
                onPress={() => {
                  onSelectCategory(item);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.monthPickerItemText,
                    selectedCategory === item &&
                      styles.monthPickerItemTextSelected,
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
          />
        </View>
      </View>
    </Modal>
  );
};

export default CategoryPicker;

