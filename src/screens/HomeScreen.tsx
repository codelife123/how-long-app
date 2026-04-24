import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ScreenLayout } from '../components/ScreenLayout';
import { TYPOGRAPHY } from '../theme/theme';
import { useTheme } from '../theme/ThemeContext';
import { getPB } from '../utils/storage';
import { useIsFocused } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const DURATIONS = [
  { label: '10s', ms: 10000 },
  { label: '20s', ms: 20000 },
  { label: '30s', ms: 30000 },
  { label: '60s', ms: 60000 },
];

export default function HomeScreen({ navigation }: Props) {
  const { colors, shadows, mode, toggleMode } = useTheme();
  const [pbs, setPbs] = useState<Record<string, number | null>>({});
  const isFocused = useIsFocused();
  const cardBorder = mode === 'dark' ? 'rgba(71, 70, 86, 0.3)' : 'rgba(172, 179, 180, 0.3)';

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    if (isFocused) {
      const load = async () => {
        const loaded: Record<string, number | null> = {};
        for (const d of DURATIONS) {
          loaded[d.label] = await getPB(d.label);
        }
        setPbs(loaded);
      };
      load();
    }
  }, [isFocused]);

  const handleSelect = (duration: typeof DURATIONS[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('GetReady', { durationLabel: duration.label, durationMs: duration.ms });
  };

  const showHowToPlay = () => {
    navigation.navigate('HowToPlay');
  };

  return (
    <ScreenLayout>
      <View style={styles.topBar}>
        {/* Theme toggle */}
        <Pressable 
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleMode(); }}
          style={({pressed}) => [pressed && {opacity: 0.7}]}
        >
          <MaterialIcons 
            name={mode === 'dark' ? 'light-mode' : 'dark-mode'} 
            size={28} 
            color={colors.primary} 
          />
        </Pressable>
        <View style={{flex: 1}} />
        <View style={styles.topBarActions}>
          <Pressable 
            onPress={() => navigation.navigate('Achievements')} 
            style={({pressed}) => [pressed && {opacity: 0.7}, { marginRight: 16 }]}
          >
            <MaterialIcons name="emoji-events" size={28} color={colors.primary} />
          </Pressable>
          <Pressable 
            onPress={() => navigation.navigate('PastResults')} 
            style={({pressed}) => [pressed && {opacity: 0.7}]}
          >
            <MaterialIcons name="history" size={28} color={colors.primary} />
          </Pressable>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={[TYPOGRAPHY.headlineLg, styles.title, { color: colors.onSurface }]}>How Long?</Text>
        <Text style={[TYPOGRAPHY.bodyMd, styles.subtitle, { color: colors.onSurfaceVariant }]}>Select a duration and trust your internal clock.</Text>
        
        <View style={styles.grid}>
          {DURATIONS.map((d) => {
            const pbValue = pbs[d.label];
            return (
              <Pressable
                key={d.label}
                style={({ pressed }) => [
                  styles.card,
                  // Zen uses surfaceVariant with a border, Dark uses surfaceContainerHigh
                  { 
                    backgroundColor: mode === 'zen' ? colors.surfaceVariant : colors.surfaceContainerHigh,
                    borderWidth: mode === 'zen' ? 1 : 0,
                    borderColor: mode === 'zen' ? cardBorder : 'transparent'
                  },
                  pressed && { transform: [{ scale: 0.98 }] },
                  pressed && { backgroundColor: mode === 'zen' ? colors.surfaceContainerHighest : colors.primaryContainer, ...shadows.glowSelected },
                ]}
                onPress={() => handleSelect(d)}
              >
                {/* Time label — primary green in Zen, onSurface in Dark */}
                <Text style={[TYPOGRAPHY.displaySm, styles.cardTimeLabel, { color: mode === 'zen' ? colors.primary : colors.onSurface }]}>{d.label}</Text>

                {/* PB badge — grey pill in Zen, tertiaryContainer in Dark */}
                {pbValue !== null && pbValue !== undefined && (
                  <View style={[
                    styles.pbBadge,
                    { backgroundColor: mode === 'zen' ? colors.primaryContainer : colors.tertiaryContainer }
                  ]}>
                    <Text style={[styles.pbText, { color: mode === 'zen' ? colors.primary : '#034853' }]}>
                      PB: ±{(pbValue / 1000).toFixed(2)}s
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <Animated.View style={{ transform: [{ scale: pulseAnim }], alignSelf: 'center', marginTop: 40 }}>
          <Pressable 
            style={({ pressed }) => [
              styles.howToPlay, 
              { backgroundColor: mode === 'dark' ? 'rgba(171, 163, 255, 0.08)' : 'rgba(45, 105, 87, 0.08)', borderColor: mode === 'dark' ? 'rgba(171, 163, 255, 0.2)' : 'rgba(45, 105, 87, 0.2)' },
              pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
            ]} 
            onPress={showHowToPlay}
          >
            <MaterialIcons name="info-outline" size={18} color={colors.primary} />
            <Text style={[styles.howToPlayText, { color: colors.primary }]}>How to play</Text>
            <MaterialIcons name="chevron-right" size={18} color={colors.primary} />
          </Pressable>
        </Animated.View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 32,
    paddingTop: 40,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 48,
    opacity: 0.8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'space-between',
  },
  card: {
    width: '45%',
    aspectRatio: 1,
    borderRadius: 24,
    padding: 20,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  cardTimeLabel: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pbBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pbText: {
    ...TYPOGRAPHY.labelSm,
    fontWeight: 'bold',
  },
  howToPlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
  },
  howToPlayText: {
    ...TYPOGRAPHY.bodyMd,
    fontWeight: '800',
    fontSize: 14,
  }
});
