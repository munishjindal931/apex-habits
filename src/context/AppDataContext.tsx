import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useHabits } from '../hooks/useHabits';
import { useChallenges } from '../hooks/useChallenges';
import { useSettings } from '../hooks/useSettings';
import { useChimePlayer } from '../feedback/sound';
import { celebrateChallenge, celebrateHabit } from '../feedback/celebrate';
import { syncHabitReminders } from '../feedback/notifications';
import {
  dateKeyDaysAgo,
  getChallengeProgress,
  getSimulatedDateOffset,
  isDayComplete,
  setSimulatedDateOffset,
  todayKey,
} from '../habitUtils';
import { CelebrationKind } from '../components/CelebrationOverlay';
import { Challenge, Habit } from '../types';

function useAppDataValue() {
  const habitsApi = useHabits();
  const challengesApi = useChallenges();
  const settingsApi = useSettings();
  const chime = useChimePlayer();

  const [celebration, setCelebration] = useState<{ kind: CelebrationKind; label?: string }>({ kind: null });
  const [devToolsVisible, setDevToolsVisible] = useState(false);
  const [, setTick] = useState(0);

  const forceUpdate = useCallback(() => setTick((t) => t + 1), []);

  const loaded = habitsApi.loaded && challengesApi.loaded && settingsApi.loaded;

  useEffect(() => {
    if (!loaded) return;
    syncHabitReminders(habitsApi.habits, settingsApi.settings.notificationsEnabled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, habitsApi.habits, settingsApi.settings.notificationsEnabled]);

  const activeChallenges = useMemo(
    () =>
      challengesApi.challenges
        .map((challenge) => {
          const habit = habitsApi.habits.find((h) => h.id === challenge.habitId);
          return { challenge, habit, progress: getChallengeProgress(challenge, habit) };
        })
        .filter((entry): entry is { challenge: Challenge; habit: Habit; progress: ReturnType<typeof getChallengeProgress> } =>
          Boolean(entry.habit) && entry.progress.status === 'active'
        ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [challengesApi.challenges, habitsApi.habits, todayKey()]
  );

  const logHabit = useCallback(
    (habitId: string, delta: number) => {
      const habit = habitsApi.habits.find((h) => h.id === habitId);
      if (!habit) return;

      const today = todayKey();
      const current = habit.log[today] ?? 0;
      const wasComplete = isDayComplete(habit, today);
      const nextCount = Math.max(0, Math.min(current + delta, habit.targetCount));
      if (nextCount === current) return;

      habitsApi.setLogCount(habitId, today, nextCount);
      const nowComplete = nextCount >= habit.targetCount;
      if (wasComplete || !nowComplete) return;

      const relatedChallenge = challengesApi.challenges.find((c) => {
        if (c.habitId !== habitId || c.celebrated) return false;
        return getChallengeProgress(c, habit).status === 'active';
      });

      const projectedHabit: Habit = { ...habit, log: { ...habit.log, [today]: nextCount } };
      const willCompleteChallenge =
        relatedChallenge && getChallengeProgress(relatedChallenge, projectedHabit).status === 'completed';

      if (relatedChallenge && willCompleteChallenge) {
        celebrateChallenge(settingsApi.settings, chime);
        setCelebration({ kind: 'challenge', label: `${relatedChallenge.lengthDays}-Day Kickstart Complete!` });
        challengesApi.markCelebrated(relatedChallenge.id);
      } else {
        celebrateHabit(settingsApi.settings, chime);
        setCelebration({ kind: 'habit' });
      }
    },
    [habitsApi, challengesApi, settingsApi.settings, chime]
  );

  const triggerCelebration = useCallback(
    (kind: 'habit' | 'challenge') => {
      if (kind === 'challenge') {
        celebrateChallenge(settingsApi.settings, chime);
        setCelebration({ kind: 'challenge', label: 'Challenge Complete!' });
      } else {
        celebrateHabit(settingsApi.settings, chime);
        setCelebration({ kind: 'habit' });
      }
    },
    [settingsApi.settings, chime]
  );

  const advanceSimulatedDate = useCallback(
    (days: number) => {
      const current = getSimulatedDateOffset();
      setSimulatedDateOffset(current + days);
      forceUpdate();
    },
    [forceUpdate]
  );

  const resetSimulatedDate = useCallback(() => {
    setSimulatedDateOffset(0);
    forceUpdate();
  }, [forceUpdate]);

  const fastCompleteActiveChallenge = useCallback(
    (challengeId: string) => {
      const challenge = challengesApi.challenges.find((c) => c.id === challengeId);
      if (!challenge) return;
      const habit = habitsApi.habits.find((h) => h.id === challenge.habitId);
      if (!habit) return;

      // Log habit as target count for all challenge days up to today
      const updatedLog = { ...habit.log };
      for (let i = 0; i < challenge.lengthDays; i += 1) {
        const date = dateKeyDaysAgo(i);
        updatedLog[date] = habit.targetCount;
      }
      habitsApi.updateHabit(habit.id, { log: updatedLog });
      celebrateChallenge(settingsApi.settings, chime);
      setCelebration({ kind: 'challenge', label: `${challenge.lengthDays}-Day Challenge Complete!` });
      challengesApi.markCelebrated(challenge.id);
      forceUpdate();
    },
    [challengesApi.challenges, habitsApi.habits, habitsApi, settingsApi.settings, chime, forceUpdate]
  );

  const seedMockHistory = useCallback(() => {
    if (habitsApi.habits.length === 0) return;
    habitsApi.habits.forEach((habit) => {
      const newLog = { ...habit.log };
      // seed 14 days of ~80% random completion
      for (let i = 1; i <= 14; i += 1) {
        const date = dateKeyDaysAgo(i);
        if (i % 5 !== 0) {
          newLog[date] = habit.targetCount;
        }
      }
      habitsApi.updateHabit(habit.id, { log: newLog });
    });
    forceUpdate();
  }, [habitsApi, forceUpdate]);

  const clearCelebration = useCallback(() => setCelebration({ kind: null }), []);

  const removeHabit = useCallback(
    (id: string) => {
      habitsApi.removeHabit(id);
      challengesApi.removeChallengesForHabit(id);
    },
    [habitsApi, challengesApi]
  );

  return {
    habits: habitsApi.habits,
    addHabit: habitsApi.addHabit,
    updateHabit: habitsApi.updateHabit,
    removeHabit,
    logHabit,
    challenges: challengesApi.challenges,
    startChallenge: challengesApi.startChallenge,
    activeChallenges,
    settings: settingsApi.settings,
    updateSettings: settingsApi.updateSettings,
    loaded,
    celebration: celebration.kind,
    celebrationLabel: celebration.label,
    clearCelebration,
    devToolsVisible,
    setDevToolsVisible,
    advanceSimulatedDate,
    resetSimulatedDate,
    triggerCelebration,
    fastCompleteActiveChallenge,
    seedMockHistory,
  };
}

type AppData = ReturnType<typeof useAppDataValue>;

const AppDataContext = createContext<AppData | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const value = useAppDataValue();
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppData {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}

