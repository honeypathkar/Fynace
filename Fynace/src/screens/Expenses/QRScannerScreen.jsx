import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
  Alert,
  Linking,
  StatusBar,
  PermissionsAndroid,
} from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Image as ImageIcon,
  Flashlight,
} from 'lucide-react-native';
import {
  Camera,
  useCameraDevices,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import RNQRGenerator from 'rn-qr-generator';
import Fonts from '../../../assets/fonts';

const QRScannerScreen = () => {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const device = useCameraDevice('back');

  useEffect(() => {
    const requestPermission = async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to scan QR codes.',
          [
            { text: 'Cancel', onPress: () => navigation.goBack() },
            { text: 'Settings', onPress: () => Linking.openSettings() },
          ],
        );
      }
    };
    requestPermission();
  }, [navigation]);

  const handleScannedData = useCallback(
    data => {
      console.log('🔍 Raw Scanned QR Data:', data);
      // Prevent multiple navigations
      setIsActive(false);

      let initialValues = {
        price: '',
        name: '',
        notes: '',
        upiId: '',
      };

      if (data.includes('upi://pay')) {
        try {
          // Parse all query parameters to ensure merchant static QRs work
          const queryString = data.split('?')[1];
          const params = {};
          if (queryString) {
            queryString.split('&').forEach(pair => {
              const [key, value] = pair.split('=');
              params[key] = decodeURIComponent(value || '');
            });
          }

          initialValues.upiId = params.pa || '';
          initialValues.name = params.pn || '';
          initialValues.price = params.am || '';
          initialValues.allParams = params; // Pass everything back

          console.log('✅ Parsed UPI Parameters:', params);
        } catch (e) {
          initialValues.notes = data;
        }
      } else {
        initialValues.notes = data;
      }

      navigation.navigate('AddQRBasedExpense', { initialValues });
    },
    [navigation],
  );

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (codes.length > 0 && isActive) {
        const data = codes[0].value;
        if (data) {
          handleScannedData(data);
        }
      }
    },
  });

  const handleGalleryUpload = async () => {
    try {
      setLoading(true);

      // Request permissions for gallery
      if (Platform.OS === 'android') {
        let permission;
        if (Platform.Version >= 33) {
          permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
        } else {
          permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        }

        const hasPermission = await PermissionsAndroid.check(permission);
        if (!hasPermission) {
          const status = await PermissionsAndroid.request(permission, {
            title: 'Gallery Permission',
            message:
              'Fynace needs access to your gallery to scan QR codes from images.',
            buttonPositive: 'OK',
          });
          if (status !== PermissionsAndroid.RESULTS.GRANTED) {
            setLoading(false);
            return;
          }
        }
      }

      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
      });

      if (result.didCancel) {
        setLoading(false);
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        // Use RNQRGenerator to detect QR code from the selected image
        RNQRGenerator.detect({
          uri: imageUri,
        })
          .then(res => {
            const { values } = res;
            if (values && values.length > 0) {
              handleScannedData(values[0]);
            } else {
              Alert.alert(
                'No QR Found',
                'No QR code was detected in the selected image. Please try another photo or scan directly.',
              );
            }
          })
          .catch(err => {
            console.error('QR Detection Error:', err);
            Alert.alert('Error', 'Failed to scan the selected image.');
          });
      }
    } catch (err) {
      console.warn('Gallery pick error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!hasPermission) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color="#3A6FF8" />
        <Text style={styles.permissionText}>
          Waiting for camera permission...
        </Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.permissionText}>No camera device found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0F172A" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={28} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <TouchableOpacity
          style={styles.galleryButton}
          onPress={handleGalleryUpload}
        >
          <ImageIcon size={24} color="#F8FAFC" />
        </TouchableOpacity>
      </View>

      <View style={styles.scannerWrapper}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isActive}
          codeScanner={codeScanner}
          torch={torchOn ? 'on' : 'off'}
        />

        {/* Overlay Mask */}
        <View style={styles.overlay}>
          <View style={[styles.unfocusedContainer, { flex: 0.4 }]}></View>
          <View style={styles.focusedRow}>
            <View style={styles.unfocusedContainer}></View>
            <View style={styles.focusedContainer}>
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
            </View>
            <View style={styles.unfocusedContainer}></View>
          </View>
          <View style={[styles.unfocusedContainer, { flex: 1.6 }]}>
            <Text style={styles.topText}>
              Center the QR code within the frame
            </Text>

            <TouchableOpacity
              style={styles.torchButton}
              onPress={() => setTorchOn(!torchOn)}
            >
              <View
                style={[
                  styles.torchIconBg,
                  torchOn && styles.torchIconBgActive,
                ]}
              >
                <Flashlight size={24} color={torchOn ? '#FFF' : '#F8FAFC'} />
              </View>
              <Text style={[styles.torchText, torchOn && { color: '#3A6FF8' }]}>
                {torchOn ? 'Flash On' : 'Flash Off'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#3A6FF8" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Match header for status bar
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  permissionText: {
    color: '#94A3B8',
    fontFamily: Fonts.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0F172A',
    zIndex: 10,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontFamily: Fonts.semibold,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerWrapper: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unfocusedContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusedRow: {
    flexDirection: 'row',
    height: 250,
  },
  focusedContainer: {
    width: 250,
    height: 250,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#3A6FF8',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 20,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 20,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 20,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 20,
  },
  topText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontFamily: Fonts.medium,
    marginBottom: 40,
  },
  torchButton: {
    alignItems: 'center',
    gap: 8,
  },
  torchIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  torchIconBgActive: {
    backgroundColor: '#3A6FF8',
  },
  torchText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QRScannerScreen;
