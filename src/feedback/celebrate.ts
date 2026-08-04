import * as Haptics from 'expo-haptics';
import { Settings } from '../types';
import { ChimePlayer } from './sound';

export function celebrateHabit(settings: Settings, chime: ChimePlayer) {
  if (settings.hapticsEnabled) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
  if (settings.soundEnabled) {
    chime.playHabitComplete();
  }
}

export function celebrateChallenge(settings: Settings, chime: ChimePlayer) {
  if (settings.hapticsEnabled) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
  if (settings.soundEnabled) {
    chime.playChallengeComplete();
  }
}
