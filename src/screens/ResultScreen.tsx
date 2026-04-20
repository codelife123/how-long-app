import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ScreenLayout } from '../components/ScreenLayout';
import { TYPOGRAPHY } from '../theme/theme';
import { useTheme } from '../theme/ThemeContext';
import { savePB, saveHistory } from '../utils/storage';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export default function ResultScreen({ navigation, route }: Props) {
  const { colors, shadows, mode } = useTheme();
  const { durationLabel, durationMs, guessedMs, fromHistory } = route.params;
  const [isPB, setIsPB] = useState(false);
  const shareRef = useRef<ViewShot>(null);

  const diffMs = guessedMs - durationMs;
  const diffSec = diffMs / 1000;
  const absDiff = Math.abs(diffSec);

  const durationSec = durationMs / 1000;
  const accuracy = Math.max(0, 100 - (absDiff / durationSec) * 100);
  
  let insightMessage = '';
  let accuracyLabel = '';
  if (absDiff < 0.05) {
     insightMessage = "Absolute perfection. Your internal clock is perfectly synchronized with reality. Not a millisecond wasted.";
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
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic)
    }).start();

    if (!fromHistory) {
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
    }
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

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      if (shareRef.current?.capture) {
        const uri = await shareRef.current.capture();
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Share your result',
          });
        }
      }
    } catch (e) {
      console.warn('Share failed:', e);
    }
  };

  // Theme-aware values
  const progressGradientColors: [string, string, string] = mode === 'dark'
    ? [colors.primary, '#b091ff', '#ff94c9']
    : [colors.primary, '#4c645b', '#2f6772'];

  const confettiColors = mode === 'dark'
    ? [colors.primary, colors.tertiaryContainer, '#aa8cf9', '#d73357']
    : [colors.primary, colors.tertiaryContainer, '#4c645b', '#2f6772'];

  const glowBgPrimary = mode === 'dark'
    ? 'rgba(171, 163, 255, 0.1)'
    : 'rgba(45, 105, 87, 0.06)';
  const glowBgSecondary = mode === 'dark'
    ? 'rgba(176, 145, 255, 0.05)'
    : 'rgba(76, 100, 91, 0.04)';

  const statusWord = absDiff < 0.05 ? 'spot on!' : diffSec < 0 ? 'early' : 'late';

  // ─── Shareable Image Card (rendered off-screen, captured by ViewShot) ───
  const ShareableCard = () => (
    <ViewShot ref={shareRef} options={{ format: 'png', quality: 1 }}>
      <View style={[shareStyles.card, { backgroundColor: colors.background }]}>
        {/* Decorative glow */}
        <View style={[shareStyles.glowOrb, { backgroundColor: mode === 'dark' ? 'rgba(171,163,255,0.15)' : 'rgba(45,105,87,0.08)' }]} />

        {/* App branding */}
        <Text style={[shareStyles.brandTitle, { color: colors.primary }]}>How Long?</Text>

        {/* PB badge */}
        {isPB && (
          <View style={[shareStyles.pbBadge, { backgroundColor: colors.tertiaryContainer }]}>
            <Text style={[shareStyles.pbBadgeText, { color: mode === 'dark' ? '#570038' : '#034853' }]}>⭐ NEW PERSONAL BEST</Text>
          </View>
        )}

        {/* Hero result */}
        {absDiff === 0 ? (
          <Text style={[shareStyles.heroNumber, { color: colors.primary, marginBottom: 32 }]}>Perfect!</Text>
        ) : (
          <>
            <Text style={[shareStyles.heroNumber, { color: colors.onSurface }]}>{absDiff.toFixed(1)}s</Text>
            <Text style={[shareStyles.heroLabel, { color: colors.primaryDim }]}>{statusWord}</Text>
          </>
        )}

        {/* Accuracy bar */}
        <View style={shareStyles.accuracyRow}>
          <Text style={[shareStyles.accuracyLabel, { color: colors.onSurfaceVariant }]}>{accuracyLabel}</Text>
          <Text style={[shareStyles.accuracyValue, { color: colors.primary }]}>{accuracy.toFixed(1)}%</Text>
        </View>
        <View style={[shareStyles.barTrack, { backgroundColor: colors.surfaceContainerHighest }]}>
          <View style={[shareStyles.barFill, { width: `${accuracy}%` }]}>
            <LinearGradient
              colors={progressGradientColors}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={StyleSheet.absoluteFill}
            />
          </View>
        </View>

        {/* Target vs Actual */}
        <View style={shareStyles.statsRow}>
          <View style={[shareStyles.statBox, { backgroundColor: colors.surfaceContainerHigh }]}>
            <Text style={[shareStyles.statLabel, { color: colors.onSurfaceVariant }]}>TARGET</Text>
            <Text style={[shareStyles.statValue, { color: colors.onSurface }]}>{durationSec}s</Text>
          </View>
          <View style={[shareStyles.statBox, { backgroundColor: colors.surfaceContainerHigh }]}>
            <Text style={[shareStyles.statLabel, { color: colors.onSurfaceVariant }]}>ACTUAL</Text>
            <Text style={[shareStyles.statValue, { color: colors.primary }]}>{(guessedMs / 1000).toFixed(1)}s</Text>
          </View>
        </View>

        {/* Insight */}
        <Text style={[shareStyles.insight, { color: colors.onSurfaceVariant }]}>{insightMessage}</Text>

        {/* Watermark */}
        <View style={shareStyles.watermark}>
          <View style={[shareStyles.watermarkDot, { backgroundColor: colors.primary }]} />
          <Text style={[shareStyles.watermarkText, { color: colors.onSurfaceVariant }]}>Generated via "How Long?" app</Text>
        </View>
      </View>
    </ViewShot>
  );

  return (
    <ScreenLayout>
      {/* Hidden shareable card – positioned off-screen for capture */}
      <View style={shareStyles.offScreen}>
        <ShareableCard />
      </View>

      <View style={[styles.absoluteBackgroundLayer]}>
         <View style={[styles.glowTopLeft, { backgroundColor: glowBgPrimary }]} />
         <View style={[styles.glowBottomRight, { backgroundColor: glowBgSecondary }]} />
      </View>
      
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
            <MaterialIcons name="help-outline" size={24} color={colors.primary} />
            <Text style={[TYPOGRAPHY.headlineLg, {fontSize: 20, color: colors.onSurface}]}>How Long?</Text>
        </View>
        {/* Share button in header */}
        <Pressable onPress={handleShare} style={({pressed}) => [styles.shareBtn, pressed && {opacity: 0.7}]}>
          <MaterialIcons name="share" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.content}>
        
        {isPB ? (
          <Animated.View style={[styles.pbBanner, { backgroundColor: colors.tertiaryContainer, shadowColor: colors.tertiaryContainer, transform: [{ scale: pbPulseScale }] }]}>
            <Text style={[styles.pbText, { color: mode === 'dark' ? '#570038' : '#034853' }]}>NEW PERSONAL BEST!</Text>
          </Animated.View>
        ) : (
          <View style={{height: 32, marginBottom: 20}} />
        )}

        <View style={styles.heroSection}>
           <Text style={[styles.diffDisplay, { color: colors.onSurface }]}>
             {absDiff === 0 ? '' : `${absDiff.toFixed(1)}s `}<Text style={{ color: colors.primaryDim, fontSize: absDiff === 0 ? 72 : 40 }}>{absDiff === 0 ? 'Perfect!' : statusWord}</Text>
           </Text>
           
           <View style={styles.accuracyContainer}>
              <View style={styles.accuracyHeader}>
                 <Text style={[styles.accuracyLabelText, { color: colors.onSurfaceVariant }]}>{accuracyLabel}</Text>
                 <Text style={[styles.accuracyValueText, { color: colors.primary }]}>{accuracy.toFixed(1)}%</Text>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: colors.surfaceContainerHighest }]}>
                 <Animated.View style={[styles.progressBarWrapper, shadows.glowSelected, { width: animatedWidth }]}>
                    <LinearGradient
                      colors={progressGradientColors}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}
                      style={styles.progressGradient}
                    />
                 </Animated.View>
              </View>
           </View>
        </View>

        <View style={styles.bentoGrid}>
           <View style={[styles.bentoCard, { backgroundColor: mode === 'dark' ? 'rgba(36, 36, 55, 0.4)' : 'rgba(240, 244, 244, 0.8)' }]}>
              <Text style={[styles.cardLabel, { color: colors.onSurfaceVariant }]}>TARGET TIME</Text>
              <Text style={[styles.cardValuePlain, { color: colors.onSurface }]}>{durationSec}s</Text>
              <MaterialIcons name="timer" size={24} color={colors.primaryDim} style={styles.cardIcon} />
           </View>

           <View style={[styles.bentoCard, { backgroundColor: mode === 'dark' ? 'rgba(171, 163, 255, 0.05)' : 'rgba(45, 105, 87, 0.05)', borderColor: mode === 'dark' ? 'rgba(171, 163, 255, 0.2)' : 'rgba(45, 105, 87, 0.2)', borderWidth: 1 }]}>
              <Text style={[styles.cardLabel, { color: colors.onSurfaceVariant }]}>ACTUAL TIME</Text>
              <Text style={[styles.cardValueHighlight, { color: colors.primary }]}>{(guessedMs / 1000).toFixed(1)}s</Text>
              <MaterialIcons name="check-circle" size={24} color={colors.primary} style={styles.cardIcon} />
           </View>
        </View>

        <View style={styles.analysisContainer}>
           <Text style={[styles.analysisText, { color: colors.onSurfaceVariant }]}>{insightMessage}</Text>
        </View>
      </View>

      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        {fromHistory ? (
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.goBack(); }} style={({pressed}) => [styles.btnPrimary, { backgroundColor: colors.primary, ...shadows.glowSelected, flex: 1 }, pressed && {transform: [{scale: 0.95}]}]}>
            <MaterialIcons name="arrow-back" size={20} color={colors.onPrimary} />
            <Text style={[styles.btnPrimaryText, { color: colors.onPrimary }]}>Back to History</Text>
          </Pressable>
        ) : (
          <>
            <Pressable onPress={goHome} style={({pressed}) => [styles.btnSecondary, { borderColor: colors.outlineVariant }, pressed && {transform: [{scale: 0.95}]}]}>
              <Text style={[styles.btnSecondaryText, { color: colors.onSurface }]}>Change target</Text>
            </Pressable>

            <Pressable onPress={tryAgain} style={({pressed}) => [styles.btnPrimary, { backgroundColor: colors.primary, ...shadows.glowSelected }, pressed && {transform: [{scale: 0.95}]}]}>
              <MaterialIcons name="refresh" size={20} color={colors.onPrimary} />
              <Text style={[styles.btnPrimaryText, { color: colors.onPrimary }]}>Try again</Text>
            </Pressable>
          </>
        )}
      </View>

      {isPB && (
        <ConfettiCannon
          count={75}
          origin={{x: -10, y: 0}}
          colors={confettiColors}
          fadeOut={true}
          fallSpeed={2500}
          explosionSpeed={350}
        />
      )}
    </ScreenLayout>
  );
}

