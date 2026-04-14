import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ScreenLayout } from '../components/ScreenLayout';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../theme/theme';
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
  { label: '30s', ms: 30000 },
  { label: '60s', ms: 60000 },
  { label: '3m', ms: 180000 },
];

export default function HomeScreen({ navigation }: Props) {
  const [pbs, setPbs] = useState<Record<string, number | null>>({});
  const isFocused = useIsFocused();

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
        <View style={{flex: 1}} />
        <Pressable 
          onPress={() => navigation.navigate('PastResults')} 
          style={({pressed}) => [pressed && {opacity: 0.7}]}
        >
          <MaterialIcons name="history" size={28} color={COLORS.primary} />
        </Pressable>
      </View>
      <View style={styles.content}>
        <Text style={[TYPOGRAPHY.headlineLg, styles.title]}>How Long?</Text>
        <Text style={[TYPOGRAPHY.bodyMd, styles.subtitle]}>Select a duration and trust your internal clock.</Text>
        
        <View style={styles.grid}>
          {DURATIONS.map((d) => {
            const pbValue = pbs[d.label];
            return (
              <Pressable
                key={d.label}
                style={({ pressed }) => [
                  styles.card,
                  pressed && { transform: [{ scale: 0.98 }] },
                  pressed && styles.cardPressed
                ]}
                onPress={() => handleSelect(d)}
              >
                {pbValue !== null && pbValue !== undefined && (
                  <View style={styles.pbBadge}>
                    <Text style={styles.pbText}>PB: ±{(pbValue / 1000).toFixed(2)}s</Text>
                  </View>
                )}
                <Text style={TYPOGRAPHY.displaySm}>{d.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable 
          style={({ pressed }) => [styles.howToPlay, pressed && { opacity: 0.7 }]} 
          onPress={showHowToPlay}
        >
          <Text style={styles.howToPlayText}>ⓘ how to play</Text>
        </Pressable>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
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
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: 24, // md (1.5rem)
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPressed: {
    backgroundColor: COLORS.primaryContainer,
    ...SHADOWS.glowSelected,
  },
  pbBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: COLORS.tertiaryContainer,
    borderRadius: 16, // pill shape
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pbText: {
    ...TYPOGRAPHY.labelSm,
    color: '#000000', // max contrast
    fontWeight: 'bold',
  },
  howToPlay: {
    marginTop: 40,
    alignItems: 'center',
    padding: 12,
  },
  howToPlayText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 14,
  }
});
