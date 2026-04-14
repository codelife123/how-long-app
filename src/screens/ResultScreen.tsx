import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ScreenLayout } from '../components/ScreenLayout';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../theme/theme';
import { savePB, saveHistory } from '../utils/storage';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export default function ResultScreen({ navigation, route }: Props) {
  const { durationLabel, durationMs, guessedMs } = route.params;
  const [isPB, setIsPB] = useState(false);

  const diffMs = guessedMs - durationMs;
  const diffSec = diffMs / 1000;
  const absDiff = Math.abs(diffSec);

  useEffect(() => {
    const handleSave = async () => {
      const newPB = await savePB(durationLabel, diffMs);
      if (newPB) {
        // Wait for screen transition (fade) and layout to settle 
        // to prevent heavy frame drops during the confetti mount
        setTimeout(() => {
          setIsPB(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 400);
      }
      await saveHistory({ durationLabel, durationMs, guessedMs });
    };
    handleSave();
  }, [durationLabel, diffMs, durationMs, guessedMs]);

  const goToHome = () => {
    navigation.replace('Home');
  };

  return (
    <ScreenLayout>
      <View style={styles.content}>
        <Text style={[TYPOGRAPHY.headlineLg, styles.title]}>Result</Text>
        
        <View style={styles.glassCard}>
          <Text style={TYPOGRAPHY.bodyLg}>Actual Time</Text>
          <Text style={[TYPOGRAPHY.displayLg, { color: COLORS.primary }]}>
            {(guessedMs / 1000).toFixed(2)}s
          </Text>
          
          <View style={styles.separator} />
          
          <Text style={TYPOGRAPHY.bodyMd}>
            Target was {durationLabel} ({(durationMs / 1000)}s)
          </Text>
          
          <Text style={[TYPOGRAPHY.titleLg, styles.diffText, { color: diffSec === 0 ? COLORS.primary : diffSec < 0 ? '#ffb2b9' : COLORS.tertiaryContainer }]}>
            {diffSec === 0 ? 'Perfect!' : `${diffSec > 0 ? '+' : '-'}${absDiff.toFixed(2)}s`}
          </Text>
          
          {isPB && (
             <View style={styles.pbBadge}>
                <Text style={styles.pbText}>NEW PERSONAL BEST!</Text>
             </View>
          )}
        </View>

        <Pressable 
          style={({ pressed }) => [
            styles.backButton,
            pressed && { transform: [{ scale: 0.95 }] }
          ]}
          onPress={goToHome}
        >
          <Text style={styles.backText}>Return Home</Text>
        </Pressable>
      </View>
      {isPB && (
        <ConfettiCannon
          count={75}
          origin={{x: -10, y: 0}}
          colors={[COLORS.primary, COLORS.tertiaryContainer, '#aa8cf9', '#d73357']}
          fadeOut={true}
          fallSpeed={2500}
          explosionSpeed={350}
        />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: 40,
  },
  glassCard: {
    width: '100%',
    backgroundColor: COLORS.surfaceVariant, // 40% opacity from theme
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 40,
  },
  separator: {
    height: 1,
    width: '80%',
    backgroundColor: COLORS.outlineVariant,
    marginVertical: 24,
  },
  diffText: {
    marginTop: 16,
  },
  pbBadge: {
    marginTop: 24,
    backgroundColor: COLORS.primaryContainer,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    ...SHADOWS.glowSelected,
  },
  pbText: {
    ...TYPOGRAPHY.labelSm,
    color: '#000000',
    fontWeight: 'bold',
  },
  backButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  backText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
  }
});
