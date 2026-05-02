import { NativeModules, Platform } from 'react-native';

const { WidgetModule } = NativeModules;

/**
 * Update the Android home screen widget with fresh data
 * @param {Object} data - { amount: string, range: string, progress: number, bars: number[] }
 */
export const updateAppWidget = (data) => {
  if (Platform.OS !== 'android' || !WidgetModule) return;

  try {
    WidgetModule.updateWidget({
      ...data,
      amount: data.amount || '₹0',
      range: data.range || 'Current Month',
    });
    console.log('📊 Widget updated successfully');
  } catch (error) {
    console.error('❌ Failed to update widget:', error);
  }
};
