import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useHabits } from '../hooks/useHabits';
import { useChallenges } from '../hooks/useChallenges';
import { useSettings } from '../hooks/useSettings';
import { useChimePlayer } from '../feedback/sound';
import { celebrateChallenge, celebrateHabit } from '../feedback/celebrate';
import { syncHabitReminders } from '../feedback/notifications';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  dateKeyDaysAgo,
  getChallengeProgress,
  getSimulatedDateOffset,
  isDayComplete,
  setSimulatedDateOffset,
  todayKey,
} from '../habitUtils';
import { CelebrationKind } from '../components/CelebrationOverlay';
import { Challenge, Habit, NewHabitInput } from '../types';

function useAppDataValue() {
  const habitsApi = useHabits();
  const challengesApi = useChallenges();
  const settingsApi = useSettings();
  const chime = useChimePlayer();

  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(true);
  const [celebration, setCelebration] = useState<{ kind: CelebrationKind; label?: string }>({ kind: null });
  const [devToolsVisible, setDevToolsVisible] = useState(false);
  const [, setTick] = useState(0);

  const forceUpdate = useCallback(() => setTick((t) => t + 1), []);

  const loaded = habitsApi.loaded && challengesApi.loaded && settingsApi.loaded;

  // Supabase Auth State Listener
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) setIsGuest(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) setIsGuest(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync with Supabase on Auth Login
  useEffect(() => {
    if (!user || isGuest || !isSupabaseConfigured) return;

    const pullFromSupabase = async () => {
      try {
        // Fetch Habits
        const { data: remoteHabits } = await supabase.from('habits').select('*').eq('user_id', user.id);
        // Fetch Habit Logs
        const { data: remoteLogs } = await supabase.from('habit_logs').select('*').eq('user_id', user.id);
        // Fetch Challenges
        const { data: remoteChallenges } = await supabase.from('challenges').select('*').eq('user_id', user.id);

        if (remoteHabits) {
          const logMap: Record<string, Record<string, number>> = {};
          if (remoteLogs) {
            remoteLogs.forEach((l) => {
              if (!logMap[l.habit_id]) logMap[l.habit_id] = {};
              logMap[l.habit_id][l.date] = l.count;
            });
          }

          const mergedHabits: Habit[] = remoteHabits.map((rh) => ({
            id: rh.id,
            name: rh.name,
            type: rh.type,
            targetCount: rh.target_count,
            createdAt: rh.created_at || new Date().toISOString(),
            reminderTime: rh.reminder_time,
            icon: rh.icon,
            color: rh.color,
            log: logMap[rh.id] || {},
          }));

          mergedHabits.forEach((h) => habitsApi.updateHabit(h.id, h));
        }

        if (remoteChallenges) {
          const mergedChallenges: Challenge[] = remoteChallenges.map((rc) => ({
            id: rc.id,
            habitId: rc.habit_id,
            habitName: rc.habit_name,
            lengthDays: rc.length_days,
            startDate: rc.start_date,
            celebrated: false,
          }));

          mergedChallenges.forEach((c) => {
            if (!challengesApi.challenges.some((existing) => existing.id === c.id)) {
              challengesApi.startChallenge({ id: c.habitId, name: c.habitName } as Habit, c.lengthDays);
            }
          });
        }
      } catch (err) {
        console.warn('Background Supabase pull sync warning:', err);
      }
    };

    pullFromSupabase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!loaded) return;
    syncHabitReminders(habitsApi.habits, settingsApi.settings.notificationsEnabled);
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

  // Local-First Add Habit with Supabase Sync
  const addHabit = useCallback(
    (input: NewHabitInput): Habit => {
      const habit = habitsApi.addHabit(input);

      if (user && !isGuest && isSupabaseConfigured) {
        supabase
          .from('habits')
          .insert({
            id: habit.id,
            user_id: user.id,
            name: habit.name,
            type: habit.type,
            target_count: habit.targetCount,
            reminder_time: habit.reminderTime,
            icon: habit.icon,
            color: habit.color,
          })
          .then(({ error }) => {
            if (error) console.warn('Supabase habit insert warning:', error);
          });
      }
      return habit;
    },
    [habitsApi, user, isGuest]
  );

  // Local-First Update Habit with Supabase Sync
  const updateHabit = useCallback(
    (id: string, updates: Partial<Omit<Habit, 'id'>>) => {
      habitsApi.updateHabit(id, updates);

      if (user && !isGuest && isSupabaseConfigured) {
        const payload: Record<string, any> = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.type !== undefined) payload.type = updates.type;
        if (updates.targetCount !== undefined) payload.target_count = updates.targetCount;
        if (updates.reminderTime !== undefined) payload.reminder_time = updates.reminderTime;
        if (updates.icon !== undefined) payload.icon = updates.icon;
        if (updates.color !== undefined) payload.color = updates.color;

        if (Object.keys(payload).length > 0) {
          supabase
            .from('habits')
            .update(payload)
            .eq('id', id)
            .eq('user_id', user.id)
            .then(({ error }) => {
              if (error) console.warn('Supabase habit update warning:', error);
            });
        }
      }
    },
    [habitsApi, user, isGuest]
  );

  // Local-First Remove Habit with Supabase Sync
  const removeHabit = useCallback(
    (id: string) => {
      habitsApi.removeHabit(id);
      challengesApi.removeChallengesForHabit(id);

      if (user && !isGuest && isSupabaseConfigured) {
        supabase
          .from('habits')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)
          .then(({ error }) => {
            if (error) console.warn('Supabase habit delete warning:', error);
          });
      }
    },
    [habitsApi, challengesApi, user, isGuest]
  );

  // Local-First Log Habit with Supabase Sync
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

      // Async Sync Log to Supabase
      if (user && !isGuest && isSupabaseConfigured) {
        supabase
          .from('habit_logs')
          .upsert(
            {
              user_id: user.id,
              habit_id: habitId,
              date: today,
              count: nextCount,
            },
            { onConflict: 'user_id,habit_id,date' }
          )
          .then(({ error }) => {
            if (error) console.warn('Supabase habit_log upsert warning:', error);
          });
      }

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
    [habitsApi, challengesApi, settingsApi.settings, chime, user, isGuest]
  );

  // Local-First Start Challenge with Supabase Sync
  const startChallenge = useCallback(
    (habit: Habit, lengthDays: number): Challenge => {
      const challenge = challengesApi.startChallenge(habit, lengthDays);

      if (user && !isGuest && isSupabaseConfigured) {
        supabase
          .from('challenges')
          .insert({
            id: challenge.id,
            user_id: user.id,
            habit_id: challenge.habitId,
            habit_name: challenge.habitName,
            length_days: challenge.lengthDays,
            start_date: challenge.startDate,
            status: 'active',
          })
          .then(({ error }) => {
            if (error) console.warn('Supabase challenge insert warning:', error);
          });
      }
      return challenge;
    },
    [challengesApi, user, isGuest]
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

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUser(null);
    setIsGuest(true);
  }, []);

  const signInAsGuest = useCallback(() => {
    setIsGuest(true);
  }, []);

  return {
    habits: habitsApi.habits,
    addHabit,
    updateHabit,
    removeHabit,
    logHabit,
    challenges: challengesApi.challenges,
    startChallenge,
    activeChallenges,
    settings: settingsApi.settings,
    updateSettings: settingsApi.updateSettings,
    loaded,
    session,
    user,
    isGuest,
    signOut,
    signInAsGuest,
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
