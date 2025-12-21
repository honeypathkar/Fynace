import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  Animated,
  PanResponder,
  Platform,
  StatusBar,
} from 'react-native';
import { X } from 'lucide-react-native';
import { themeAssets } from '../../theme';
import styles from './styles';

const renderMedia = media => {
  if (!media) {
    return null;
  }
  if (React.isValidElement(media)) {
    return media;
  }
  if (typeof media === 'number' || media?.uri) {
    return (
      <Image
        source={media}
        style={{
          width: 120,
          height: 120,
          borderRadius: 18,
        }}
        resizeMode="cover"
      />
    );
  }
  return null;
};

const BottomSheet = forwardRef(
  ({ title, children, image, footer, containerStyle, onClose }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const translateY = useRef(new Animated.Value(400)).current;
    const dragY = useRef(new Animated.Value(0)).current;
    const [statusBarStyle, setStatusBarStyle] = useState(null);

    const animateTo = value =>
      Animated.spring(translateY, {
        toValue: value,
        useNativeDriver: true,
        friction: 7,
        tension: 90,
      }).start();

    const resetDrag = () =>
      Animated.spring(dragY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 9,
        tension: 80,
      }).start();

    useEffect(() => {
      if (isVisible && Platform.OS === 'android') {
        // Store current StatusBar style
        StatusBar.getBackgroundColor?.((color) => {
          // For Android 14+, we need to ensure StatusBar is visible
        });
      }
    }, [isVisible]);

    useImperativeHandle(ref, () => ({
      open: () => {
        dragY.setValue(0);
        setIsVisible(true);
        if (Platform.OS === 'android') {
          // Set StatusBar to light content for better visibility on dark modal
          StatusBar.setBarStyle('light-content', true);
        }
        requestAnimationFrame(() => animateTo(0));
      },
      close: () => {
        dragY.setValue(0);
        animateTo(400);
        setTimeout(() => {
          setIsVisible(false);
          if (Platform.OS === 'android') {
            // Reset StatusBar to previous style
            StatusBar.setBarStyle('light-content', true);
          }
          if (onClose) {
            onClose();
          }
        }, 250);
      },
    }));

    const handleClose = () => {
      animateTo(400);
      setTimeout(() => {
        dragY.setValue(0);
        setIsVisible(false);
        if (onClose) {
          onClose();
        }
      }, 250);
    };

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 5,
        onPanResponderMove: (_, gesture) => {
          if (gesture.dy > 0) {
            dragY.setValue(gesture.dy);
          }
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy > 100) {
            handleClose();
          } else {
            resetDrag();
          }
        },
      }),
    ).current;

    return (
      <Modal
        transparent
        animationType="none"
        visible={isVisible}
        onRequestClose={handleClose}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        {Platform.OS === 'android' && isVisible && (
          <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
            translucent
          />
        )}
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          <Animated.View
            style={[
              styles.modalContainer,
              containerStyle,
              {
                transform: [{ translateY: Animated.add(translateY, dragY) }],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <TouchableOpacity
              style={styles.sheetHandleWrapper}
              activeOpacity={0.8}
              onPress={handleClose}
            >
              <View style={styles.sheetHandle} />
            </TouchableOpacity>
            <View style={styles.modalHeader}>
              {title ? <Text style={styles.modalTitle}>{title}</Text> : null}
              <TouchableOpacity
                onPress={handleClose}
                style={styles.modalCloseButton}
                activeOpacity={0.85}
              >
                <X size={20} color="#F8FAFC" />
              </TouchableOpacity>
            </View>
            {image ? (
              <View style={styles.modalImageContainer}>
                {renderMedia(image)}
              </View>
            ) : null}
            <View style={styles.modalContent}>{children}</View>
            {footer ? <View style={styles.sheetFooter}>{footer}</View> : null}
          </Animated.View>
        </View>
      </Modal>
    );
  },
);

BottomSheet.displayName = 'BottomSheet';

export default BottomSheet;
