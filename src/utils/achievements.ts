import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

export interface UserStats {
  totalGamesPlayed: number;
  perfectHits: number;
  currentStreakDays: number;
  longestStreakDays: number;
  lastPlayDate: string | null; // "YYYY-MM-DD"
  resultsShared: number;
  achievementsShared: number;
}

export interface AchievementProgress {
  unlocked: boolean;
  unlockedAt: string | null; // ISOString
  currentValue: number;
}

export type UnlockedAchievements = Record<string, AchievementProgress>;

export type CategoryType = 'Temporal Mastery' | 'Dedication' | 'Experience' | 'Community';

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  category: CategoryType;
  maxProgress: number;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
}

const STATS_KEY = '@howlong_user_stats';
const ACHIEVEMENTS_KEY = '@howlong_achievements_v1';

export const ACHIEVEMENTS: AchievementDef[] = [
  // ─── Temporal Mastery ───
  { id: 'mastery_1', title: 'Spot On', description: 'Get your first perfect score (±0.05s)', category: 'Temporal Mastery', maxProgress: 1, icon: 'my-location', color: '#ff94c9' },
  { id: 'mastery_10', title: 'Time Lord', description: 'Achieve 10 perfect scores total', category: 'Temporal Mastery', maxProgress: 10, icon: 'flare', color: '#b091ff' },
  { id: 'mastery_60', title: 'Sixty Second Sense', description: 'Get a perfect score on the 60s timer', category: 'Temporal Mastery', maxProgress: 1, icon: 'hourglass-full', color: '#aba3ff' },

  // ─── Dedication ───
  { id: 'streak_3', title: 'The Spark', description: 'Play for 3 consecutive days', category: 'Dedication', maxProgress: 3, icon: 'local-fire-department', color: '#ffd166' },
  { id: 'streak_7', title: 'The Flame', description: 'Play for 7 consecutive days', category: 'Dedication', maxProgress: 7, icon: 'whatshot', color: '#ef476f' },
  { id: 'streak_30', title: 'The Inferno', description: 'Play for 30 consecutive days', category: 'Dedication', maxProgress: 30, icon: 'local-fire-department', color: '#ff0a54' },

  // ─── Experience ───
  { id: 'exp_10', title: 'Initiate', description: 'Complete 10 practice runs', category: 'Experience', maxProgress: 10, icon: 'sports-esports', color: '#118ab2' },
  { id: 'exp_100', title: 'Veteran', description: 'Complete 100 practice runs', category: 'Experience', maxProgress: 100, icon: 'military-tech', color: '#06d6a0' },
  { id: 'exp_500', title: 'Zen Master', description: 'Complete 500 practice runs', category: 'Experience', maxProgress: 500, icon: 'self-improvement', color: '#b1efd8' },

  // ─── Community ───
  { id: 'share_1', title: 'Word of Mouth', description: 'Share a result with a friend', category: 'Community', maxProgress: 1, icon: 'share', color: '#ff7096' },
  { id: 'share_10', title: 'Influencer', description: 'Share your results or badges 10 times', category: 'Community', maxProgress: 10, icon: 'campaign', color: '#8338ec' },
  { id: 'share_badge', title: 'Flex', description: 'Share an unlocked achievement', category: 'Community', maxProgress: 1, icon: 'ios-share', color: '#fb5607' },
];

export const getStats = async (): Promise<UserStats> => {
  try {
    const json = await AsyncStorage.getItem(STATS_KEY);
    if (json) return JSON.parse(json);
  } catch (e) {}
  
  return {
    totalGamesPlayed: 0,
    perfectHits: 0,
    currentStreakDays: 1,
    longestStreakDays: 1,
    lastPlayDate: null,
    resultsShared: 0,
    achievementsShared: 0,
  };
};

export const getAchievements = async (): Promise<UnlockedAchievements> => {
  try {
    const json = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
    if (json) return JSON.parse(json);
  } catch (e) {}
  
  return {};
};

