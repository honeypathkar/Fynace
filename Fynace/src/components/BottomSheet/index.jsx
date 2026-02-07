import React, {
  forwardRef,
  useImperativeHandle,
  useCallback,
  useState,
  useEffect,
} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from 'react-native';
import { Check, X } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import styles, { themeColors, spacing } from './styles';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const BottomSheet = forwardRef(
  (
    {
      title,
      options = [],
      selectedValue,
      onSelect,
      children,
      footer,
      containerStyle,
      contentStyle,
      initialHeight = 0.4, // Default to 40% of screen height
      isMultiSelect = false,
      onClose,
    },
    ref,
  ) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Dynamic snap points based on initialHeight prop
    const SNAP_POINTS = {
      CLOSED: SCREEN_HEIGHT,
      MID: SCREEN_HEIGHT * (1 - initialHeight),
      FULL: SCREEN_HEIGHT * 0.1, // Max 90% height (10% from top)
    };

    const translateY = useSharedValue(SNAP_POINTS.CLOSED);

    const close = useCallback(() => {
      translateY.value = withTiming(
        SNAP_POINTS.CLOSED,
        { duration: 200 },
        finished => {
          if (finished) {
            runOnJS(setIsVisible)(false);
            runOnJS(setIsExpanded)(false);
            if (onClose) {
              runOnJS(onClose)();
            }
          }
        },
      );
    }, [translateY, SNAP_POINTS.CLOSED, onClose]);

    const open = useCallback(() => {
      setIsVisible(true);
      requestAnimationFrame(() => {
        setTimeout(() => {
          translateY.value = withSpring(SNAP_POINTS.MID, {
            damping: 18,
            stiffness: 120,
            mass: 0.8,
          });
        }, 100);
      });
    }, [translateY, SNAP_POINTS.MID]);

    useImperativeHandle(ref, () => ({
      open,
      close,
    }));

    useEffect(() => {
      const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
        translateY.value = withSpring(SNAP_POINTS.FULL, {
          damping: 20,
          stiffness: 100,
        });
      });
      const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
        if (!isExpanded) {
          translateY.value = withSpring(SNAP_POINTS.MID, {
            damping: 18,
            stiffness: 110,
          });
        }
      });

      return () => {
        showSubscription.remove();
        hideSubscription.remove();
      };
    }, [SNAP_POINTS.FULL, SNAP_POINTS.MID, isExpanded, translateY]);

    const startY = useSharedValue(0);

    const pan = Gesture.Pan()
      .onStart(() => {
        startY.value = translateY.value;
      })
      .onUpdate(event => {
        const newValue = startY.value + event.translationY;
        if (newValue >= SNAP_POINTS.FULL && newValue <= SNAP_POINTS.CLOSED) {
          translateY.value = newValue;
        }
      })
      .onEnd(event => {
        const currentPos = translateY.value;
        const velocityY = event.velocityY;

        // Snapping logic
        if (velocityY > 500 || currentPos > SNAP_POINTS.MID + 150) {
          runOnJS(close)();
        } else if (velocityY < -500 || currentPos < SNAP_POINTS.MID - 50) {
          translateY.value = withSpring(SNAP_POINTS.FULL, {
            damping: 20,
            stiffness: 100,
          });
          runOnJS(setIsExpanded)(true);
        } else {
          translateY.value = withSpring(SNAP_POINTS.MID, {
            damping: 18,
            stiffness: 110,
          });
          runOnJS(setIsExpanded)(false);
        }
      });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
      height: SCREEN_HEIGHT,
    }));

    const contentAnimatedStyle = useAnimatedStyle(() => {
      // The visible height of the sheet is SCREEN_HEIGHT minus the current translateY
      const visibleHeight = SCREEN_HEIGHT - translateY.value;
      return {
        height: visibleHeight,
      };
    });

    const handleSelect = value => {
      if (onSelect) {
        onSelect(value);
      }
      if (!isMultiSelect) {
        close();
      }
    };

    const isOptionActive = value => {
      if (isMultiSelect && Array.isArray(selectedValue)) {
        return selectedValue.includes(value);
      }
      return selectedValue === value;
    };

    return (
      <Modal
        transparent
        animationType="none"
        visible={isVisible}
        onRequestClose={close}
        statusBarTranslucent
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={close}>
              <View style={styles.modalBackdrop} />
            </TouchableWithoutFeedback>

            <Animated.View
              style={[
                styles.modalContainer,
                {
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                },
                containerStyle,
                animatedStyle,
              ]}
            >
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
              >
                <Animated.View
                  style={[
                    {
                      paddingBottom:
                        Platform.OS === 'ios' ? spacing.xxl : spacing.m,
                    },
                    contentAnimatedStyle,
                  ]}
                >
                  <GestureDetector gesture={pan}>
                    <View style={{ backgroundColor: 'transparent' }}>
                      <View style={styles.sheetHandleWrapper}>
                        <View style={styles.sheetHandle} />
                      </View>

                      <View style={styles.modalHeader}>
                        {title ? (
                          <Text style={styles.modalTitle}>{title}</Text>
                        ) : null}
                        <TouchableOpacity
                          onPress={close}
                          style={styles.modalCloseButton}
                          activeOpacity={0.85}
                        >
                          <X size={20} color={themeColors.primaryText2} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </GestureDetector>

                  <View style={[styles.modalContent, contentStyle]}>
                    {options.length > 0 ? (
                      <ScrollView
                        style={{ flex: 1 }}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: spacing.xl }}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled={true}
                      >
                        <View style={styles.optionsList}>
                          {options.map(option => {
                            const isActive = isOptionActive(option.value);
                            return (
                              <TouchableOpacity
                                key={option.value}
                                style={[
                                  styles.sheetOption,
                                  isActive && styles.sheetOptionActive,
                                ]}
                                activeOpacity={0.85}
                                onPress={() => handleSelect(option.value)}
                              >
                                <Text
                                  style={[
                                    styles.sheetOptionLabel,
                                    !isActive && styles.sheetOptionLabelMuted,
                                  ]}
                                >
                                  {option.label}
                                </Text>
                                {isActive ? (
                                  <Check
                                    size={20}
                                    color={themeColors.accentPrimary}
                                    style={styles.sheetOptionIcon}
                                  />
                                ) : null}
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </ScrollView>
                    ) : (
                      children
                    )}
                  </View>

                  {footer ? (
                    <View style={styles.sheetFooter}>{footer}</View>
                  ) : null}
                </Animated.View>
              </KeyboardAvoidingView>
            </Animated.View>
          </View>
        </GestureHandlerRootView>
      </Modal>
    );
  },
);

BottomSheet.displayName = 'BottomSheet';

export default BottomSheet;
