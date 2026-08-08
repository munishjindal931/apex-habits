import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../types';

type Props = {
  habit: Habit;
  todayCount: number;
  isComplete: boolean;
  streak: number;
  onPress: () => void;
  onToggle: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
};

export function HabitCard({ habit, todayCount, isComplete, streak, onPress, onToggle, onIncrement, onDecrement }: Props) {
  const themeColor = habit.color ?? '#6366F1';
  const iconName = (habit.icon as any) ?? 'flame';

  return (
    <Pressable style={[styles.card, isComplete && styles.cardDone]} onPress={onPress}>
      {/* Habit Icon Badge */}
      <View style={[styles.iconBadge, { backgroundColor: isComplete ? themeColor : `${themeColor}20` }]}>
        <Ionicons name={iconName} size={20} color={isComplete ? '#FFFFFF' : themeColor} />
      </View>

      {/* Habit Info */}
      <View style={styles.cardText}>
        <Text style={[styles.habitName, isComplete && styles.habitNameDone]} numberOfLines={1}>
          {habit.name}
        </Text>
        <Text style={styles.streak} numberOfLines={1}>
          {streak > 0 ? `🔥 ${streak} day streak` : 'Daily habit'}
        </Text>
      </View>

      {/* Completion Control */}
      {habit.type === 'binary' ? (
        <Pressable
          style={[styles.checkbox, isComplete && { backgroundColor: '#22C55E', borderColor: '#22C55E' }]}
          hitSlop={8}
          onPress={onToggle}
        >
          {isComplete && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
        </Pressable>
      ) : (
        <View style={styles.stepper}>
          <Pressable style={styles.stepperButton} hitSlop={8} onPress={onDecrement}>
            <Text style={styles.stepperButtonText}>−</Text>
          </Pressable>
          <Text style={styles.stepperCount}>
            {todayCount}/{habit.targetCount}
          </Text>
          <Pressable style={[styles.stepperButton, isComplete && { backgroundColor: '#22C55E' }]} hitSlop={8} onPress={onIncrement}>
            <Text style={[styles.stepperButtonText, isComplete && { color: '#FFFFFF' }]}>+</Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16161A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#26262E',
  },
  cardDone: {
    backgroundColor: '#131916',
    borderColor: '#1E3A2B',
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardText: {
    flex: 1,
    marginRight: 10,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F4F4F5',
  },
  habitNameDone: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  streak: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 3,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#3F3F46',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#202026',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepperButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#202026',
    borderWidth: 1,
    borderColor: '#26262E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F4F4F5',
  },
  stepperCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F4F4F5',
    minWidth: 34,
    textAlign: 'center',
  },
});
