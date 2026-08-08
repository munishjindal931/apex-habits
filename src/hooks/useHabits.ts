import { useCallback, useEffect, useState } from 'react';
import { Habit, HabitType } from '../types';
import { loadHabits, saveHabits } from '../storage';
import { todayKey } from '../habitUtils';

type NewHabitInput = {
  name: string;
  type: HabitType;
  targetCount: number;
  reminderTime: string | null;
  icon?: string;
  color?: string;
};

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadHabits().then((stored) => {
      setHabits(stored);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveHabits(habits);
  }, [habits, loaded]);

  const addHabit = useCallback((input: NewHabitInput): Habit => {
    const habit: Habit = {
      id: Date.now().toString(),
      name: input.name,
      type: input.type,
      targetCount: input.type === 'binary' ? 1 : Math.max(1, input.targetCount),
      createdAt: todayKey(),
      reminderTime: input.reminderTime,
      icon: input.icon ?? 'flame',
      color: input.color ?? '#3B82F6',
      log: {},
    };
    setHabits((prev) => [...prev, habit]);
    return habit;
  }, []);

  const updateHabit = useCallback((id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
  }, []);

  const removeHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const setLogCount = useCallback((id: string, date: string, count: number) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const clamped = Math.max(0, Math.min(count, h.targetCount));
        return { ...h, log: { ...h.log, [date]: clamped } };
      })
    );
  }, []);

  return { habits, loaded, addHabit, updateHabit, removeHabit, setLogCount };
}
