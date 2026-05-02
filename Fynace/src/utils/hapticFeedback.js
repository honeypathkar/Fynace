import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HAPTIC_ENABLED_KEY = '@fynace/haptic-enabled';

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export const triggerHaptic = async (type = 'impactMedium') => {
  try {
    const isEnabled = await AsyncStorage.getItem(HAPTIC_ENABLED_KEY);
    // Default to true if not set
    if (isEnabled === null || isEnabled === 'true') {
      ReactNativeHapticFeedback.trigger(type, options);
    }
  } catch (error) {
    console.warn('Haptic trigger failed', error);
  }
};

export const setHapticEnabled = async (enabled) => {
  try {
    await AsyncStorage.setItem(HAPTIC_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch (error) {
    console.error('Failed to save haptic preference', error);
  }
};

export const getHapticEnabled = async () => {
  try {
    const isEnabled = await AsyncStorage.getItem(HAPTIC_ENABLED_KEY);
    return isEnabled === null || isEnabled === 'true';
  } catch (error) {
    return true;
  }
};
