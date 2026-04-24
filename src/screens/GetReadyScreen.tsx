import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ScreenLayout } from '../components/ScreenLayout';
import { TYPOGRAPHY } from '../theme/theme';
import { useTheme } from '../theme/ThemeContext';
import * as Haptics from '../utils/haptics';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<RootStackParamList, 'GetReady'>;

export default function GetReadyScreen({ navigation, route }: Props) {
  const { colors, shadows } = useTheme();
  const { durationLabel, durationMs } = route.params;

  const buttonScale = useRef(new Animated.Value(1)).current;
  const rippleScale = useRef(new Animated.Value(1)).current;
  const rippleOpacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonScale, { toValue: 1.05, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(buttonScale, { toValue: 1, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) })
      ])
    ).start();

    Animated.loop(
      Animated.parallel([
        Animated.timing(rippleScale, { toValue: 2, duration: 2000, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
        Animated.timing(rippleOpacity, { toValue: 0, duration: 2000, useNativeDriver: true, easing: Easing.out(Easing.ease) })
      ])
    ).start();
  }, [buttonScale, rippleScale, rippleOpacity]);

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    navigation.replace('ActiveCounting', { durationLabel, durationMs });
  };

  return (
    <ScreenLayout>
      <View style={styles.content}>
        <View style={styles.centerBox}>
          <Text style={[TYPOGRAPHY.headlineLg, styles.instructions, { color: colors.onSurface }]}>
            Close your eyes, feel the time.
          </Text>
          <Text style={[TYPOGRAPHY.bodyLg, styles.targetText, { color: colors.onSurfaceVariant }]}>
            Target: {durationLabel}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Animated.View style={[styles.rippleRing, { backgroundColor: colors.primary, transform: [{ scale: rippleScale }], opacity: rippleOpacity }]} />

          <Animated.View style={[styles.innerAnimatedBtn, shadows.glowSelected, { transform: [{ scale: buttonScale }] }]}>
            <Pressable 
              onPress={handleStart}
              style={({ pressed }) => [
                styles.pressableArea,
                pressed && { opacity: 0.8 }
              ]}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryContainer]}
                style={styles.gradientFill}
              >
                <Text style={[styles.startText, { color: colors.onPrimary }]}>START</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>
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
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 80,
  },
  rippleRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  innerAnimatedBtn: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  pressableArea: {
    flex: 1,
    borderRadius: 70,
    overflow: 'hidden',
  },
  gradientFill: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startText: {
    ...TYPOGRAPHY.titleLg,
    letterSpacing: 1.5,
  }
});
