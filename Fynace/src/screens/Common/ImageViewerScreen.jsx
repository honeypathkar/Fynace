import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  StatusBar,
  FlatList,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Download, Share2, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const ZoomableImage = ({ uri }) => {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withTiming(1);
        savedScale.value = 1;
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        savedScale.value = scale.value;
      }
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      if (scale.value > 1) {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const composed = Gesture.Simultaneous(pinchGesture, panGesture);

  return (
    <View style={styles.imageContainer}>
      <GestureDetector gesture={composed}>
        <Animated.Image
          source={{ uri }}
          style={[styles.fullImage, animatedStyle]}
          resizeMode="contain"
        />
      </GestureDetector>
    </View>
  );
};

const ImageViewerScreen = ({ route, navigation }) => {
  const { images, index = 0 } = route.params;
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(index);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar 
          barStyle={theme.dark ? 'light-content' : 'dark-content'} 
          backgroundColor={theme.colors.background} 
        />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.iconBtn, { backgroundColor: theme.colors.surfaceVariant }]}
          >
            <X color={theme.colors.onSurface} size={24} />
          </TouchableOpacity>
          
          <Text style={[styles.counter, { color: theme.colors.onSurface }]}>
            {currentIndex + 1} / {images.length}
          </Text>

          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={images}
          renderItem={({ item }) => <ZoomableImage uri={item} />}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={index}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentIndex(newIndex);
          }}
          keyExtractor={(_, i) => i.toString()}
        />

        {images.length > 1 && (
          <View style={styles.footer}>
            <View style={styles.dotContainer}>
              {images.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    { backgroundColor: theme.colors.onSurfaceVariant + '4D' }, // 30% opacity
                    currentIndex === i && { 
                      backgroundColor: theme.colors.primary,
                      width: 20 
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 60,
    zIndex: 10,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 20,
  },
  counter: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    width,
    height: height - 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dotContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default ImageViewerScreen;
