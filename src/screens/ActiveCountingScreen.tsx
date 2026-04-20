import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ScreenLayout } from '../components/ScreenLayout';
import { TYPOGRAPHY } from '../theme/theme';
import { useTheme } from '../theme/ThemeContext';
import * as Haptics from 'expo-haptics';

type Props = NativeStackScreenProps<RootStackParamList, 'ActiveCounting'>;

export default function ActiveCountingScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { durationLabel, durationMs } = route.params;
  const startTime = useRef<number>(0);

  useEffect(() => {
    // Reset start time on mount
    startTime.current = Date.now();
  }, []);

  const handleStop = () => {
    const guessedMs = Date.now() - startTime.current;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.replace('Result', { durationLabel, durationMs, guessedMs });
  };

  return (
    <ScreenLayout>
      <Pressable style={styles.content} onPress={handleStop}>
        <Text style={[TYPOGRAPHY.bodyLg, styles.hint, { color: colors.primary }]}>Counting...</Text>
        <Text style={[TYPOGRAPHY.displayLg, styles.targetText, { color: colors.onSurface }]}>
          Target: {durationLabel}
        </Text>
        <Text style={[TYPOGRAPHY.bodyMd, styles.tapHint, { color: colors.onSurfaceVariant }]}>Tap anywhere when time is up</Text>
      </Pressable>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hint: {
    marginBottom: 16,
  },
  targetText: {
    opacity: 0.5,
    marginBottom: 40,
    lineHeight: 72,
  },
  tapHint: {
    position: 'absolute',
    bottom: 60,
  }
});
