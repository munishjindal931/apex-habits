import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Challenge, ChallengeProgress } from '../types';

type Props = {
  challenge: Challenge;
  progress: ChallengeProgress;
  onPress: () => void;
};

export function ChallengeBanner({ challenge, progress, onPress }: Props) {
  const dots = Array.from({ length: challenge.lengthDays }, (_, i) => i < progress.daysCompleted);

  return (
    <Pressable style={styles.banner} onPress={onPress}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>
          🔥 {challenge.lengthDays}-Day Challenge · {challenge.habitName}
        </Text>
        <Text style={styles.subtitle}>
          {progress.status === 'active'
            ? `Day ${progress.daysCompleted + 1} of ${challenge.lengthDays}`
            : `${progress.daysCompleted}/${challenge.lengthDays} days complete`}
        </Text>
      </View>
      <View style={styles.dots}>
        {dots.map((done, i) => (
          <View key={i} style={[styles.dot, done && styles.dotDone]} />
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  textBlock: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    color: '#C7C7CC',
    fontSize: 13,
    marginTop: 2,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#48484A',
  },
  dotDone: {
    backgroundColor: '#FFCC00',
  },
});
