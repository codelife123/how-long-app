import AsyncStorage from '@react-native-async-storage/async-storage';

const PB_PREFIX = '@pb_how_long_';

export const getPB = async (durationLabel: string): Promise<number | null> => {
  try {
    const val = await AsyncStorage.getItem(`${PB_PREFIX}${durationLabel}`);
    if (val !== null) {
      return Number(val);
    }
  } catch (e) {
    console.error('Error fetching pb', e);
  }
  return null;
};

export const savePB = async (durationLabel: string, diffMs: number): Promise<boolean> => {
  try {
    const absoluteDiff = Math.abs(diffMs);
    const existing = await getPB(durationLabel);
    // Lower diff is better!
    if (existing === null || absoluteDiff < existing) {
      await AsyncStorage.setItem(`${PB_PREFIX}${durationLabel}`, absoluteDiff.toString());
      return true; // it is a new PB
    }
  } catch (e) {
    console.error('Error saving pb', e);
  }
  return false;
};

const HISTORY_KEY = '@how_long_history_v1';

export interface HistoryEntry {
  id: string;
  durationLabel: string;
  durationMs: number;
  guessedMs: number;
  timestamp: number;
}

export const getHistory = async (): Promise<HistoryEntry[]> => {
  try {
    const val = await AsyncStorage.getItem(HISTORY_KEY);
    if (val !== null) {
      return JSON.parse(val);
    }
  } catch (e) {
    console.error('Error fetching history', e);
  }
  return [];
};

export const saveHistory = async (entry: Omit<HistoryEntry, 'id'|'timestamp'>): Promise<void> => {
   try {
     const history = await getHistory();
     const newEntry: HistoryEntry = {
       ...entry,
       id: Math.random().toString(36).substr(2, 9),
       timestamp: Date.now(),
     };
     const newHistory = [newEntry, ...history].slice(0, 50); // Keep last 50
     await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
   } catch(e) {
     console.error('Error saving history', e);
   }
};
