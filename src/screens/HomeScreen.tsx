import { useLayoutEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppData } from '../context/AppDataContext';
import { HabitCard } from '../components/HabitCard';
import { ChallengeBanner } from '../components/ChallengeBanner';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { getStreak, isDayComplete, todayKey } from '../habitUtils';

import { DevToolsModal } from '../components/DevToolsModal';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const {
    habits,
    logHabit,
    activeChallenges,
    celebration,
    celebrationLabel,
    clearCelebration,
    devToolsVisible,
    setDevToolsVisible,
  } = useAppData();
  const today = todayKey();
  const doneCount = habits.filter((h) => isDayComplete(h, today)).length;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Today',
      headerRight: () => (
        <View style={styles.headerButtons}>
          <Pressable onPress={() => setDevToolsVisible(true)} hitSlop={8} style={styles.headerButton}>
            <Ionicons name="bug-outline" size={20} color="#FF9500" />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Progress')} hitSlop={8} style={styles.headerButton}>
            <Ionicons name="stats-chart" size={20} color="#F4F4F5" />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={8} style={styles.headerButton}>
            <Ionicons name="settings-outline" size={20} color="#F4F4F5" />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('AddEditHabit')} hitSlop={8} style={styles.headerButtonPrimary}>
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      ),
    });
  }, [navigation, setDevToolsVisible]);

  const percent = habits.length > 0 ? Math.round((doneCount / habits.length) * 100) : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* Hero Progress Banner */}
            <View style={styles.heroCard}>
              <View style={styles.heroRow}>
                <View style={styles.heroTextContainer}>
                  <Text style={styles.heroDate}>{today}</Text>
                  <Text style={styles.heroTitle}>
                    {doneCount === habits.length && habits.length > 0
                      ? '⚡ All Habits Complete'
                      : 'Today\'s Progress'}
                  </Text>
                  <Text style={styles.heroSubtitle}>
                    {habits.length === 0
                      ? 'No habits created yet. Tap + to add one!'
                      : `${doneCount} of ${habits.length} habits completed (${percent}%)`}
                  </Text>
                </View>
                <View style={styles.percentBadge}>
                  <Text style={styles.percentText}>{percent}%</Text>
                </View>
              </View>

              {/* Progress Bar */}
              {habits.length > 0 && (
                <View style={styles.progressBarTrack}>
                  <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
                </View>
              )}
            </View>

            {/* Active Challenge Banners */}
            {activeChallenges.map(({ challenge, progress }) => (
              <ChallengeBanner
                key={challenge.id}
                challenge={challenge}
                progress={progress}
                onPress={() => navigation.navigate('HabitDetail', { habitId: challenge.habitId })}
              />
            ))}
          </View>
        }
        renderItem={({ item }) => {
          const todayCount = item.log[today] ?? 0;
          const isComplete = isDayComplete(item, today);
          const streak = getStreak(item);
          return (
            <HabitCard
              habit={item}
              todayCount={todayCount}
              isComplete={isComplete}
              streak={streak}
              onPress={() => navigation.navigate('HabitDetail', { habitId: item.id })}
              onToggle={() => logHabit(item.id, isComplete ? -1 : 1)}
              onIncrement={() => logHabit(item.id, 1)}
              onDecrement={() => logHabit(item.id, -1)}
            />
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No habits created yet.</Text>
            <Pressable style={styles.emptyButton} onPress={() => navigation.navigate('AddEditHabit')}>
              <Text style={styles.emptyButtonText}>+ Create Habit</Text>
            </Pressable>
          </View>
        }
      />
      <CelebrationOverlay kind={celebration} label={celebrationLabel} onDone={clearCelebration} />
      <DevToolsModal visible={devToolsVisible} onClose={() => setDevToolsVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0B0B0E',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    flexGrow: 1,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  headerContainer: {
    marginBottom: 4,
  },
  heroCard: {
    backgroundColor: '#16161A',
    borderRadius: 20,
    padding: 20,
    marginTop: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#26262E',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  heroDate: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366F1',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F4F4F5',
    marginTop: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  percentBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#26262E',
    borderRadius: 4,
    marginTop: 18,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#16161A',
    borderWidth: 1,
    borderColor: '#26262E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonPrimary: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
