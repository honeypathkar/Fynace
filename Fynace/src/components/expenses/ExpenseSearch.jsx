import React from 'react';
import { TextInput, View } from 'react-native';
import { Search } from 'lucide-react-native';
import { useTheme } from 'react-native-paper';

const ExpenseSearch = ({ searchQuery, onSearchChange, styles: propStyles }) => {
  const theme = useTheme();
  const styles = propStyles || require('./styles').getStyles(theme);
  return (
    <View style={styles.searchContainer}>
      <Search size={20} color={theme.colors.onSurfaceVariant} style={styles.searchIcon} />
      <TextInput
        placeholder="Search by item name, category"
        placeholderTextColor="#808080"
        value={searchQuery}
        onChangeText={onSearchChange}
        style={styles.searchInput}
      />
    </View>
  );
};

export default React.memo(ExpenseSearch);
