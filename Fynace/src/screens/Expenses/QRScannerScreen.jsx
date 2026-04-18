import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Text, ActivityIndicator, useTheme } from 'react-native-paper';
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
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import RNQRGenerator from 'rn-qr-generator';
import Fonts from '../../../assets/fonts';

const QRScannerScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [hasPermission, setHasPermission] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const device = useCameraDevice('back');

  useEffect(() => {
    if (isFocused) {
      setIsActive(true);
    }
  }, [isFocused]);

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
      setIsActive(false);

      let initialValues = {
        price: '',
        name: '',
        notes: '',
        upiId: '',
      };

      if (data.includes('upi://pay')) {
        try {
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
          initialValues.allParams = params;

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

  const styles = useMemo(() => getStyles(theme), [theme]);

  if (!hasPermission) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={theme.colors.secondary} />
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
      <StatusBar backgroundColor={theme.colors.background} barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Scan QR Code</Text>
        <TouchableOpacity
          style={styles.galleryButton}
          onPress={handleGalleryUpload}
        >
          <ImageIcon size={24} color={theme.colors.text} />
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
                <Flashlight size={24} color={torchOn ? '#FFF' : theme.colors.text} />
              </View>
              <Text style={[styles.torchText, torchOn && { color: theme.colors.secondary }]}>
                {torchOn ? 'Flash On' : 'Flash Off'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.secondary} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  permissionText: {
    color: theme.colors.onSurfaceVariant,
    fontFamily: Fonts.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.background,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.semibold,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceVariant,
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
    borderColor: theme.colors.chartSecondary,
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
    color: '#FFFFFF',
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
    backgroundColor: theme.colors.secondary,
  },
  torchText: {
    color: '#FFFFFF',
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
