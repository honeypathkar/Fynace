import React, {
  useState,
  useMemo,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  ToastAndroid,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text, useTheme, TextInput, Button, Divider } from 'react-native-paper';
import {
  Bug,
  MessageSquare,
  Lightbulb,
  Camera,
  X,
  CheckCircle2,
  Clock,
} from 'lucide-react-native';
import BottomSheet from '../BottomSheet';
import TextInputField from '../TextInputField';
import { launchImageLibrary } from 'react-native-image-picker';
import Fonts from '../../../assets/fonts';
import { apiClient } from '../../api/client';
import { triggerHaptic } from '../../utils/hapticFeedback';
const FeedbackSheet = forwardRef(({ onSubmitted }, ref) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const sheetRef = useRef(null);
  const [mainTab, setMainTab] = useState('submit'); // 'submit' | 'history'

  useImperativeHandle(ref, () => ({
    open: (tab = 'submit') => {
      setMainTab(tab);
      sheetRef.current?.open();
    },
    close: () => {
      sheetRef.current?.close();
    },
  }));
  const [type, setType] = useState('Feedback');
  const [message, setMessage] = useState('');
  const [images, setImages] = useState([]);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await apiClient.get('/feedback');
      setHistory(res.data.feedback || []);
    } catch (error) {
      console.error('History fetch error:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (mainTab === 'history') {
      fetchHistory();
    }
  }, [mainTab]);

  const styles = useMemo(() => {
    return StyleSheet.create({
      container: {
        // paddingHorizontal: 20,
        paddingBottom: 20,
      },
      label: {
        fontSize: 12,
        fontFamily: Fonts.bold,
        color: theme.colors.onSurfaceVariant,
        textTransform: 'uppercase',
        marginBottom: 12,
        letterSpacing: 1,
      },
      tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outlineVariant,
        marginBottom: 20,
      },
      tab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        position: 'relative',
      },
      tabText: {
        fontSize: 13,
        fontFamily: Fonts.medium,
        color: theme.colors.onSurfaceVariant,
        textTransform: 'uppercase',
      },
      activeTabText: { color: theme.colors.secondary, fontFamily: Fonts.bold },
      activeUnderline: {
        position: 'absolute',
        bottom: 0,
        left: '20%',
        right: '20%',
        height: 3,
        backgroundColor: theme.colors.secondary,
        borderRadius: 2,
      },
      historyCard: {
        backgroundColor: theme.colors.elevation.level1,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.outlineVariant,
      },
      historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
      },
      statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 6,
      },
      historyMsg: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        color: theme.colors.onSurface,
        lineHeight: 20,
      },
      typeContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
      },
      typeCard: {
        flex: 1,
        height: 80,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.outlineVariant,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
      },
      typeCardActive: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.dark
          ? 'rgba(96, 96, 255, 0.15)'
          : 'rgba(96, 96, 255, 0.08)',
      },
      typeLabel: {
        fontSize: 12,
        fontFamily: Fonts.medium,
        marginTop: 6,
        color: theme.colors.onSurfaceVariant,
      },
      typeLabelActive: {
        color: theme.dark ? '#8B8BFF' : theme.colors.primary,
        fontFamily: Fonts.bold,
      },
      inputSection: {
        marginBottom: 20,
      },
      input: {
        backgroundColor: theme.colors.surface,
      },
      imageSection: {
        marginBottom: 24,
      },
      imageScroll: {
        flexDirection: 'row',
        gap: 10,
      },
      addImageBtn: {
        width: 80,
        height: 80,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.outlineVariant,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
      },
      imageWrapper: {
        width: 80,
        height: 80,
        position: 'relative',
      },
      image: {
        width: 80,
        height: 80,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.outlineVariant,
      },
      removeBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: theme.colors.error,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
      },
      submitBtn: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        marginTop: 10,
      },
      submitBtnLabel: {
        fontSize: 16,
        fontFamily: Fonts.bold,
      },
    });
  }, [theme]);

  const handlePickImage = async () => {
    triggerHaptic('impactMedium');
    if (images.length >= 5) {
      Alert.alert(
        'Limit Reached',
        'You can only upload up to 5 images for a bug report.',
      );
      return;
    }

    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 5 - images.length,
      quality: 0.7,
    });

    if (result.assets) {
      setImages([...images, ...result.assets]);
    }
  };

  const removeImage = index => {
    triggerHaptic('impactMedium');
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    triggerHaptic('impactMedium');
    if (!message.trim()) {
      Alert.alert('Error', 'Please describe your feedback.');
      return;
    }

    setSubmitting(true);
    try {
      let uploadedUrls = [];
      if (images.length > 0) {
        setUploading(true);
        const formData = new FormData();
        images.forEach(img => {
          formData.append('images', {
            uri:
              Platform.OS === 'android'
                ? img.uri
                : img.uri.replace('file://', ''),
            type: img.type || 'image/jpeg',
            name: img.fileName || `image_${Date.now()}.jpg`,
          });
        });

        const uploadRes = await apiClient.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedUrls = uploadRes.data.images;
        setUploading(false);
      }

      await apiClient.post('/feedback/submit', {
        type,
        message,
        images: uploadedUrls,
      });

      ToastAndroid.show(
        'Your feedback has been submitted successfully!',
        ToastAndroid.LONG,
      );

      if (onSubmitted) onSubmitted();
      ref.current?.close();
      // Reset form
      setMessage('');
      setImages([]);
      setType('Feedback');
    } catch (error) {
      console.error('Feedback error:', error);
      Alert.alert(
        'Error',
        'Failed to send feedback. Please check your internet and try again.',
      );
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const renderHistoryItem = ({ item }) => {
    const isResolved = item.status === 'Resolved';
    return (
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isResolved
                  ? 'rgba(46, 125, 50, 0.1)'
                  : 'rgba(255, 152, 0, 0.1)',
              },
            ]}
          >
            {isResolved ? (
              <CheckCircle2 size={12} color="#2E7D32" />
            ) : (
              <Clock size={12} color="#F57C00" />
            )}
            <Text
              style={{
                fontSize: 10,
                fontFamily: Fonts.bold,
                color: isResolved ? '#2E7D32' : '#F57C00',
              }}
            >
              {item.status || 'Pending'}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 11,
              color: theme.colors.onSurfaceVariant,
              fontFamily: Fonts.medium,
            }}
          >
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <Text style={styles.historyMsg}>{item.message}</Text>

        {item.images?.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 12 }}
          >
            {item.images.map((img, i) => (
              <TouchableOpacity
                key={i}
                onPress={() =>
                  navigation.navigate('ImageViewer', {
                    images: item.images,
                    index: i,
                  })
                }
              >
                <Image
                  source={{ uri: img }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 8,
                    marginRight: 8,
                    borderWidth: 1,
                    borderColor: theme.colors.outlineVariant,
                  }}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderTypeCard = (label, icon, value) => {
    const isActive = type === value;
    const activeColor = theme.dark ? '#8B8BFF' : theme.colors.primary;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          triggerHaptic('impactMedium');
          setType(value);
        }}
        style={[styles.typeCard, isActive && styles.typeCardActive]}
      >
        {React.cloneElement(icon, {
          size: 24,
          color: isActive ? activeColor : theme.colors.onSurfaceVariant,
        })}
        <Text style={[styles.typeLabel, isActive && styles.typeLabelActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <BottomSheet ref={sheetRef} title="Support & Feedback" initialHeight={0.95}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic('impactMedium');
            setMainTab('submit');
          }}
          style={styles.tab}
        >
          <Text
            style={[
              styles.tabText,
              mainTab === 'submit' && styles.activeTabText,
            ]}
          >
            Submit
          </Text>
          {mainTab === 'submit' && <View style={styles.activeUnderline} />}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic('impactMedium');
            setMainTab('history');
          }}
          style={styles.tab}
        >
          <Text
            style={[
              styles.tabText,
              mainTab === 'history' && styles.activeTabText,
            ]}
          >
            History
          </Text>
          {mainTab === 'history' && <View style={styles.activeUnderline} />}
        </TouchableOpacity>
      </View>

      {mainTab === 'submit' ? (
        <View style={styles.container}>
          <Text style={styles.label}>Select Type</Text>
          <View style={styles.typeContainer}>
            {renderTypeCard('Bug', <Bug />, 'Bug')}
            {renderTypeCard('Feedback', <MessageSquare />, 'Feedback')}
            {renderTypeCard('Idea', <Lightbulb />, 'Idea')}
          </View>

          <View style={styles.inputSection}>
            <TextInputField
              label="Message"
              placeholder="Tell us what's on your mind..."
              multiline
              numberOfLines={6}
              value={message}
              onChangeText={setMessage}
              style={{ minHeight: 120 }}
              borderColor={theme.colors.secondary}
            />
          </View>

          {type === 'Bug' && (
            <View style={styles.imageSection}>
              <Text style={styles.label}>Attachments ({images.length}/5)</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.imageScroll}
              >
                <TouchableOpacity
                  style={styles.addImageBtn}
                  onPress={handlePickImage}
                >
                  <Camera size={24} color={theme.colors.onSurfaceVariant} />
                </TouchableOpacity>
                {images.map((img, idx) => (
                  <View key={idx} style={styles.imageWrapper}>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() =>
                        navigation.navigate('ImageViewer', {
                          images: images.map(i => i.uri),
                          index: idx,
                        })
                      }
                    >
                      <Image source={{ uri: img.uri }} style={styles.image} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeBadge}
                      onPress={() => removeImage(idx)}
                    >
                      <X size={12} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={submitting || uploading}
            disabled={submitting || uploading}
            style={[
              styles.submitBtn,
              { backgroundColor: theme.colors.primary },
            ]}
            labelStyle={styles.submitBtnLabel}
            contentStyle={{ height: 56 }}
          >
            {uploading
              ? 'Uploading Images...'
              : submitting
              ? 'Submitting...'
              : 'Submit Feedback'}
          </Button>
        </View>
      ) : (
        <View style={{ flex: 1, paddingBottom: 40 }}>
          {loadingHistory ? (
            <ActivityIndicator
              style={{ marginTop: 40 }}
              color={theme.colors.primary}
            />
          ) : history.length > 0 ? (
            history.map(item => (
              <View key={item._id}>{renderHistoryItem({ item })}</View>
            ))
          ) : (
            <View style={{ alignItems: 'center', marginTop: 100 }}>
              <MessageSquare
                size={48}
                color={theme.colors.onSurfaceVariant}
                alpha={0.3}
              />
              <Text
                style={{
                  color: theme.colors.onSurfaceVariant,
                  marginTop: 16,
                  fontFamily: Fonts.medium,
                }}
              >
                No feedback history yet.
              </Text>
            </View>
          )}
        </View>
      )}
    </BottomSheet>
  );
});

export default React.memo(FeedbackSheet);
