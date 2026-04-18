import React, {
  forwardRef,
  useImperativeHandle,
  useCallback,
  useState,
  useEffect,
  useRef,
  useMemo,
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
  Keyboard,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { Check, X, Plus } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from 'react-native-paper';
import { getStyles, getThemeColors, spacing } from './styles';

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
      initialHeight = 0.4,
      isMultiSelect = false,
      onClose,
      onOpen,
      stickyFooter = false,
      backgroundColor,
      titleColor,
      scrollEnabled = true,
    },
    ref,
  ) => {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const themeColors = useMemo(() => getThemeColors(theme), [theme]);
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const SNAP_POINTS = {
      CLOSED: SCREEN_HEIGHT,
      MID: SCREEN_HEIGHT * (1 - initialHeight),
      FULL: SCREEN_HEIGHT * 0.1,
    };

    const translateY = useSharedValue(SNAP_POINTS.CLOSED);
    const backdropOpacity = useSharedValue(0);

    const close = useCallback(() => {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(
        SNAP_POINTS.CLOSED,
        { duration: 250 },
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
    }, [translateY, backdropOpacity, SNAP_POINTS.CLOSED, onClose]);

    const open = useCallback(() => {
      setIsVisible(true);
      backdropOpacity.value = withTiming(1, { duration: 300 });
      if (onOpen) onOpen();
      requestAnimationFrame(() => {
        setTimeout(() => {
          translateY.value = withSpring(SNAP_POINTS.MID, {
            damping: 18,
            stiffness: 120,
            mass: 0.8,
          });
        }, 50);
      });
    }, [translateY, backdropOpacity, SNAP_POINTS.MID, onOpen]);

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
    const scrollOffset = useSharedValue(0);
    const scrollViewRef = useRef(null);

    const scrollHandler = useAnimatedScrollHandler({
      onScroll: (event) => {
        scrollOffset.value = event.contentOffset.y;
      },
    });

    const handlePan = Gesture.Pan()
      .activeOffsetY([-12, 12])
      .failOffsetX([-15, 15])
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

        if (velocityY > 500 || currentPos > SNAP_POINTS.MID + 150) {
          runOnJS(close)();
        } else if (velocityY < -500 || currentPos < SNAP_POINTS.MID - 50) {
          translateY.value = withSpring(SNAP_POINTS.FULL, { damping: 20, stiffness: 100 });
          runOnJS(setIsExpanded)(true);
        } else {
          translateY.value = withSpring(SNAP_POINTS.MID, { damping: 18, stiffness: 110 });
          runOnJS(setIsExpanded)(false);
        }
      });

    const contentPan = Gesture.Pan()
      .minDistance(20)
      .activeOffsetY([40, 100])
      .failOffsetY([-100, -30])
      .failOffsetX([-15, 15])
      .onStart(() => {
        startY.value = translateY.value;
      })
      .onUpdate(event => {
        if (scrollOffset.value <= 0) {
          const newValue = startY.value + event.translationY;
          if (newValue >= SNAP_POINTS.FULL && newValue <= SNAP_POINTS.CLOSED) {
            translateY.value = newValue;
          }
        }
      })
      .onEnd(event => {
        if (scrollOffset.value <= 0) {
          const currentPos = translateY.value;
          const velocityY = event.velocityY;
          if (velocityY > 500 || currentPos > SNAP_POINTS.MID + 150) {
            runOnJS(close)();
          } else if (velocityY < -500 || currentPos < SNAP_POINTS.MID - 50) {
            translateY.value = withSpring(SNAP_POINTS.FULL, { damping: 20, stiffness: 100 });
            runOnJS(setIsExpanded)(true);
          } else {
            translateY.value = withSpring(SNAP_POINTS.MID, { damping: 18, stiffness: 110 });
            runOnJS(setIsExpanded)(false);
          }
        }
      });

    const native = Gesture.Native();
    const combinedGesture = Gesture.Simultaneous(contentPan, native);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
      height: SCREEN_HEIGHT,
    }));

    const backdropAnimatedStyle = useAnimatedStyle(() => ({
      opacity: backdropOpacity.value,
    }));

    const contentAnimatedStyle = useAnimatedStyle(() => {
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

    const compactScrollWithFooter = Boolean(
      stickyFooter && footer && scrollEnabled && options.length > 0,
    );

    const renderOptionRow = option => {
      const isActive = isOptionActive(option.value);
      const showPlus = Boolean(option.showPlusIcon);
      const LeftIcon = option.LeftIcon;
      
      return (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.sheetOption,
            showPlus && styles.sheetOptionActionRow,
            isActive && !showPlus && styles.sheetOptionActive,
          ]}
          activeOpacity={0.85}
          onPress={() => handleSelect(option.value)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 }}>
            {LeftIcon && !showPlus ? (
              <LeftIcon
                size={20}
                color={option.leftIconColor ?? themeColors.primaryText2}
                style={{ marginRight: spacing.s }}
              />
            ) : null}
            <Text
              style={[
                styles.sheetOptionLabel,
                !isActive && !showPlus && styles.sheetOptionLabelMuted,
                showPlus && styles.sheetOptionLabelAction,
                option.color && !showPlus ? { color: option.color } : null,
                { flex: 1, flexShrink: 1 },
              ]}
            >
              {option.label}
            </Text>
          </View>
          {showPlus ? (
            <Plus size={20} color={themeColors.primaryBackground} style={styles.sheetOptionIcon} />
          ) : isActive && !showPlus ? (
            <Check size={20} color={themeColors.accentPrimary} style={styles.sheetOptionIcon} />
          ) : null}
        </TouchableOpacity>
      );
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
              <Animated.View style={[styles.modalBackdrop, backdropAnimatedStyle]} />
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
                backgroundColor ? { backgroundColor } : null,
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
                  <GestureDetector gesture={handlePan}>
                    <View style={styles.dragHandleArea}>
                      <View style={styles.sheetHandleWrapper}>
                        <View style={[
                          styles.sheetHandle,
                          backgroundColor ? { backgroundColor: 'rgba(255,255,255,0.2)' } : null
                        ]} />
                      </View>

                      <View style={styles.modalHeader}>
                        {title ? (
                          <Text style={[
                            styles.modalTitle,
                            titleColor ? { color: titleColor } : null
                          ]}>
                            {title}
                          </Text>
                        ) : null}
                        <TouchableOpacity
                          onPress={close}
                          style={styles.modalCloseButton}
                          activeOpacity={0.85}
                        >
                          <X size={20} color={titleColor || themeColors.primaryText2} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </GestureDetector>

                  <View style={[
                    compactScrollWithFooter ? styles.modalContentNoFlex : styles.modalContent,
                    contentStyle
                  ]}>
                    {scrollEnabled ? (
                      <GestureDetector gesture={combinedGesture}>
                        <Animated.ScrollView
                          ref={scrollViewRef}
                          onScroll={scrollHandler}
                          scrollEventThrottle={16}
                          style={compactScrollWithFooter ? { flexGrow: 0, flexShrink: 1 } : { flex: 1 }}
                          showsVerticalScrollIndicator={false}
                          contentContainerStyle={[
                            { paddingTop: spacing.s },
                            compactScrollWithFooter 
                              ? { paddingBottom: spacing.s, flexGrow: 0 } 
                              : { paddingBottom: spacing.xl }
                          ]}
                          keyboardShouldPersistTaps="handled"
                          nestedScrollEnabled={true}
                        >
                          {options.length > 0 && (
                            <View style={styles.optionsList}>
                              {options.map(renderOptionRow)}
                            </View>
                          )}
                          {children}
                        </Animated.ScrollView>
                      </GestureDetector>
                    ) : (
                      <View style={{ paddingBottom: spacing.xl, paddingTop: spacing.s, flex: 1 }}>
                        {children}
                      </View>
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
