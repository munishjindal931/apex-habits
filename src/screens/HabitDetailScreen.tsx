import { useLayoutEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppData } from '../context/AppDataContext';
import { CalendarHeatmap } from '../components/CalendarHeatmap';
import { getBestStreak, getChallengeProgress, getStreak, getTotalCompletions } from '../habitUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'HabitDetail'>;

export function HabitDetailScreen({ navigation, route }: Props) {
  const { habits, challenges, startChallenge } = useAppData();
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
            <Text style={styles.statValue}>{getStreak(habit)}</Text>
            <Text style={styles.statLabel}>Current streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{getBestStreak(habit)}</Text>
            <Text style={styles.statLabel}>Best streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{getTotalCompletions(habit)}</Text>
            <Text style={styles.statLabel}>Total days</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Last 30 days</Text>
        <CalendarHeatmap habit={habit} days={30} />

        {!hasActiveChallenge && (
          <Pressable style={styles.challengeButton} onPress={() => startChallenge(habit, 3)}>
            <Text style={styles.challengeButtonText}>🔥 Start a 3-day challenge</Text>
          </Pressable>
        )}

        <Text style={styles.sectionTitle}>Log</Text>
        {recentDates.length === 0 ? (
          <Text style={styles.emptyLog}>No completions logged yet.</Text>
        ) : (
          recentDates.map((date) => (
            <View key={date} style={styles.logRow}>
              <Text style={styles.logDate}>{date}</Text>
              <Text style={styles.logCount}>
                {habit.log[date]}/{habit.targetCount}
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
  missing: {
    padding: 20,
    color: '#8E8E93',
    textAlign: 'center',
  },
  editLink: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
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
  challengeButton: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  challengeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyLog: {
    color: '#8E8E93',
    fontSize: 14,
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  logDate: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  logCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
});
