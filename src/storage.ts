import AsyncStorage from '@react-native-async-storage/async-storage';
import { Challenge, Habit, Settings } from './types';
import { todayKey } from './habitUtils';

const HABITS_KEY = 'habit-tracker:habits';
const CHALLENGES_KEY = 'habit-tracker:challenges';
const SETTINGS_KEY = 'habit-tracker:settings';

const DEFAULT_SETTINGS: Settings = {
  onboardingComplete: false,
  notificationsEnabled: false,
  soundEnabled: true,
  hapticsEnabled: true,
};

type LegacyHabit = {
  id: string;
  name: string;
  completedDates: string[];
};

function isLegacyHabit(raw: unknown): raw is LegacyHabit {
  return (
    typeof raw === 'object' &&
    raw !== null &&
    Array.isArray((raw as LegacyHabit).completedDates) &&
    !('log' in raw)
  );
}

function migrateHabit(raw: LegacyHabit): Habit {
  const sortedDates = [...raw.completedDates].sort();
  return {
    id: raw.id,
    name: raw.name,
    type: 'binary',
    targetCount: 1,
    createdAt: sortedDates[0] ?? todayKey(),
    reminderTime: null,
    log: Object.fromEntries(sortedDates.map((date) => [date, 1])),
  };
}

export async function loadHabits(): Promise<Habit[]> {
  const raw = await AsyncStorage.getItem(HABITS_KEY);
  if (!raw) return [];
  const parsed: unknown[] = JSON.parse(raw);
  return parsed.map((item) => (isLegacyHabit(item) ? migrateHabit(item) : (item as Habit)));
}

export async function saveHabits(habits: Habit[]): Promise<void> {
  await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export async function loadChallenges(): Promise<Challenge[]> {
  const raw = await AsyncStorage.getItem(CHALLENGES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveChallenges(challenges: Challenge[]): Promise<void> {
  await AsyncStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges));
}

export async function loadSettings(): Promise<Settings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
