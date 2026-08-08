import { Challenge, ChallengeProgress, Habit } from './types';

let simulatedOffsetDays = 0;

export function setSimulatedDateOffset(offset: number) {
  simulatedOffsetDays = offset;
}

export function getSimulatedDateOffset(): number {
  return simulatedOffsetDays;
}

function getNow(): Date {
  const d = new Date();
  if (simulatedOffsetDays !== 0) {
    d.setDate(d.getDate() + simulatedOffsetDays);
  }
  return d;
}

function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayKey(): string {
  return formatDateKey(getNow());
}

export function dateKeyDaysAgo(days: number, from: string = todayKey()): string {
  const [year, month, day] = from.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() - days);
  return formatDateKey(d);
}

export function dateKeyDaysAfter(days: number, from: string): string {
  return dateKeyDaysAgo(-days, from);
}

export function isDayComplete(habit: Habit, date: string): boolean {
  return (habit.log[date] ?? 0) >= habit.targetCount;
}

export function getStreak(habit: Habit): number {
  let streak = 0;
  let offset = isDayComplete(habit, todayKey()) ? 0 : 1;
  while (isDayComplete(habit, dateKeyDaysAgo(offset))) {
    streak += 1;
    offset += 1;
  }
  return streak;
}

export function getBestStreak(habit: Habit): number {
  const days = Object.keys(habit.log).sort();
  if (days.length === 0) return 0;
  let best = 0;
  let current = 0;
  let prevDate: string | null = null;
  for (const date of days) {
    if (!isDayComplete(habit, date)) continue;
    if (prevDate && dateKeyDaysAfter(1, prevDate) === date) {
      current += 1;
    } else {
      current = 1;
    }
    best = Math.max(best, current);
    prevDate = date;
  }
  return best;
}

export function getTotalCompletions(habit: Habit): number {
  return Object.keys(habit.log).filter((date) => isDayComplete(habit, date)).length;
}

export function getCompletionRate(habit: Habit, daysCount: number): number {
  if (daysCount <= 0) return 0;
  let completedCount = 0;
  for (let offset = 0; offset < daysCount; offset += 1) {
    const date = dateKeyDaysAgo(offset);
    if (isDayComplete(habit, date)) {
      completedCount += 1;
    }
  }
  return Math.round((completedCount / daysCount) * 100);
}

export function getChallengeProgress(challenge: Challenge, habit: Habit | undefined): ChallengeProgress {
  if (!habit) return { status: 'failed', daysCompleted: 0 };

  const today = todayKey();
  let daysCompleted = 0;

  for (let i = 0; i < challenge.lengthDays; i += 1) {
    const date = dateKeyDaysAfter(i, challenge.startDate);
    const complete = isDayComplete(habit, date);

    if (complete) {
      daysCompleted += 1;
      continue;
    }

    if (date < today) {
      return { status: 'failed', daysCompleted };
    }
    return { status: 'active', daysCompleted };
  }

  return { status: 'completed', daysCompleted };
}

export function getConsistencySeries(habits: Habit[], days: number): { date: string; ratio: number }[] {
  const series: { date: string; ratio: number }[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = dateKeyDaysAgo(offset);
    const relevant = habits.filter((h) => h.createdAt <= date);
    const ratio = relevant.length === 0 ? 0 : relevant.filter((h) => isDayComplete(h, date)).length / relevant.length;
    series.push({ date, ratio });
  }
  return series;
}

