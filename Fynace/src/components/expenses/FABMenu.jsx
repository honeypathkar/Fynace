import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text, ActivityIndicator, useTheme } from 'react-native-paper';
import { Plus, FileText, FileSpreadsheet, MessageSquare, ChevronDown } from 'lucide-react-native';
import BottomSheet from '../BottomSheet';

const FABMenu = ({
  sheetRef,
  onClose,
  onAddManually,
  onImportExcel,
  onSmsFetch,
  uploading = false,
  styles: propStyles,
}) => {
  const theme = useTheme();
  const styles = propStyles || require('./styles').getStyles(theme);

  return (
    <BottomSheet
      ref={sheetRef}
      title="Add Expense"
      onClose={onClose}
      initialHeight={0.5}
    >
      <View style={styles.actionMenuContent}>
        <TouchableOpacity
          style={styles.actionMenuItem}
          onPress={onAddManually}
          activeOpacity={0.7}
        >
          <View style={styles.actionMenuIconContainer}>
            <FileText size={24} color="#d3d3ff" />
          </View>
          <View style={styles.actionMenuTextContainer}>
            <Text style={styles.actionMenuTitle}>Add Manually</Text>
            <Text style={styles.actionMenuSubtitle}>
              Enter expense details manually
            </Text>
          </View>
          <ChevronDown
            size={20}
            color="#808080"
            style={{ transform: [{ rotate: '-90deg' }] }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionMenuItem}
          onPress={onImportExcel}
          activeOpacity={0.7}
          disabled={uploading}
        >
          <View style={styles.actionMenuIconContainer}>
            <FileSpreadsheet size={24} color="#22C55E" />
          </View>
          <View style={styles.actionMenuTextContainer}>
            <Text style={styles.actionMenuTitle}>Import from Excel</Text>
            <Text style={styles.actionMenuSubtitle}>
              Upload CSV or Excel file
            </Text>
          </View>
          <ChevronDown
            size={20}
            color="#808080"
            style={{ transform: [{ rotate: '-90deg' }] }}
          />
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={styles.actionMenuItem}
          onPress={onSmsFetch}
          activeOpacity={0.7}
        >
          <View style={styles.actionMenuIconContainer}>
            <MessageSquare size={24} color="#d3d3ff" />
          </View>
          <View style={styles.actionMenuTextContainer}>
            <Text style={styles.actionMenuTitle}>SMS Fetch</Text>
            <Text style={styles.actionMenuSubtitle}>
              Extract expenses from SMS
            </Text>
          </View>
          <ChevronDown
            size={20}
            color="#808080"
            style={{ transform: [{ rotate: '-90deg' }] }}
          />
        </TouchableOpacity> */}
      </View>
    </BottomSheet>
  );
};

export default FABMenu;
