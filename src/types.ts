export type HabitType = 'binary' | 'count';

export type Habit = {
  id: string;
  name: string;
  type: HabitType;
  targetCount: number;
  createdAt: string;
  reminderTime: string | null;
  icon?: string;
  color?: string;
  log: Record<string, number>;
};

export type NewHabitInput = Omit<Habit, 'id' | 'createdAt' | 'log'>;

export type ChallengeStatus = 'active' | 'completed' | 'failed';

export type Challenge = {
  id: string;
  habitId: string;
  habitName: string;
  lengthDays: number;
  startDate: string;
  celebrated: boolean;
};

export type ChallengeProgress = {
  status: ChallengeStatus;
  daysCompleted: number;
};

export type Settings = {
  onboardingComplete: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
};
