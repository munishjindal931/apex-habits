import { useAudioPlayer } from 'expo-audio';

const habitCompleteSource = require('../../assets/sounds/habit-complete.wav');
const challengeCompleteSource = require('../../assets/sounds/challenge-complete.wav');

export function useChimePlayer() {
  const habitPlayer = useAudioPlayer(habitCompleteSource);
  const challengePlayer = useAudioPlayer(challengeCompleteSource);

  const playHabitComplete = () => {
    habitPlayer.seekTo(0);
    habitPlayer.play();
  };

  const playChallengeComplete = () => {
    challengePlayer.seekTo(0);
    challengePlayer.play();
  };

  return { playHabitComplete, playChallengeComplete };
}

export type ChimePlayer = ReturnType<typeof useChimePlayer>;
