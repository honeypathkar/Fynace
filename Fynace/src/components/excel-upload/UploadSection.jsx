import React from 'react';
import { View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { FileSpreadsheet, Upload } from 'lucide-react-native';
import PrimaryButton from '../PrimaryButton';
import styles from './styles';

const UploadSection = ({ onFilePick, parsing }) => {
  return (
    <View style={styles.uploadSection}>
      <Card style={styles.uploadCard}>
        <Card.Content style={styles.uploadCardContent}>
          <FileSpreadsheet size={64} color="#3A6FF8" />
          <Text variant="titleLarge" style={styles.uploadTitle}>
            Upload Excel/CSV File
          </Text>
          <Text variant="bodyMedium" style={styles.uploadSubtitle}>
            Expected columns: Month, Name, Category, Amount (₹)
          </Text>
          <Text variant="bodySmall" style={styles.uploadNote}>
            Example: "June 2025", "Clothes", "Shopping", "2100"
          </Text>
          <PrimaryButton
            title={parsing ? 'Parsing...' : 'Select File'}
            onPress={onFilePick}
            loading={parsing}
            disabled={parsing}
            leftIcon={<Upload size={20} color="#F8FAFC" />}
            style={styles.uploadButton}
            buttonColor="#3A6FF8"
          />
        </Card.Content>
      </Card>
    </View>
  );
};

export default UploadSection;

