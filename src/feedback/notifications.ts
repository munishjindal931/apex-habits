import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Habit } from '../types';

// expo-notifications doesn't implement local scheduling on web; the reminder
// feature is mobile-only there.
const SUPPORTS_SCHEDULING = Platform.OS !== 'web';

if (SUPPORTS_SCHEDULING) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!SUPPORTS_SCHEDULING) return false;
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

function reminderIdFor(habitId: string): string {
  return `habit-reminder:${habitId}`;
}

export async function cancelHabitReminder(habitId: string): Promise<void> {
  if (!SUPPORTS_SCHEDULING) return;
  await Notifications.cancelScheduledNotificationAsync(reminderIdFor(habitId));
}

export async function scheduleHabitReminder(habit: Habit): Promise<void> {
  if (!SUPPORTS_SCHEDULING) return;
  await cancelHabitReminder(habit.id);
  if (!habit.reminderTime) return;

  const [hour, minute] = habit.reminderTime.split(':').map(Number);
  await Notifications.scheduleNotificationAsync({
    identifier: reminderIdFor(habit.id),
    content: {
      title: 'Habit check-in',
      body: `Don't forget: ${habit.name}`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function syncHabitReminders(habits: Habit[], notificationsEnabled: boolean): Promise<void> {
  if (!SUPPORTS_SCHEDULING) return;
  if (!notificationsEnabled) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return;
  }
  await Promise.all(habits.map((habit) => scheduleHabitReminder(habit)));
}
