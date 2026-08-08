import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Challenge, ChallengeProgress } from '../types';

type Props = {
  challenge: Challenge;
  progress: ChallengeProgress;
  onPress: () => void;
};

export function ChallengeBanner({ challenge, progress, onPress }: Props) {
  const percent = Math.min(100, Math.round((progress.daysCompleted / challenge.lengthDays) * 100));
  const isShort = challenge.lengthDays <= 7;
  const dots = isShort
    ? Array.from({ length: challenge.lengthDays }, (_, i) => i < progress.daysCompleted)
    : [];

  return (
    <Pressable style={styles.banner} onPress={onPress}>
      {/* Top Row: Icon + Title + Percent Badge */}
      <View style={styles.topRow}>
        <View style={styles.leftBadge}>
          <Ionicons name="trophy" size={20} color="#F59E0B" />
        </View>
        <View style={styles.titleBlock}>
          <View style={styles.nameRow}>
            <Text style={styles.habitName} numberOfLines={1}>
              {challenge.habitName}
            </Text>
            <View style={styles.durationTag}>
              <Text style={styles.durationTagText}>{challenge.lengthDays}-Day Kickstart</Text>
            </View>
          </View>
          <Text style={styles.statusText}>
            {progress.status === 'active'
              ? `Day ${progress.daysCompleted + 1} of ${challenge.lengthDays} · ${percent}% complete`
              : `Completed ${progress.daysCompleted} of ${challenge.lengthDays} days`}
          </Text>
        </View>
        <View style={styles.percentBadge}>
          <Text style={styles.percentText}>{percent}%</Text>
        </View>
      </View>

      {/* Progress Bar Track */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
      </View>

      {/* For Short Challenges: Step Dots */}
      {isShort && (
        <View style={styles.dotsRow}>
          {dots.map((done, i) => (
            <View key={i} style={[styles.dot, done && styles.dotDone]}>
              {done && <Ionicons name="checkmark" size={10} color="#FFFFFF" />}
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#16161A',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#3B2E1E',
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#261E14',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleBlock: {
    flex: 1,
    marginRight: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  habitName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F4F4F5',
    flexShrink: 1,
  },
  durationTag: {
    backgroundColor: '#261E14',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  durationTagText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
  },
  statusText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 3,
    fontWeight: '500',
  },
  percentBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  percentText: {
    color: '#0B0B0E',
    fontSize: 13,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#26262E',
    borderRadius: 4,
    marginTop: 14,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
    justifyContent: 'flex-start',
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#26262E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: {
    backgroundColor: '#F59E0B',
  },
});
