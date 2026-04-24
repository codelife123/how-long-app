import * as ExpoHaptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

let isHapticsEnabled = true;

AsyncStorage.getItem('@howlong_haptics').then(val => {
  if (val === 'false') isHapticsEnabled = false;
});

export const setHapticsEnabled = (enabled: boolean) => {
  isHapticsEnabled = enabled;
  AsyncStorage.setItem('@howlong_haptics', enabled ? 'true' : 'false');
};

export const getHapticsEnabled = () => isHapticsEnabled;

export const impactAsync = async (style: ExpoHaptics.ImpactFeedbackStyle) => {
  if (isHapticsEnabled) await ExpoHaptics.impactAsync(style);
};

export const notificationAsync = async (type: ExpoHaptics.NotificationFeedbackType) => {
  if (isHapticsEnabled) await ExpoHaptics.notificationAsync(type);
};

export const selectionAsync = async () => {
  if (isHapticsEnabled) await ExpoHaptics.selectionAsync();
};

export { ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics';
