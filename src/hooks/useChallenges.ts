import { useCallback, useEffect, useState } from 'react';
import { Challenge, Habit } from '../types';
import { loadChallenges, saveChallenges } from '../storage';
import { todayKey } from '../habitUtils';

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadChallenges().then((stored) => {
      setChallenges(stored);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveChallenges(challenges);
  }, [challenges, loaded]);

  const startChallenge = useCallback((habit: Habit, lengthDays: number): Challenge => {
    const challenge: Challenge = {
      id: Date.now().toString(),
      habitId: habit.id,
      habitName: habit.name,
      lengthDays,
      startDate: todayKey(),
      celebrated: false,
    };
    setChallenges((prev) => [...prev, challenge]);
    return challenge;
  }, []);

  const markCelebrated = useCallback((id: string) => {
    setChallenges((prev) => prev.map((c) => (c.id === id ? { ...c, celebrated: true } : c)));
  }, []);

  const removeChallengesForHabit = useCallback((habitId: string) => {
    setChallenges((prev) => prev.filter((c) => c.habitId !== habitId));
  }, []);

  return { challenges, loaded, startChallenge, markCelebrated, removeChallengesForHabit };
}
