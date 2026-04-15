import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ScreenLayout } from '../components/ScreenLayout';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../theme/theme';
import { savePB, saveHistory } from '../utils/storage';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export default function ResultScreen({ navigation, route }: Props) {
  const { durationLabel, durationMs, guessedMs } = route.params;
  const [isPB, setIsPB] = useState(false);

  const diffMs = guessedMs - durationMs;
  const diffSec = diffMs / 1000;
  const absDiff = Math.abs(diffSec);

  const durationSec = durationMs / 1000;
  const accuracy = Math.max(0, 100 - (absDiff / durationSec) * 100);
  
  let insightMessage = '';
  let accuracyLabel = '';
  if (accuracy === 100) {
     insightMessage = "Absolute perfection. Your internal clock is perfectly synchronized with reality.";
     accuracyLabel = "PERFECT TIMING";
  } else if (accuracy >= 95) {
     insightMessage = `Your internal clock is remarkably consistent. You were merely a fraction off the mark.`;
     accuracyLabel = "EXCELLENT ACCURACY";
  } else if (accuracy >= 80) {
     insightMessage = `A solid grasp of time. With a little more focus, you can bridge that narrow gap.`;
     accuracyLabel = "GOOD ACCURACY";
  } else if (accuracy >= 60) {
     insightMessage = `Your perception is slightly distorted. The flow of time felt a bit different to you.`;
     accuracyLabel = "FAIR ACCURACY";
  } else {
     insightMessage = `Time ran away from you this round. Close your eyes and try to feel the real pulse.`;
     accuracyLabel = "NEEDS FOCUS";
  }

  const pbPulseScale = useRef(new Animated.Value(1)).current;
  const progressBarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressBarAnim, {
      toValue: accuracy,
      duration: 1500,
      useNativeDriver: false, // Cannot use native driver for width
      easing: Easing.out(Easing.cubic)
    }).start();

    const handleSave = async () => {
      const newPB = await savePB(durationLabel, diffMs);
      if (newPB) {
        setTimeout(() => {
          setIsPB(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Animated.loop(
            Animated.sequence([
              Animated.timing(pbPulseScale, { toValue: 1.05, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
              Animated.timing(pbPulseScale, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) })
            ])
          ).start();
        }, 400);
      }
      await saveHistory({ durationLabel, durationMs, guessedMs });
    };
    handleSave();
  }, [durationLabel, diffMs, durationMs, guessedMs, accuracy, pbPulseScale, progressBarAnim]);

  const animatedWidth = progressBarAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });

  const goHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.replace('Home');
  };

  const tryAgain = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    navigation.replace('GetReady', { durationLabel, durationMs });
  };

  return (
    <ScreenLayout>
      <View style={styles.absoluteBackgroundLayer}>
         <View style={styles.glowTopLeft} />
         <View style={styles.glowBottomRight} />
      </View>
      
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
            <MaterialIcons name="help-outline" size={24} color={COLORS.primary} />
            <Text style={[TYPOGRAPHY.headlineLg, {fontSize: 20}]}>How Long?</Text>
        </View>
      </View>

      <View style={styles.content}>
        
        {isPB ? (
          <Animated.View style={[styles.pbBanner, { transform: [{ scale: pbPulseScale }] }]}>
            <Text style={styles.pbText}>NEW PERSONAL BEST!</Text>
          </Animated.View>
        ) : (
          <View style={{height: 32, marginBottom: 20}} />
        )}

        <View style={styles.heroSection}>
           <Text style={styles.diffDisplay}>
             {absDiff.toFixed(1)}s <Text style={{ color: COLORS.primaryDim, fontSize: 40 }}>{diffSec === 0 ? 'perfect' : diffSec < 0 ? 'early' : 'late'}</Text>
           </Text>
           
           <View style={styles.accuracyContainer}>
              <View style={styles.accuracyHeader}>
                 <Text style={styles.accuracyLabelText}>{accuracyLabel}</Text>
                 <Text style={styles.accuracyValueText}>{accuracy.toFixed(1)}%</Text>
              </View>
              <View style={styles.progressTrack}>
                 <Animated.View style={[styles.progressBarWrapper, { width: animatedWidth }]}>
                    <LinearGradient
                      colors={[COLORS.primary, '#b091ff', '#ff94c9']}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}
                      style={styles.progressGradient}
                    />
                 </Animated.View>
              </View>
           </View>
        </View>

        <View style={styles.bentoGrid}>
           <View style={[styles.bentoCard, styles.targetCard]}>
              <Text style={styles.cardLabel}>TARGET TIME</Text>
              <Text style={styles.cardValuePlain}>{durationSec}s</Text>
              <MaterialIcons name="timer" size={24} color={COLORS.primaryDim} style={styles.cardIcon} />
           </View>

           <View style={[styles.bentoCard, styles.actualCard]}>
              <Text style={styles.cardLabel}>ACTUAL TIME</Text>
              <Text style={styles.cardValueHighlight}>{(guessedMs / 1000).toFixed(1)}s</Text>
              <MaterialIcons name="check-circle" size={24} color={COLORS.primary} style={styles.cardIcon} />
           </View>
        </View>

        <View style={styles.analysisContainer}>
           <Text style={styles.analysisText}>{insightMessage}</Text>
        </View>
      </View>

      <View style={styles.footer}>
         <Pressable onPress={goHome} style={({pressed}) => [styles.btnSecondary, pressed && {transform: [{scale: 0.95}]}]}>
            <Text style={styles.btnSecondaryText}>Change target</Text>
         </Pressable>

         <Pressable onPress={tryAgain} style={({pressed}) => [styles.btnPrimary, pressed && {transform: [{scale: 0.95}]}]}>
            <MaterialIcons name="refresh" size={20} color={COLORS.onPrimary} />
            <Text style={styles.btnPrimaryText}>Try again</Text>
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
  absoluteBackgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: -1,
  },
  glowTopLeft: {
    position: 'absolute',
    top: '25%',
    left: '50%',
    marginLeft: -250,
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(171, 163, 255, 0.1)',
  },
  glowBottomRight: {
    position: 'absolute',
    bottom: '25%',
    right: 0,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(176, 145, 255, 0.05)',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  pbBanner: {
    backgroundColor: COLORS.tertiaryContainer,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 10,
    shadowColor: COLORS.tertiaryContainer,
    shadowOpacity: 0.5,
    shadowRadius: 15,
    marginBottom: 20,
  },
  pbText: {
    color: '#570038',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 2,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  diffDisplay: {
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    fontSize: 72,
    color: '#e9e6f9',
    textAlign: 'center',
    marginBottom: 24,
  },
  accuracyContainer: {
    width: '100%',
    maxWidth: 320,
  },
  accuracyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  accuracyLabelText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    letterSpacing: 1.5,
    fontWeight: 'bold',
  },
  accuracyValueText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  progressTrack: {
    height: 12,
    width: '100%',
    backgroundColor: COLORS.surfaceContainerHighest,
    borderRadius: 6,
    padding: 2,
  },
  progressBarWrapper: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
    ...SHADOWS.glowSelected,
  },
  progressGradient: {
    flex: 1,
    borderRadius: 4,
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    maxWidth: 400,
  },
  bentoCard: {
    flex: 1,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetCard: {
    backgroundColor: 'rgba(36, 36, 55, 0.4)',
  },
  actualCard: {
    backgroundColor: 'rgba(171, 163, 255, 0.05)',
    borderColor: 'rgba(171, 163, 255, 0.2)',
    borderWidth: 1,
  },
  cardLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    marginBottom: 12,
    letterSpacing: 1,
  },
  cardValuePlain: {
    ...TYPOGRAPHY.headlineLg,
    fontSize: 32,
    color: '#e9e6f9',
  },
  cardValueHighlight: {
    ...TYPOGRAPHY.headlineLg,
    fontSize: 32,
    color: COLORS.primary,
  },
  cardIcon: {
    marginTop: 16,
  },
  analysisContainer: {
    marginTop: 40,
    paddingHorizontal: 24,
    maxWidth: 320,
  },
  analysisText: {
    ...TYPOGRAPHY.bodyMd,
    textAlign: 'center',
    lineHeight: 24,
    color: COLORS.onSurfaceVariant,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 24,
    paddingBottom: 40,
    gap: 16,
    backgroundColor: COLORS.background,
  },
  btnSecondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    ...TYPOGRAPHY.bodyMd,
    fontWeight: 'bold',
  },
  btnPrimary: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOWS.glowSelected,
  },
  btnPrimaryText: {
    ...TYPOGRAPHY.bodyMd,
    fontWeight: 'bold',
    color: COLORS.onPrimary,
  }
});
