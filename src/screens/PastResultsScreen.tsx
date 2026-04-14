import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ScreenLayout } from '../components/ScreenLayout';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../theme/theme';
import { getHistory, HistoryEntry } from '../utils/storage';
import { MaterialIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

type Props = NativeStackScreenProps<RootStackParamList, 'PastResults'>;

export default function PastResultsScreen({ navigation }: Props) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      getHistory().then(setHistory);
    }
  }, [isFocused]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const renderHistoryItem = (item: HistoryEntry) => {
    const diffMs = item.guessedMs - item.durationMs;
    const diffSec = diffMs / 1000;
    const absDiff = Math.abs(diffSec);

    let statusText = '';
    let dotColor = '';

    if (diffSec === 0) {
      statusText = 'Perfect!';
      dotColor = COLORS.tertiaryContainer;
    } else if (diffSec < 0) {
      statusText = `${absDiff.toFixed(2)}s early`;
      dotColor = COLORS.primary;
    } else if (diffSec > 2) {
      statusText = `${absDiff.toFixed(2)}s late`;
      dotColor = '#ff6e84'; // error
    } else {
      statusText = `${absDiff.toFixed(2)}s late`;
      dotColor = '#aa8cf9'; // secondary-dim
    }

    return (
      <View key={item.id} style={styles.historyCard}>
        <View style={styles.targetCol}>
          <Text style={[TYPOGRAPHY.headlineLg, { color: COLORS.primary }]}>{item.durationLabel}</Text>
          <Text style={styles.targetLabel}>TARGET</Text>
        </View>

        <View style={styles.infoCol}>
          <Text style={[TYPOGRAPHY.titleLg, { color: diffSec === 0 ? COLORS.tertiaryContainer : COLORS.onSurface }]}>
            {statusText}
          </Text>
          <Text style={styles.timeLabel}>
             {new Date(item.timestamp).toLocaleString(undefined, {
               month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
             })}
          </Text>
        </View>

        <View style={styles.dotContainer}>
           <View style={[styles.dot, { backgroundColor: dotColor, shadowColor: dotColor }]} />
        </View>
      </View>
    );
  };

  return (
    <ScreenLayout>
      <View style={styles.header}>
         <Pressable onPress={handleClose} style={styles.iconBtn}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
         </Pressable>
         <Text style={[TYPOGRAPHY.titleLg, { flex: 1, textAlign: 'center' }]}>History</Text>
         <View style={styles.iconBtn}>
            <MaterialIcons name="history" size={24} color={COLORS.primary} />
         </View>
      </View>

      <View style={styles.titleContainer}>
         <Text style={styles.sessionLabel}>Session Analytics</Text>
         <Text style={TYPOGRAPHY.displaySm}>Past Results</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {history.map(renderHistoryItem)}

        {history.length > 0 && (
          <View style={styles.insightCard}>
            <View style={styles.insightIconWrapper}>
              <MaterialIcons name="insights" size={24} color={COLORS.primary} />
            </View>
            <View>
               <Text style={[TYPOGRAPHY.titleLg, {fontSize: 16}]}>Precision Status</Text>
               <Text style={TYPOGRAPHY.bodyMd}>You have played {history.length} games</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={({pressed}) => [styles.backBtn, pressed && {transform: [{scale: 0.95}]}]} onPress={handleClose}>
          <Text style={styles.backBtnText}>Back to Timer</Text>
          <MaterialIcons name="close" size={24} color="#000000" />
        </Pressable>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  iconBtn: {
    padding: 8,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  sessionLabel: {
    ...TYPOGRAPHY.labelSm,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 150,
    gap: 16,
  },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceContainerHigh,
    padding: 20,
    borderRadius: 16,
    borderColor: 'rgba(71, 70, 86, 0.1)',
    borderWidth: 1,
    alignItems: 'center',
  },
  targetCol: {
    width: 64,
  },
  targetLabel: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10,
    marginTop: 4,
  },
  infoCol: {
    flex: 1,
    paddingHorizontal: 16,
  },
  timeLabel: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    opacity: 0.6,
  },
  dotContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    elevation: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceVariant,
    padding: 24,
    borderRadius: 16,
    marginTop: 16,
    alignItems: 'center',
    gap: 16,
  },
  insightIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(171, 163, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 40,
    paddingTop: 24,
    backgroundColor: COLORS.background, // simple gradient fallback
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 30,
    gap: 12,
    ...SHADOWS.glowSelected,
  },
  backBtnText: {
    ...TYPOGRAPHY.titleLg,
    color: '#000',
  }
});