// ─── Shareable Card Styles ───────────────────────────────────────
const shareStyles = StyleSheet.create({
  offScreen: {
    position: 'absolute',
    left: -9999,
    top: 0,
  },
  card: {
    width: 400,
    paddingVertical: 48,
    paddingHorizontal: 32,
    alignItems: 'center',
    overflow: 'hidden',
  },
  glowOrb: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  brandTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    letterSpacing: 1,
    marginBottom: 24,
  },
  pbBadge: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  pbBadgeText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    letterSpacing: 2,
  },
  heroNumber: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 72,
    fontWeight: '800',
  },
  heroLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 28,
    marginBottom: 32,
    textTransform: 'uppercase',
    letterSpacing: 4,
  },
  accuracyRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  accuracyLabel: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.5,
  },
  accuracyValue: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
  },
  barTrack: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 32,
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
    overflow: 'hidden',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    marginBottom: 28,
  },
  statBox: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 8,
  },
  statValue: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 28,
  },
  insight: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
    marginBottom: 32,
  },
  watermark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    opacity: 0.6,
  },
  watermarkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  watermarkText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
});

// ─── Main Screen Styles ──────────────────────────────────────────
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
  },
  glowBottomRight: {
    position: 'absolute',
    bottom: '25%',
    right: 0,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shareBtn: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  pbBanner: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 10,
    shadowOpacity: 0.5,
    shadowRadius: 15,
    marginBottom: 20,
  },
  pbText: {
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
    fontFamily: 'PlusJakartaSans_700Bold',
    fontWeight: '800',
    fontSize: 72,
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
    letterSpacing: 1.5,
    fontWeight: 'bold',
  },
  accuracyValueText: {
    ...TYPOGRAPHY.labelSm,
    fontWeight: 'bold',
  },
  progressTrack: {
    height: 12,
    width: '100%',
    borderRadius: 6,
    padding: 2,
  },
  progressBarWrapper: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
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
  cardLabel: {
    ...TYPOGRAPHY.labelSm,
    marginBottom: 12,
    letterSpacing: 1,
  },
  cardValuePlain: {
    ...TYPOGRAPHY.headlineLg,
    fontSize: 32,
  },
  cardValueHighlight: {
    ...TYPOGRAPHY.headlineLg,
    fontSize: 32,
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
  },
  btnSecondary: {
    flex: 1,
    borderWidth: 1,
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
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnPrimaryText: {
    ...TYPOGRAPHY.bodyMd,
    fontWeight: 'bold',
  }
});
