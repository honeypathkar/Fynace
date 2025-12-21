import React from 'react';
import { TextInput, View } from 'react-native';
import { Search } from 'lucide-react-native';
import styles from './styles';

const ExpenseSearch = ({ searchQuery, onSearchChange }) => {
  return (
    <View style={styles.searchContainer}>
      <Search size={20} color="#94A3B8" style={styles.searchIcon} />
      <TextInput
        placeholder="Search by item name, category or notes"
        placeholderTextColor="#94A3B8"
        value={searchQuery}
        onChangeText={onSearchChange}
        style={styles.searchInput}
      />
    </View>
  );
};

export default ExpenseSearch;

