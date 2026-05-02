import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  Platform,
  Modal,
  ToastAndroid,
} from 'react-native';
import {
  Text,
  useTheme,
  TextInput,
  Button,
  Divider,
  Checkbox,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Users,
  MessageSquare,
  Send,
  User,
  ExternalLink,
  Image as ImageIcon,
  Camera,
  X,
  CheckCircle2,
  Clock,
  Square,
  CheckSquare,
} from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import GlobalHeader from '../../components/GlobalHeader';
import BottomSheet from '../../components/BottomSheet';
import TextInputField from '../../components/TextInputField';
import Fonts from '../../../assets/fonts';
import { apiClient } from '../../api/client';
import { triggerHaptic } from '../../utils/hapticFeedback';

const AdminPanelScreen = ({ navigation }) => {
  const theme = useTheme();
  const detailSheetRef = useRef(null);
  const [activeTab, setActiveTab] = useState('feedbacks');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // Notification states
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifImage, setNotifImage] = useState('');
  const [notifUrl, setNotifUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [resolving, setResolving] = useState(false);

  const styles = useMemo(() => {
    return StyleSheet.create({
      container: { flex: 1, backgroundColor: theme.colors.background },
      tabBar: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        elevation: 2,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outlineVariant,
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
        left: '15%',
        right: '15%',
        height: 3,
        backgroundColor: theme.colors.secondary,
        borderRadius: 2,
      },
      content: { flex: 1 },
      listContent: { padding: 16, paddingBottom: 100 },
      card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.outlineVariant,
      },
      userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
      avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.elevation.level2,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      },
      userName: {
        fontSize: 16,
        fontFamily: Fonts.bold,
        color: theme.colors.onSurface,
      },
      userEmail: {
        fontSize: 13,
        color: theme.colors.onSurfaceVariant,
        fontFamily: Fonts.regular,
      },
      feedbackType: {
        fontSize: 10,
        fontFamily: Fonts.bold,
        textTransform: 'uppercase',
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 6,
        alignSelf: 'flex-start',
      },
      statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.elevation.level2,
      },
      statusText: {
        fontSize: 10,
        fontFamily: Fonts.bold,
        textTransform: 'uppercase',
        color: theme.colors.onSurfaceVariant,
      },
      feedbackMsg: {
        fontSize: 15,
        fontFamily: Fonts.regular,
        color: theme.colors.onSurface,
        lineHeight: 22,
        marginTop: 12,
        marginBottom: 12,
      },
      imageThumb: { width: 70, height: 70, borderRadius: 10, marginRight: 10 },
      form: { padding: 20 },
      inputSection: { marginBottom: 16 },
      input: {
        backgroundColor: theme.colors.surface,
      },
      errorText: {
        color: theme.colors.error,
        fontSize: 12,
        marginTop: 4,
        fontFamily: Fonts.regular,
      },
      imageUploadBtn: {
        height: 120,
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: theme.colors.outlineVariant,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.elevation.level1,
        marginBottom: 16,
        overflow: 'hidden',
      },
      uploadedImage: { width: '100%', height: '100%', borderRadius: 16 },
      removeImageBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 4,
        borderRadius: 12,
      },
      sendBtn: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        marginTop: 10,
        elevation: 4,
      },
      badge: {
        backgroundColor: theme.colors.primaryContainer,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
      },
      badgeText: {
        fontSize: 10,
        color: theme.colors.onPrimaryContainer,
        fontFamily: Fonts.bold,
      },
      selectionBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: theme.colors.primaryContainer,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
      },
      detailModal: {
        padding: 20,
        backgroundColor: theme.colors.surface,
      },
      detailTitle: {
        fontSize: 18,
        fontFamily: Fonts.bold,
        marginBottom: 16,
        color: theme.colors.onSurface,
      },
      detailMsg: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 20,
        color: theme.colors.onSurface,
      },
      fullImage: {
        width: '100%',
        height: 250,
        borderRadius: 16,
        marginBottom: 12,
      },
      resolveBtn: {
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        marginTop: 20,
      },
    });
  }, [theme]);

  const fetchData = useCallback(async () => {
    if (activeTab === 'notifications') return;
    setLoading(true);
    try {
      const endpoint =
        activeTab === 'users' ? '/admin/users' : '/admin/feedbacks';
      const res = await apiClient.get(endpoint);
      setData(activeTab === 'users' ? res.data.users : res.data.feedbacks);
    } catch (error) {
      console.error('Admin fetch error:', error);
      Alert.alert('Error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePickNotificationImage = async () => {
    triggerHaptic('impactMedium');
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });
      if (result.assets && result.assets[0]) {
        setUploadingImage(true);
        const img = result.assets[0];
        const formData = new FormData();
        formData.append('images', {
          uri:
            Platform.OS === 'android'
              ? img.uri
              : img.uri.replace('file://', ''),
          type: img.type || 'image/jpeg',
          name: img.fileName || `notif_${Date.now()}.jpg`,
        });
        const uploadRes = await apiClient.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setNotifImage(uploadRes.data.images[0]);
      }
    } catch (error) {
      console.error('Image upload error:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSendNotification = async () => {
    triggerHaptic('impactMedium');
    if (!notifTitle || !notifBody) {
      Alert.alert('Error', 'Title and Body are required');
      return;
    }
    setSending(true);
    try {
      const res = await apiClient.post('/admin/send-multicast', {
        title: notifTitle,
        body: notifBody,
        image: notifImage,
        url: notifUrl,
        userIds: selectedUserIds.size > 0 ? Array.from(selectedUserIds) : null,
      });
      ToastAndroid.show(res.data.message, ToastAndroid.LONG);
      setNotifTitle('');
      setNotifBody('');
      setNotifImage('');
      setNotifUrl('');
      setSelectedUserIds(new Set());
    } catch (error) {
      console.error('Send notif error:', error);
      Alert.alert('Error', 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleResolveFeedback = async id => {
    triggerHaptic('impactMedium');
    setResolving(true);
    try {
      await apiClient.put(`/admin/feedbacks/${id}/resolve`);
      ToastAndroid.show('User has been notified.', ToastAndroid.LONG);
      detailSheetRef.current?.close();
      fetchData();
    } catch (error) {
      console.error('Resolve error:', error);
      Alert.alert('Error', 'Failed to resolve feedback');
    } finally {
      setResolving(false);
    }
  };

  const toggleUserSelection = id => {
    triggerHaptic('impactMedium');
    const newSelection = new Set(selectedUserIds);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedUserIds(newSelection);
  };

  const renderFeedback = ({ item }) => {
    const isResolved = item.status === 'Resolved';
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          triggerHaptic('impactMedium');
          setSelectedFeedback(item);
          detailSheetRef.current?.open();
        }}
        style={styles.card}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View
            style={[
              styles.feedbackType,
              {
                backgroundColor:
                  item.type === 'Bug'
                    ? '#FFEDED'
                    : item.type === 'Idea'
                    ? '#E8F5E9'
                    : '#E3F2FD',
                color:
                  item.type === 'Bug'
                    ? '#D32F2F'
                    : item.type === 'Idea'
                    ? '#2E7D32'
                    : '#1976D2',
              },
            ]}
          >
            <Text
              style={{
                fontSize: 10,
                fontFamily: Fonts.bold,
                color:
                  item.type === 'Bug'
                    ? '#D32F2F'
                    : item.type === 'Idea'
                    ? '#2E7D32'
                    : '#1976D2',
              }}
            >
              {item.type}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              isResolved && { backgroundColor: '#E8F5E9' },
            ]}
          >
            {isResolved ? (
              <CheckCircle2 size={12} color="#2E7D32" />
            ) : (
              <Clock size={12} color={theme.colors.onSurfaceVariant} />
            )}
            <Text
              style={[
                styles.statusText,
                {
                  color: isResolved ? '#2E7D32' : theme.colors.onSurfaceVariant,
                },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <Text numberOfLines={3} style={styles.feedbackMsg}>
          {item.message}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={[styles.userRow, { gap: 8 }]}>
            <View style={[styles.avatar, { width: 24, height: 24 }]}>
              {item.user?.userImage ? (
                <Image
                  source={{ uri: item.user.userImage }}
                  style={{ width: 24, height: 24, borderRadius: 12 }}
                />
              ) : (
                <User size={12} color={theme.colors.onSurfaceVariant} />
              )}
            </View>
            <Text style={{ fontSize: 12, fontFamily: Fonts.medium }}>
              {item.user?.fullName || 'Anonymous'}
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: theme.colors.onSurfaceVariant }}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderUser = ({ item }) => {
    const isSelected = selectedUserIds.has(item._id);
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => toggleUserSelection(item._id)}
        style={[
          styles.card,
          isSelected && {
            borderColor: theme.colors.primary,
            borderWidth: 2,
            backgroundColor: theme.colors.primaryContainer + '20', // Light primary tint
          },
        ]}
      >
        <View style={styles.userRow}>
          <View style={{ marginRight: 4 }}>
            {isSelected ? (
              <CheckSquare
                size={24}
                color={theme.colors.secondary}
                variant="bold"
              />
            ) : (
              <Square size={24} color={theme.colors.onSurfaceVariant} />
            )}
          </View>
          <View style={styles.avatar}>
            {item.userImage ? (
              <Image
                source={{ uri: item.userImage }}
                style={{ width: 44, height: 44, borderRadius: 22 }}
              />
            ) : (
              <User size={22} color={theme.colors.onSurfaceVariant} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{item.fullName}</Text>
            <Text style={styles.userEmail}>{item.email || item.phone}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.role}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTab = (id, label) => {
    const isActive = activeTab === id;
    return (
      <TouchableOpacity
        onPress={() => {
          triggerHaptic('impactMedium');
          setActiveTab(id);
        }}
        style={styles.tab}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabText, isActive && styles.activeTabText]}>
          {label}
        </Text>
        {isActive && <View style={styles.activeUnderline} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <GlobalHeader
        title="Admin Control"
        showLeftIcon
        onLeftIconPress={() => navigation.goBack()}
        backgroundColor={theme.colors.background}
        titleColor={theme.colors.onSurface}
        leftIconColor={theme.colors.onSurface}
      />

      <View style={styles.tabBar}>
        {renderTab('feedbacks', 'Feedbacks')}
        {renderTab('users', 'Users')}
        {renderTab('notifications', 'Push')}
      </View>

      <View style={styles.content}>
        {activeTab === 'users' && selectedUserIds.size > 0 && (
          <View style={styles.selectionBar}>
            <Text
              style={{
                color: theme.colors.onPrimaryContainer,
                fontFamily: Fonts.bold,
              }}
            >
              {selectedUserIds.size} users selected
            </Text>
            <TouchableOpacity onPress={() => setSelectedUserIds(new Set())}>
              <Text
                style={{ color: theme.colors.primary, fontFamily: Fonts.bold }}
              >
                Clear
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : activeTab === 'notifications' ? (
          <ScrollView
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
          >
            <Text
              style={{ fontSize: 18, fontFamily: Fonts.bold, marginBottom: 20 }}
            >
              Send {selectedUserIds.size > 0 ? 'Targeted' : 'Broadcast'}{' '}
              Notification
            </Text>
            <View style={styles.inputSection}>
              <TextInputField
                label="Title"
                value={notifTitle}
                onChangeText={setNotifTitle}
                placeholder="Enter notification title"
              />
            </View>

            <View style={styles.inputSection}>
              <TextInputField
                label="Body"
                multiline
                numberOfLines={3}
                value={notifBody}
                onChangeText={setNotifBody}
                placeholder="Enter notification message"
              />
            </View>

            <TouchableOpacity
              style={styles.imageUploadBtn}
              onPress={handlePickNotificationImage}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <ActivityIndicator color={theme.colors.primary} />
              ) : notifImage ? (
                <>
                  <Image
                    source={{ uri: notifImage }}
                    style={styles.uploadedImage}
                  />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => setNotifImage('')}
                  >
                    <X size={16} color="#FFF" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Camera size={32} color={theme.colors.onSurfaceVariant} />
                  <Text
                    style={{
                      marginTop: 8,
                      color: theme.colors.onSurfaceVariant,
                      fontFamily: Fonts.medium,
                    }}
                  >
                    Upload Image
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.inputSection}>
              <TextInputField
                label="Deep Link URL (optional)"
                value={notifUrl}
                onChangeText={setNotifUrl}
                placeholder="e.g., fynace://budgets"
                accessory={
                  <ExternalLink
                    size={20}
                    color={theme.colors.onSurfaceVariant}
                    style={{ marginRight: 12 }}
                  />
                }
              />
            </View>

            <Button
              mode="contained"
              onPress={handleSendNotification}
              loading={sending}
              disabled={sending}
              style={[styles.sendBtn, { backgroundColor: '#1E3A8A' }]}
              labelStyle={{ fontSize: 16, fontFamily: Fonts.bold }}
              icon={() => (
                <CheckCircle2
                  size={20}
                  color={'white'}
                  style={{ marginRight: 12 }}
                />
              )}
            >
              {selectedUserIds.size > 0
                ? `Send to ${selectedUserIds.size} Users`
                : 'Send to All Devices'}
            </Button>
          </ScrollView>
        ) : (
          <FlatList
            data={data}
            renderItem={activeTab === 'users' ? renderUser : renderFeedback}
            keyExtractor={item => item._id || item.id}
            contentContainerStyle={styles.listContent}
            refreshing={loading}
            onRefresh={fetchData}
            ListEmptyComponent={() => (
              <Text
                style={{
                  textAlign: 'center',
                  marginTop: 40,
                  color: theme.colors.onSurfaceVariant,
                }}
              >
                No {activeTab} found
              </Text>
            )}
          />
        )}
      </View>

      <BottomSheet
        ref={detailSheetRef}
        title="Feedback Details"
        initialHeight={0.95}
      >
        {selectedFeedback && (
          <ScrollView
            style={styles.detailModal}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <View
                style={[
                  styles.feedbackType,
                  {
                    backgroundColor:
                      selectedFeedback.type === 'Bug'
                        ? '#FFEDED'
                        : selectedFeedback.type === 'Idea'
                        ? '#E8F5E9'
                        : '#E3F2FD',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: Fonts.bold,
                    color:
                      selectedFeedback.type === 'Bug'
                        ? '#D32F2F'
                        : selectedFeedback.type === 'Idea'
                        ? '#2E7D32'
                        : '#1976D2',
                  }}
                >
                  {selectedFeedback.type}
                </Text>
              </View>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                {new Date(selectedFeedback.createdAt).toLocaleString()}
              </Text>
            </View>

            <Text style={styles.detailMsg}>{selectedFeedback.message}</Text>

            {selectedFeedback.images?.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                {selectedFeedback.images.map((img, i) => (
                  <TouchableOpacity
                    key={i}
                    activeOpacity={0.9}
                    onPress={() =>
                      navigation.navigate('ImageViewer', {
                        images: selectedFeedback.images,
                        index: i,
                      })
                    }
                  >
                    <Image
                      source={{ uri: img }}
                      style={styles.fullImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Divider style={{ marginVertical: 20 }} />

            <View style={styles.userRow}>
              <View style={styles.avatar}>
                {selectedFeedback.user?.userImage ? (
                  <Image
                    source={{ uri: selectedFeedback.user.userImage }}
                    style={{ width: 44, height: 44 }}
                  />
                ) : (
                  <User size={22} color={theme.colors.onSurfaceVariant} />
                )}
              </View>
              <View>
                <Text style={styles.userName}>
                  {selectedFeedback.user?.fullName || 'Anonymous'}
                </Text>
                <Text style={styles.userEmail}>
                  {selectedFeedback.user?.email}
                </Text>
              </View>
            </View>

            {selectedFeedback.status !== 'Resolved' && (
              <Button
                mode="contained"
                onPress={() => handleResolveFeedback(selectedFeedback._id)}
                loading={resolving}
                disabled={resolving}
                style={[styles.resolveBtn, { backgroundColor: '#2E7D32' }]}
                icon={() => <CheckCircle2 size={18} color="#FFF" />}
              >
                Mark as Resolved
              </Button>
            )}
          </ScrollView>
        )}
      </BottomSheet>
    </SafeAreaView>
  );
};

export default AdminPanelScreen;
