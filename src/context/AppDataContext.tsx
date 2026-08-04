import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useHabits } from '../hooks/useHabits';
import { useChallenges } from '../hooks/useChallenges';
import { useSettings } from '../hooks/useSettings';
import { useChimePlayer } from '../feedback/sound';
import { celebrateChallenge, celebrateHabit } from '../feedback/celebrate';
import { syncHabitReminders } from '../feedback/notifications';
import { getChallengeProgress, isDayComplete, todayKey } from '../habitUtils';
import { CelebrationKind } from '../components/CelebrationOverlay';
import { Challenge, Habit } from '../types';

function useAppDataValue() {
  const habitsApi = useHabits();
  const challengesApi = useChallenges();
  const settingsApi = useSettings();
  const chime = useChimePlayer();

  const [celebration, setCelebration] = useState<{ kind: CelebrationKind; label?: string }>({ kind: null });

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
    [challengesApi.challenges, habitsApi.habits]
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
        setCelebration({ kind: 'challenge', label: `${relatedChallenge.lengthDays}-Day Challenge Complete!` });
        challengesApi.markCelebrated(relatedChallenge.id);
      } else {
        celebrateHabit(settingsApi.settings, chime);
        setCelebration({ kind: 'habit' });
      }
    },
    [habitsApi, challengesApi, settingsApi.settings, chime]
  );

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
