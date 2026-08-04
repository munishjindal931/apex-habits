export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  AddEditHabit: { habitId?: string } | undefined;
  HabitDetail: { habitId: string };
  Progress: undefined;
  Settings: undefined;
};
