import { Pressable, StyleSheet, Text, View } from 'react-native';
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
  return (
    <Pressable style={[styles.card, isComplete && styles.cardDone]} onPress={onPress}>
      {habit.type === 'binary' ? (
        <Pressable
          style={[styles.checkbox, isComplete && styles.checkboxDone]}
          hitSlop={8}
          onPress={onToggle}
        >
          {isComplete && <Text style={styles.checkmark}>✓</Text>}
        </Pressable>
      ) : (
        <View style={styles.stepper}>
          <Pressable style={styles.stepperButton} hitSlop={8} onPress={onDecrement}>
            <Text style={styles.stepperButtonText}>−</Text>
          </Pressable>
          <Text style={styles.stepperCount}>
            {todayCount}/{habit.targetCount}
          </Text>
          <Pressable style={styles.stepperButton} hitSlop={8} onPress={onIncrement}>
            <Text style={styles.stepperButtonText}>+</Text>
          </Pressable>
        </View>
      )}
      <View style={styles.cardText}>
        <Text style={[styles.habitName, isComplete && styles.habitNameDone]}>{habit.name}</Text>
        <Text style={styles.streak}>{streak > 0 ? `🔥 ${streak} day streak` : 'No streak yet'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardDone: {
    backgroundColor: '#EAF9EE',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  checkboxDone: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
  },
  stepperButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  stepperCount: {
    minWidth: 40,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: '#48484A',
  },
  cardText: {
    flex: 1,
  },
  habitName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  habitNameDone: {
    color: '#248A3D',
  },
  streak: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
});
