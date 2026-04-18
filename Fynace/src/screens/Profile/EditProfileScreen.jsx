import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlobalHeader from '../../components/GlobalHeader';
import { useAuth } from '../../hooks/useAuth';
import { parseApiError } from '../../api/client';
import TextInputField from '../../components/TextInputField';
import PrimaryButton from '../../components/PrimaryButton';
import { themeAssets } from '../../theme';
import Fonts from '../../../assets/fonts';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { user, loading, updateProfile } = useAuth();

  const [formValues, setFormValues] = useState({
    fullName: '',
    email: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormValues({
        fullName: user.fullName || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const updateFormValue = (field, value) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formValues.fullName || !formValues.fullName.trim()) {
      newErrors.fullName = 'Name is required';
    }

    // Email is not editable, so no validation needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await updateProfile({
        fullName: formValues.fullName.trim(),
        // Email is not updatable, so don't send it
      });

      if (Platform.OS === 'android') {
        ToastAndroid.show('Profile updated successfully', ToastAndroid.LONG);
      }

      // Navigate back after a short delay to show toast
      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } catch (err) {
      const apiError = parseApiError(err);
      if (Platform.OS === 'android') {
        ToastAndroid.show(
          apiError.message || 'Failed to update profile',
          ToastAndroid.LONG,
        );
      }
    }
  };

  const theme = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 40,
    },
    formContainer: {
      width: '100%',
    },
    sectionTitle: {
      fontSize: 20,
      fontFamily: Fonts.bold,
      color: theme.colors.text,
      marginBottom: 24,
    },
    inputSection: {
      marginBottom: 20,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
    },
    disabledHintText: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
      fontStyle: 'italic',
    },
    buttonContainer: {
      marginTop: 32,
      marginBottom: 20,
    },
    saveButton: {
      width: '100%',
    },
  }), [theme]);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <StatusBar 
        barStyle={theme.dark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background} 
      />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <GlobalHeader
          title="Edit Profile"
          titleColor={theme.colors.text}
          backgroundColor="transparent"
          showLeftIcon
          leftIconName="arrow-left"
          leftIconColor={theme.colors.text}
          onLeftIconPress={() => navigation.goBack()}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.inputSection}>
              <TextInputField
                label="Full Name"
                value={formValues.fullName}
                onChangeText={value => updateFormValue('fullName', value)}
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              )}
            </View>

            <View style={styles.inputSection}>
              <TextInputField
                label="Email"
                value={formValues.email}
                editable={false}
                placeholder="Email cannot be changed"
                keyboardType="email-address"
                autoCapitalize="none"
                containerStyle={{ opacity: 0.6 }}
              />
              <Text style={styles.disabledHintText}>
                {user?.googleId 
                  ? 'Logged in using Google' 
                  : 'Email cannot be changed'}
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <PrimaryButton
                title="Save Changes"
                onPress={handleSave}
                loading={loading}
                buttonColor={theme.colors.secondary}
                textColor={theme.colors.onSecondary}
                style={styles.saveButton}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;
