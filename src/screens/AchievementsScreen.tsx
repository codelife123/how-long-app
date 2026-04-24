import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated, Share } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ScreenLayout } from '../components/ScreenLayout';
import { TYPOGRAPHY } from '../theme/theme';
import { useTheme } from '../theme/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import * as Haptics from '../utils/haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getStats, getAchievements, ACHIEVEMENTS, UserStats, UnlockedAchievements, CategoryType, recordShare, AchievementDef } from '../utils/achievements';

type Props = NativeStackScreenProps<RootStackParamList, 'Achievements'>;

export default function AchievementsScreen({ navigation }: Props) {
  const { colors, shadows, mode } = useTheme();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  
  const [stats, setStats] = useState<UserStats | null>(null);
  const [unlocked, setUnlocked] = useState<UnlockedAchievements>({});
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementDef | null>(null);

  useEffect(() => {
    if (isFocused) {
      const load = async () => {
        setStats(await getStats());
        setUnlocked(await getAchievements());
      };
      load();
    }
  }, [isFocused]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const shareAchievement = async () => {
    if (!selectedAchievement) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const result = await Share.share({
        message: `I just unlocked the "${selectedAchievement.title}" achievement in How Long!\n\nCan you beat my internal clock?`,
      });
      if (result.action === Share.sharedAction) {
        await recordShare('achievement');
        // Reload stats and unlocked states in case sharing unlocked a new badge!
        setStats(await getStats());
        setUnlocked(await getAchievements());
      }
    } catch (e) {
      console.warn('Share failed:', e);
    }
  };

  const categories: CategoryType[] = ['Temporal Mastery', 'Dedication', 'Experience', 'Community'];

  return (
    <ScreenLayout>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <Text style={[TYPOGRAPHY.headlineLg, { color: colors.onSurface }]}>Achievements</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 100 }]} showsVerticalScrollIndicator={false}>
        {stats && (
          <View style={[styles.statsBar, { backgroundColor: colors.surfaceContainer }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{stats.totalGamesPlayed}</Text>
              <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Games</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{stats.perfectHits}</Text>
              <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Perfects</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={[styles.statValue, { color: colors.primary }]}>{stats.currentStreakDays}</Text>
                <MaterialIcons name="local-fire-department" size={16} color={colors.primary} style={{marginLeft: 2}} />
              </View>
              <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Day Streak</Text>
            </View>
          </View>
        )}

        {categories.map(category => {
          const categoryAchievements = ACHIEVEMENTS.filter(a => a.category === category);
          const unlockedCount = categoryAchievements.filter(a => unlocked[a.id]?.unlocked).length;

          return (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={[TYPOGRAPHY.titleLg, { color: colors.onSurface }]}>{category}</Text>
                <Text style={[TYPOGRAPHY.labelSm, { color: colors.onSurfaceVariant }]}>{unlockedCount} of {categoryAchievements.length} unlocked</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                {categoryAchievements.map(achievement => {
                  const progress = unlocked[achievement.id];
                  const isUnlocked = progress?.unlocked;
                  const currentValue = progress?.currentValue || 0;
                  
                  return (
                    <Pressable 
                      key={achievement.id} 
                      style={styles.badgeContainer}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedAchievement(achievement);
                      }}
                    >
                      <View style={[
                        styles.badgeCircle, 
                        { 
                          backgroundColor: isUnlocked ? `${achievement.color}15` : colors.surfaceContainerHigh,
                          borderColor: isUnlocked ? achievement.color : 'transparent',
                          borderWidth: isUnlocked ? 2 : 0,
                          opacity: isUnlocked ? 1 : 0.5
                        },
                        isUnlocked && { shadowColor: achievement.color, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }
                      ]}>
                        <MaterialIcons 
                          name={isUnlocked ? achievement.icon : "lock"} 
                          size={40} 
                          color={isUnlocked ? achievement.color : colors.onSurfaceVariant} 
                        />
                      </View>
                      
                      <Text style={[styles.badgeTitle, { color: isUnlocked ? colors.onSurface : colors.onSurfaceVariant }]} numberOfLines={1}>
                        {achievement.title}
                      </Text>

                      {isUnlocked && progress.unlockedAt ? (
                        <Text style={[styles.badgeSub, { color: colors.onSurfaceVariant }]}>
                          {new Date(progress.unlockedAt).toLocaleDateString(undefined, {month: 'numeric', day: 'numeric', year: '2-digit'})}
                        </Text>
                      ) : (
                        <View style={styles.progressContainer}>
                          <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceContainerHighest }]}>
                            <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: `${Math.min(100, Math.max(0, (currentValue / achievement.maxProgress) * 100))}%` }]} />
                          </View>
                          <Text style={[styles.badgeSub, { color: colors.onSurfaceVariant, marginTop: 4 }]}>
                            {currentValue} / {achievement.maxProgress}
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom, 24) + 16 }]}>
        <Pressable 
          style={({pressed}) => [styles.backBtn, { backgroundColor: colors.primary, ...shadows.glowSelected }, pressed && {transform: [{scale: 0.95}]}]} 
          onPress={handleClose}
        >
          <Text style={[styles.backBtnText, { color: colors.onPrimary }]}>Back to Menu</Text>
          <MaterialIcons name="close" size={24} color={colors.onPrimary} />
        </Pressable>
      </View>

      {selectedAchievement && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surfaceContainerHigh }]}>
            <View style={[
              styles.modalIconBg, 
              unlocked[selectedAchievement.id]?.unlocked 
                ? { backgroundColor: `${selectedAchievement.color}1A`, borderColor: selectedAchievement.color, borderWidth: 2 } 
                : { backgroundColor: colors.surfaceContainerHighest }
            ]}>
              <MaterialIcons 
                name={unlocked[selectedAchievement.id]?.unlocked ? selectedAchievement.icon : 'lock'} 
                size={48} 
                color={unlocked[selectedAchievement.id]?.unlocked ? selectedAchievement.color : colors.onSurfaceVariant} 
              />
            </View>
            <Text style={[TYPOGRAPHY.displaySm, { color: colors.onSurface, textAlign: 'center', marginBottom: 8 }]}>
              {selectedAchievement.title}
            </Text>
            <Text style={[TYPOGRAPHY.bodyLg, { color: colors.onSurfaceVariant, textAlign: 'center', marginBottom: 24 }]}>
              {selectedAchievement.description}
            </Text>

            {!unlocked[selectedAchievement.id]?.unlocked && (
              <View style={[styles.modalProgressContainer, { backgroundColor: colors.surfaceContainerHighest }]}>
                <View style={[styles.modalProgressBar, { backgroundColor: colors.primary, width: `${Math.min(100, Math.max(0, ((unlocked[selectedAchievement.id]?.currentValue || 0) / selectedAchievement.maxProgress) * 100))}%` }]} />
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              {unlocked[selectedAchievement.id]?.unlocked && (
                <Pressable 
                  style={({pressed}) => [styles.modalCloseBtn, { flex: 1, backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary }, pressed && {transform: [{scale: 0.95}]}]} 
                  onPress={shareAchievement}
                >
                  <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8}}>
                    <MaterialIcons name="ios-share" size={20} color={colors.primary} />
                    <Text style={[TYPOGRAPHY.labelSm, { color: colors.primary, fontWeight: 'bold', fontSize: 16 }]}>Share</Text>
                  </View>
                </Pressable>
              )}
              <Pressable 
                style={({pressed}) => [styles.modalCloseBtn, { flex: 1, backgroundColor: colors.primary }, pressed && {transform: [{scale: 0.95}]}]} 
                onPress={() => setSelectedAchievement(null)}
              >
                <Text style={[TYPOGRAPHY.labelSm, { color: colors.onPrimary, fontWeight: 'bold', fontSize: 16 }]}>Got it</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  content: {
    paddingHorizontal: 0, 
  },
  statsBar: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.displaySm,
    fontSize: 24,
  },
  statLabel: {
    ...TYPOGRAPHY.labelSm,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  categorySection: {
    marginBottom: 40,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  horizontalScroll: {
    paddingHorizontal: 24,
    gap: 24,
  },
  badgeContainer: {
    width: 100,
    alignItems: 'center',
  },
  badgeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeTitle: {
    ...TYPOGRAPHY.labelSm,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeSub: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBarBg: {
    width: 60,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 24,
  },
  backBtn: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  backBtnText: {
    ...TYPOGRAPHY.bodyMd,
    fontWeight: 'bold',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  modalIconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalProgressContainer: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 24,
  },
  modalProgressBar: {
    height: '100%',
    borderRadius: 4,
  },
  modalCloseBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  }
});
