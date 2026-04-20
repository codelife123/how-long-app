import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ScreenLayout } from '../components/ScreenLayout';
import { TYPOGRAPHY } from '../theme/theme';
import { useTheme } from '../theme/ThemeContext';
import { getHistory, HistoryEntry } from '../utils/storage';
import { MaterialIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

type Props = NativeStackScreenProps<RootStackParamList, 'PastResults'>;

export default function PastResultsScreen({ navigation }: Props) {
  const { colors, shadows, mode } = useTheme();
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

    if (absDiff < 0.05) {
      statusText = 'Spot on!';
      dotColor = colors.tertiaryContainer;
    } else if (diffSec < 0) {
      statusText = `${absDiff.toFixed(2)}s early`;
      dotColor = colors.primary;
    } else if (diffSec > 2) {
      statusText = `${absDiff.toFixed(2)}s late`;
      dotColor = colors.error;
    } else {
      statusText = `${absDiff.toFixed(2)}s late`;
      dotColor = mode === 'dark' ? '#aa8cf9' : '#4c645b';
    }

    return (
      <Pressable 
        key={item.id} 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.navigate('Result', {
            durationLabel: item.durationLabel,
            durationMs: item.durationMs,
            guessedMs: item.guessedMs,
            fromHistory: true,
          });
        }}
        style={({pressed}) => [pressed && {opacity: 0.8, transform: [{scale: 0.98}]}]}
      >
        <View style={[styles.historyCard, { backgroundColor: colors.surfaceContainerHigh, borderColor: mode === 'dark' ? 'rgba(71, 70, 86, 0.1)' : 'rgba(172, 179, 180, 0.1)' }]}>
          <View style={styles.targetCol}>
            <Text style={[TYPOGRAPHY.headlineLg, { color: colors.primary }]}>{item.durationLabel}</Text>
            <Text style={[styles.targetLabel, { color: colors.onSurfaceVariant }]}>TARGET</Text>
          </View>

          <View style={styles.infoCol}>
            <Text style={[TYPOGRAPHY.titleLg, { color: diffSec === 0 ? colors.tertiaryContainer : colors.onSurface }]}>
              {statusText}
            </Text>
            <Text style={[styles.timeLabel, { color: colors.onSurfaceVariant }]}>
               {new Date(item.timestamp).toLocaleString(undefined, {
                 month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
               })}
            </Text>
          </View>

          <View style={styles.dotContainer}>
             <View style={[styles.dot, { backgroundColor: dotColor, shadowColor: dotColor }]} />
          </View>
        </View>
      </Pressable>
    );
  };

  const iconCircleBg = mode === 'dark' ? 'rgba(171, 163, 255, 0.2)' : 'rgba(45, 105, 87, 0.15)';

  return (
    <ScreenLayout>
      <View style={styles.header}>
         <Pressable onPress={handleClose} style={styles.iconBtn}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
         </Pressable>
         <Text style={[TYPOGRAPHY.titleLg, { flex: 1, textAlign: 'center', color: colors.onSurface }]}>History</Text>
         <View style={styles.iconBtn}>
            <MaterialIcons name="history" size={24} color={colors.primary} />
         </View>
      </View>

      <View style={styles.titleContainer}>
         <Text style={[styles.sessionLabel, { color: colors.onSurfaceVariant }]}>Session Analytics</Text>
         <Text style={[TYPOGRAPHY.displaySm, { color: colors.onSurface }]}>Past Results</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {history.map(renderHistoryItem)}

        {history.length > 0 && (
          <View style={[styles.insightCard, { backgroundColor: colors.surfaceVariant }]}>
            <View style={[styles.insightIconWrapper, { backgroundColor: iconCircleBg }]}>
              <MaterialIcons name="insights" size={24} color={colors.primary} />
            </View>
            <View>
               <Text style={[TYPOGRAPHY.titleLg, {fontSize: 16, color: colors.onSurface}]}>Precision Status</Text>
               <Text style={[TYPOGRAPHY.bodyMd, { color: colors.onSurfaceVariant }]}>You have played {history.length} games</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <Pressable style={({pressed}) => [styles.backBtn, { backgroundColor: colors.primary, ...shadows.glowSelected }, pressed && {transform: [{scale: 0.95}]}]} onPress={handleClose}>
          <Text style={[styles.backBtnText, { color: colors.onPrimary }]}>Back to Timer</Text>
          <MaterialIcons name="close" size={24} color={colors.onPrimary} />
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
    padding: 20,
    borderRadius: 16,
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
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 30,
    gap: 12,
  },
  backBtnText: {
    ...TYPOGRAPHY.titleLg,
  }
});
