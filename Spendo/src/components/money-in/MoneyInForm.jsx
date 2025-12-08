import React from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-paper';
import TextInputField from '../TextInputField';
import PrimaryButton from '../PrimaryButton';
import styles from './styles';

const MoneyInForm = ({
  formValues,
  onFormValueChange,
  onSave,
  onCancel,
  saving,
}) => {
  return (
    <View style={styles.formContent}>
      <TextInputField
        label="Amount"
        value={formValues.amount}
        keyboardType="numeric"
        onChangeText={(value) =>
          onFormValueChange({ ...formValues, amount: value })
        }
        placeholder="0"
      />
      <TextInputField
        label="Date"
        value={formValues.date}
        onChangeText={(value) =>
          onFormValueChange({ ...formValues, date: value })
        }
        placeholder="YYYY-MM-DD"
      />
      <TextInputField
        label="Notes (Optional)"
        value={formValues.notes}
        onChangeText={(value) =>
          onFormValueChange({ ...formValues, notes: value })
        }
        placeholder="Add a note"
        multiline
        numberOfLines={3}
      />
    </View>
  );
};

export default MoneyInForm;

