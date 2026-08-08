import { HabitType } from '../types';

export type HabitPreset = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: HabitType;
  targetCount: number;
  reminderTime: string | null;
};

export const HABIT_PRESETS: HabitPreset[] = [
  {
    id: 'preset_water',
    name: 'Drink Water',
    icon: 'water',
    color: '#0284C7',
    type: 'count',
    targetCount: 8,
    reminderTime: '09:00',
  },
  {
    id: 'preset_exercise',
    name: 'Morning Workout',
    icon: 'fitness',
    color: '#10B981',
    type: 'binary',
    targetCount: 1,
    reminderTime: '07:30',
  },
  {
    id: 'preset_read',
    name: 'Read 20 Pages',
    icon: 'book',
    color: '#8B5CF6',
    type: 'binary',
    targetCount: 1,
    reminderTime: '21:00',
  },
  {
    id: 'preset_meditation',
    name: 'Daily Meditation',
    icon: 'leaf',
    color: '#F59E0B',
    type: 'binary',
    targetCount: 1,
    reminderTime: '08:00',
  },
  {
    id: 'preset_healthy',
    name: 'Eat Healthy',
    icon: 'nutrition',
    color: '#EC4899',
    type: 'binary',
    targetCount: 1,
    reminderTime: '12:30',
  },
  {
    id: 'preset_sleep',
    name: 'Sleep 8 Hours',
    icon: 'moon',
    color: '#6366F1',
    type: 'binary',
    targetCount: 1,
    reminderTime: '22:30',
  },
  {
    id: 'preset_code',
    name: 'Practice Coding',
    icon: 'code-slash',
    color: '#3B82F6',
    type: 'binary',
    targetCount: 1,
    reminderTime: '18:00',
  },
  {
    id: 'preset_journal',
    name: 'Night Journaling',
    icon: 'create',
    color: '#14B8A6',
    type: 'binary',
    targetCount: 1,
    reminderTime: '21:30',
  },
  {
    id: 'preset_walk',
    name: '10,000 Steps',
    icon: 'footsteps',
    color: '#F97316',
    type: 'count',
    targetCount: 10,
    reminderTime: '17:00',
  },
];

export const AVAILABLE_ICONS = [
  'water',
  'fitness',
  'book',
  'leaf',
  'nutrition',
  'moon',
  'code-slash',
  'create',
  'footsteps',
  'bicycle',
  'barbell',
  'heart',
  'flame',
  'musical-notes',
  'sparkles',
  'sunny',
  'walk',
  'cafe',
  'journal',
  'trophy',
  'time',
  'bonfire',
  'brush',
  'headset',
];

export const AVAILABLE_COLORS = [
  '#0284C7', // Sky Blue
  '#10B981', // Emerald Green
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#3B82F6', // Blue
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#EF4444', // Red
];