// Returns today's date in YYYY-MM-DD
const getTodayStr = () => new Date().toISOString().split('T')[0];

const evaluateProgress = (
  def: AchievementDef, 
  stats: UserStats, 
  result: { durationMs: number; absDiff: number; isPerfect: boolean }
): number => {
  switch (def.id) {
    // Mastery
    case 'mastery_1': return stats.perfectHits >= 1 ? 1 : 0;
    case 'mastery_10': return stats.perfectHits;
    case 'mastery_60': return (result.isPerfect && result.durationMs === 60000) ? 1 : 0; // if locked, can unlock in this run
    
    // Streaks
    case 'streak_3': return stats.currentStreakDays;
    case 'streak_7': return stats.currentStreakDays;
    case 'streak_30': return stats.currentStreakDays;

    // Experience
    case 'exp_10': return stats.totalGamesPlayed;
    case 'exp_100': return stats.totalGamesPlayed;
    case 'exp_500': return stats.totalGamesPlayed;
    
    // Community
    case 'share_1': return stats.resultsShared;
    case 'share_10': return stats.resultsShared + stats.achievementsShared;
    case 'share_badge': return stats.achievementsShared;

    default: return 0;
  }
};

const triggerEvaluation = async (
  stats: UserStats,
  achievements: UnlockedAchievements,
  resultContext: { durationMs: number; absDiff: number; isPerfect: boolean } | null
) => {
  const newlyUnlocked: AchievementDef[] = [];

  for (const def of ACHIEVEMENTS) {
    const currentProg = achievements[def.id] || { unlocked: false, unlockedAt: null, currentValue: 0 };
    
    if (currentProg.unlocked) continue; // Already unlocked

    let newValue = evaluateProgress(def, stats, resultContext || { durationMs: 0, absDiff: 100, isPerfect: false });
    
    // Fallbacks for one-off evaluations like mastery_60 
    if (def.id === 'mastery_60' && currentProg.currentValue === 1) newValue = 1;
    if (newValue > def.maxProgress) newValue = def.maxProgress;

    const newlyUnlockedThisTime = newValue >= def.maxProgress;
    
    achievements[def.id] = {
      unlocked: newlyUnlockedThisTime,
      unlockedAt: newlyUnlockedThisTime ? new Date().toISOString() : null,
      currentValue: newValue,
    };

    if (newlyUnlockedThisTime) {
      newlyUnlocked.push(def);
    }
  }

  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));

  return newlyUnlocked;
};

export const processGameResult = async (
  durationMs: number, 
  absDiff: number
): Promise<AchievementDef[]> => {
  const stats = await getStats();
  const achievements = await getAchievements();
  
  const isPerfect = absDiff < 0.05;
  const today = getTodayStr();

  // 1. Update Streaks & Plays
  stats.totalGamesPlayed += 1;
  if (isPerfect) stats.perfectHits += 1;

  if (stats.lastPlayDate !== today) {
    if (stats.lastPlayDate) {
      const lastDate = new Date(stats.lastPlayDate);
      const todayDate = new Date(today);
      const diffMs = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        stats.currentStreakDays += 1; // Continued streak
      } else if (diffDays > 1) {
        stats.currentStreakDays = 1; // Streak broken
      }
    } else {
      stats.currentStreakDays = 1; // First play ever
    }
    stats.lastPlayDate = today;
  }

  if (stats.currentStreakDays > stats.longestStreakDays) {
    stats.longestStreakDays = stats.currentStreakDays;
  }

  return await triggerEvaluation(stats, achievements, { durationMs, absDiff, isPerfect });
};

export const recordShare = async (type: 'result' | 'achievement'): Promise<AchievementDef[]> => {
  const stats = await getStats();
  const achievements = await getAchievements();
  
  if (type === 'result') {
    stats.resultsShared = (stats.resultsShared || 0) + 1;
  } else {
    stats.achievementsShared = (stats.achievementsShared || 0) + 1;
  }

  return await triggerEvaluation(stats, achievements, null);
};
