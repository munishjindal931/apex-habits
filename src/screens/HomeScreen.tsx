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

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { habits, logHabit, activeChallenges, celebration, celebrationLabel, clearCelebration } = useAppData();
  const today = todayKey();
  const doneCount = habits.filter((h) => isDayComplete(h, today)).length;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Today',
      headerRight: () => (
        <View style={styles.headerButtons}>
          <Pressable onPress={() => navigation.navigate('Progress')} hitSlop={8} style={styles.headerButton}>
            <Ionicons name="stats-chart" size={22} color="#1C1C1E" />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={8} style={styles.headerButton}>
            <Ionicons name="settings-outline" size={22} color="#1C1C1E" />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('AddEditHabit')} hitSlop={8} style={styles.headerButton}>
            <Ionicons name="add-circle" size={26} color="#007AFF" />
          </Pressable>
        </View>
      ),
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Text style={styles.subtitle}>
              {habits.length === 0 ? 'Add your first habit below' : `${doneCount}/${habits.length} done today`}
            </Text>
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
            <Text style={styles.emptyText}>No habits yet.</Text>
            <Pressable style={styles.emptyButton} onPress={() => navigation.navigate('AddEditHabit')}>
              <Text style={styles.emptyButtonText}>Add a habit</Text>
            </Pressable>
          </View>
        }
      />
      <CelebrationOverlay kind={celebration} label={celebrationLabel} onDone={clearCelebration} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexGrow: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#6E6E73',
    marginTop: 4,
    marginBottom: 14,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerButton: {
    padding: 2,
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 15,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
