import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppData } from '../context/AppDataContext';
import { ConsistencyChart } from '../components/ConsistencyChart';
import { getChallengeProgress, getConsistencySeries, getStreak } from '../habitUtils';

export function ProgressScreen() {
  const { habits, challenges } = useAppData();
  const weekSeries = getConsistencySeries(habits, 7);
  const monthSeries = getConsistencySeries(habits, 30);
  const bestCurrentStreak = habits.reduce((max, h) => Math.max(max, getStreak(h)), 0);

  const decorated = challenges
    .map((challenge) => {
      const habit = habits.find((h) => h.id === challenge.habitId);
      return { challenge, progress: getChallengeProgress(challenge, habit) };
    })
    .sort((a, b) => (a.challenge.startDate < b.challenge.startDate ? 1 : -1));

  const active = decorated.filter((d) => d.progress.status === 'active');
  const past = decorated.filter((d) => d.progress.status !== 'active');

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{habits.length}</Text>
            <Text style={styles.statLabel}>Habits</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{bestCurrentStreak}</Text>
            <Text style={styles.statLabel}>Longest active streak</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>This week</Text>
        <View style={styles.card}>
          <ConsistencyChart series={weekSeries} />
        </View>

        <Text style={styles.sectionTitle}>Last 30 days</Text>
        <View style={styles.card}>
          <ConsistencyChart series={monthSeries} trackHeight={80} />
        </View>

        <Text style={styles.sectionTitle}>Active challenges</Text>
        {active.length === 0 ? (
          <Text style={styles.emptyText}>No active challenges. Start one from a habit's detail page.</Text>
        ) : (
          active.map(({ challenge, progress }) => (
            <View key={challenge.id} style={styles.challengeRow}>
              <Text style={styles.challengeName}>{challenge.habitName}</Text>
              <Text style={styles.challengeProgress}>
                Day {progress.daysCompleted + 1} of {challenge.lengthDays}
              </Text>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>Past challenges</Text>
        {past.length === 0 ? (
          <Text style={styles.emptyText}>Nothing here yet.</Text>
        ) : (
          past.map(({ challenge, progress }) => (
            <View key={challenge.id} style={styles.challengeRow}>
              <Text style={styles.challengeName}>{challenge.habitName}</Text>
              <Text style={[styles.challengeProgress, progress.status === 'completed' ? styles.won : styles.lost]}>
                {progress.status === 'completed' ? '🏆 Completed' : 'Not completed'}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6E6E73',
    marginTop: 28,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  challengeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  challengeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  challengeProgress: {
    fontSize: 13,
    color: '#8E8E93',
  },
  won: {
    color: '#248A3D',
    fontWeight: '600',
  },
  lost: {
    color: '#FF3B30',
  },
});
