import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ScreenLayout } from '../components/ScreenLayout';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../theme/theme';
import * as Haptics from 'expo-haptics';

type Props = NativeStackScreenProps<RootStackParamList, 'GetReady'>;

export default function GetReadyScreen({ navigation, route }: Props) {
  const { durationLabel, durationMs } = route.params;

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    navigation.replace('ActiveCounting', { durationLabel, durationMs });
  };

  return (
    <ScreenLayout>
      <View style={styles.content}>
        <View style={styles.centerBox}>
          <Text style={[TYPOGRAPHY.headlineLg, styles.instructions]}>
            Close your eyes, feel the time.
          </Text>
          <Text style={[TYPOGRAPHY.bodyLg, styles.targetText]}>
            Target: {durationLabel}
          </Text>
        </View>

        <Pressable 
          style={({ pressed }) => [
            styles.startButton,
            pressed && { transform: [{ scale: 0.95 }] }
          ]}
          onPress={handleStart}
        >
          <Text style={styles.startText}>START</Text>
        </Pressable>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructions: {
    textAlign: 'center',
    marginBottom: 24,
  },
  targetText: {
    color: COLORS.primary,
    textAlign: 'center',
  },
  startButton: {
    width: 140,
    height: 140,
    borderRadius: 70, // rounded-full
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
    ...SHADOWS.ambientGlow,
  },
  startText: {
    ...TYPOGRAPHY.titleLg,
    color: COLORS.onPrimary,
  }
});
