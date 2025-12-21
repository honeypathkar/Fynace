import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import BottomSheet from '../BottomSheet';
import { FileText, FileSpreadsheet, MessageSquare, ChevronDown } from 'lucide-react-native';
import styles from './styles';

const FABMenu = ({
  sheetRef,
  onClose,
  onAddManually,
  onImportExcel,
  onSmsFetch,
  uploading = false,
}) => {
  return (
    <BottomSheet
      ref={sheetRef}
      title="Add Expense"
      onClose={onClose}
      footer={
        <View style={styles.actionMenuFooter}>
          <Button
            mode="outlined"
            onPress={() => {
              onClose();
              sheetRef.current?.close();
            }}
            textColor="#94A3B8"
            style={styles.actionMenuButton}
          >
            Cancel
          </Button>
        </View>
      }
    >
      <View style={styles.actionMenuContent}>
        <TouchableOpacity
          style={styles.actionMenuItem}
          onPress={onAddManually}
          activeOpacity={0.7}
        >
          <View style={styles.actionMenuIconContainer}>
            <FileText size={24} color="#3A6FF8" />
          </View>
          <View style={styles.actionMenuTextContainer}>
            <Text style={styles.actionMenuTitle}>Add Manually</Text>
            <Text style={styles.actionMenuSubtitle}>
              Enter expense details manually
            </Text>
          </View>
          <ChevronDown
            size={20}
            color="#94A3B8"
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
            color="#94A3B8"
            style={{ transform: [{ rotate: '-90deg' }] }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionMenuItem}
          onPress={onSmsFetch}
          activeOpacity={0.7}
        >
          <View style={styles.actionMenuIconContainer}>
            <MessageSquare size={24} color="#F97316" />
          </View>
          <View style={styles.actionMenuTextContainer}>
            <Text style={styles.actionMenuTitle}>SMS Fetch</Text>
            <Text style={styles.actionMenuSubtitle}>
              Extract expenses from SMS
            </Text>
          </View>
          <ChevronDown
            size={20}
            color="#94A3B8"
            style={{ transform: [{ rotate: '-90deg' }] }}
          />
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

export default FABMenu;

