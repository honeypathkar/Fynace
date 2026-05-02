import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlobalHeader from '../../components/GlobalHeader';
import { useAuth } from '../../hooks/useAuth';
import { parseApiError, apiClient } from '../../api/client';
import TextInputField from '../../components/TextInputField';
import PrimaryButton from '../../components/PrimaryButton';
import { themeAssets } from '../../theme';
import Fonts from '../../../assets/fonts';
import { launchImageLibrary } from 'react-native-image-picker';
import { Camera, User as UserIcon, Trash2 } from 'lucide-react-native';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { user, loading, updateProfile } = useAuth();
  const theme = useTheme();

  const [formValues, setFormValues] = useState({
    fullName: '',
    email: '',
    userImage: '',
  });
  const [newImage, setNewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormValues({
        fullName: user.fullName || '',
        email: user.email || '',
        userImage: user.userImage || '',
      });
    }
  }, [user]);

  const handlePickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
      maxWidth: 1000,
      maxHeight: 1000,
    });

    if (result.assets && result.assets.length > 0) {
      setNewImage(result.assets[0]);
    }
  };

  const handleRemoveImage = () => {
    setNewImage(null);
    setFormValues(prev => ({ ...prev, userImage: '' }));
  };

  const updateFormValue = (field, value) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formValues.fullName || !formValues.fullName.trim()) {
      newErrors.fullName = 'Name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsUploading(true);
    try {
      let finalImageUrl = formValues.userImage;

      // Upload new image if selected
      if (newImage) {
        const formData = new FormData();
        formData.append('images', {
          uri: Platform.OS === 'android' ? newImage.uri : newImage.uri.replace('file://', ''),
          type: newImage.type || 'image/jpeg',
          name: newImage.fileName || `profile_${Date.now()}.jpg`,
        });

        const uploadRes = await apiClient.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        if (uploadRes.data.images && uploadRes.data.images.length > 0) {
          finalImageUrl = uploadRes.data.images[0];
        }
      }

      await updateProfile({
        fullName: formValues.fullName.trim(),
        userImage: finalImageUrl,
      });

      if (Platform.OS === 'android') {
        ToastAndroid.show('Profile updated successfully', ToastAndroid.LONG);
      }

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
    } finally {
      setIsUploading(false);
    }
  };

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
    imageSection: {
      alignItems: 'center',
      marginBottom: 32,
    },
    imageWrapper: {
      width: 100,
      height: 100,
      borderRadius: 50,
      position: 'relative',
      backgroundColor: theme.colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    profileImage: {
      width: '100%',
      height: '100%',
      borderRadius: 50,
    },
    cameraBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: theme.colors.primary,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.background,
    },
    removeBadge: {
      position: 'absolute',
      top: 0,
      right: -8,
      backgroundColor: theme.colors.error,
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.background,
    },
    formContainer: {
      width: '100%',
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: Fonts.bold,
      color: theme.colors.text,
      marginBottom: 20,
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
          <View style={styles.imageSection}>
            <TouchableOpacity 
              style={styles.imageWrapper}
              onPress={handlePickImage}
              activeOpacity={0.8}
            >
              {newImage || formValues.userImage ? (
                <Image
                  source={{ uri: newImage ? newImage.uri : formValues.userImage }}
                  resizeMode="cover"
                  style={styles.profileImage}
                />
              ) : (
                <UserIcon size={50} color={theme.colors.onSurfaceVariant} />
              )}
              <View style={styles.cameraBadge}>
                <Camera size={16} color={theme.colors.onPrimary} />
              </View>
            </TouchableOpacity>

            {(newImage || formValues.userImage) && (
              <TouchableOpacity 
                style={styles.removeBadge}
                onPress={handleRemoveImage}
                activeOpacity={0.7}
              >
                <Trash2 size={14} color={theme.colors.onError} />
              </TouchableOpacity>
            )}
          </View>

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
                loading={isUploading || loading}
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
