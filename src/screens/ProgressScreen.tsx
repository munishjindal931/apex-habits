import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppData } from '../context/AppDataContext';
import { ChallengeBanner } from '../components/ChallengeBanner';
import { ConsistencyChart } from '../components/ConsistencyChart';
import { CreateChallengeModal } from '../components/CreateChallengeModal';
import { getChallengeProgress, getConsistencySeries, getStreak } from '../habitUtils';

export function ProgressScreen() {
  const { habits, challenges } = useAppData();
  const [challengeModalVisible, setChallengeModalVisible] = useState(false);
  const weekSeries = getConsistencySeries(habits, 7);
  const monthSeries = getConsistencySeries(habits, 30);
  const bestCurrentStreak = habits.reduce((max, h) => Math.max(max, getStreak(h)), 0);

  // Overall 7-day average completion percentage
  const avg7Day = Math.round(
    (weekSeries.reduce((acc, curr) => acc + curr.ratio, 0) / (weekSeries.length || 1)) * 100
  );

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
            <Text style={styles.statLabel} numberOfLines={2}>
              Total Habits
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>🔥 {bestCurrentStreak}</Text>
            <Text style={styles.statLabel} numberOfLines={2}>
              Best Active Streak
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{avg7Day}%</Text>
            <Text style={styles.statLabel} numberOfLines={2}>
              7-Day Avg Rate
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>This Week's Daily Consistency</Text>
        <View style={styles.card}>
          <ConsistencyChart series={weekSeries} />
        </View>

        <Text style={styles.sectionTitle}>30-Day Completion Trend</Text>
        <View style={styles.card}>
          <ConsistencyChart series={monthSeries} trackHeight={80} />
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitleNoMargin}>Active Kickstart Challenges</Text>
          {habits.length > 0 && (
            <Pressable style={styles.createChallengeBtn} onPress={() => setChallengeModalVisible(true)}>
              <Text style={styles.createChallengeBtnText}>+ New Challenge</Text>
            </Pressable>
          )}
        </View>
        {active.length === 0 ? (
          <Text style={styles.emptyText}>No active challenges running. Tap "+ New Challenge" to launch one!</Text>
        ) : (
          active.map(({ challenge, progress }) => (
            <ChallengeBanner
              key={challenge.id}
              challenge={challenge}
              progress={progress}
              onPress={() => {}}
            />
          ))
        )}

        <Text style={styles.sectionTitle}>Past Challenge History</Text>
        {past.length === 0 ? (
          <Text style={styles.emptyText}>No completed or past challenges yet.</Text>
        ) : (
          past.map(({ challenge, progress }) => (
            <View key={challenge.id} style={styles.challengeRow}>
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeName}>{challenge.habitName}</Text>
                <Text style={styles.challengeTag}>{challenge.lengthDays}-Day Kickstart</Text>
              </View>
              <Text style={[styles.challengeProgress, progress.status === 'completed' ? styles.won : styles.lost]}>
                {progress.status === 'completed' ? '🏆 Completed' : 'Not completed'}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <CreateChallengeModal visible={challengeModalVisible} onClose={() => setChallengeModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0B0B0E',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: 80,
    backgroundColor: '#16161A',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#26262E',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F4F4F5',
    textAlign: 'center',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    marginTop: 26,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 26,
    marginBottom: 10,
  },
  sectionTitleNoMargin: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  createChallengeBtn: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  createChallengeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#16161A',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#26262E',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
  },
  challengeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#16161A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#26262E',
  },
  challengeInfo: {
    flex: 1,
  },
  challengeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F4F4F5',
  },
  challengeTag: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  challengeProgress: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  won: {
    color: '#22C55E',
    fontWeight: '700',
  },
  lost: {
    color: '#EF4444',
  },
});
