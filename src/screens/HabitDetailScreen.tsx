import { useLayoutEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppData } from '../context/AppDataContext';
import { CalendarHeatmap } from '../components/CalendarHeatmap';
import { CreateChallengeModal } from '../components/CreateChallengeModal';
import {
  getBestStreak,
  getChallengeProgress,
  getCompletionRate,
  getStreak,
  getTotalCompletions,
} from '../habitUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'HabitDetail'>;

export function HabitDetailScreen({ navigation, route }: Props) {
  const { habits, challenges } = useAppData();
  const [challengeModalVisible, setChallengeModalVisible] = useState(false);
  const habit = habits.find((h) => h.id === route.params.habitId);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: habit?.name ?? 'Habit',
      headerRight: () =>
        habit ? (
          <Pressable onPress={() => navigation.navigate('AddEditHabit', { habitId: habit.id })} hitSlop={8}>
            <Text style={styles.editLink}>Edit</Text>
          </Pressable>
        ) : null,
    });
  }, [navigation, habit]);

  if (!habit) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.missing}>This habit was deleted.</Text>
      </SafeAreaView>
    );
  }

  const hasActiveChallenge = challenges.some(
    (c) => c.habitId === habit.id && getChallengeProgress(c, habit).status === 'active'
  );

  const rate30 = getCompletionRate(habit, 30);
  const recentDates = Object.keys(habit.log)
    .filter((date) => habit.log[date] > 0)
    .sort()
    .reverse()
    .slice(0, 14);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>🔥 {getStreak(habit)}</Text>
            <Text style={styles.statLabel} numberOfLines={2}>
              Current Streak
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>🏆 {getBestStreak(habit)}</Text>
            <Text style={styles.statLabel} numberOfLines={2}>
              Best Streak
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{rate30}%</Text>
            <Text style={styles.statLabel} numberOfLines={2}>
              30-Day Rate
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{getTotalCompletions(habit)}</Text>
            <Text style={styles.statLabel} numberOfLines={2}>
              Total Days
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Last 30 days history</Text>
        <View style={styles.heatmapCard}>
          <CalendarHeatmap habit={habit} days={30} />
        </View>

        {!hasActiveChallenge && (
          <Pressable style={styles.challengeButton} onPress={() => setChallengeModalVisible(true)}>
            <Text style={styles.challengeButtonText}>🔥 Start a Kickstart Challenge</Text>
          </Pressable>
        )}

        <Text style={styles.sectionTitle}>Recent Completions Log</Text>
        {recentDates.length === 0 ? (
          <Text style={styles.emptyLog}>No completions logged yet.</Text>
        ) : (
          recentDates.map((date) => (
            <View key={date} style={styles.logRow}>
              <Text style={styles.logDate}>{date}</Text>
              <Text style={styles.logCount}>
                {habit.log[date]}/{habit.targetCount} completed
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <CreateChallengeModal
        visible={challengeModalVisible}
        habitId={habit.id}
        onClose={() => setChallengeModalVisible(false)}
      />
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
  missing: {
    padding: 20,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  editLink: {
    color: '#6366F1',
    fontSize: 15,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: 70,
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
  heatmapCard: {
    backgroundColor: '#16161A',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#26262E',
  },
  challengeButton: {
    backgroundColor: '#6366F1',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  challengeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyLog: {
    color: '#6B7280',
    fontSize: 14,
  },
  logRow: {
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
  logDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F4F4F5',
  },
  logCount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#22C55E',
  },
});
