import { StyleSheet, View } from 'react-native';
import { Habit } from '../types';
import { dateKeyDaysAgo, isDayComplete, todayKey } from '../habitUtils';

type Props = {
  habit: Habit;
  days?: number;
};

export function CalendarHeatmap({ habit, days = 30 }: Props) {
  const today = todayKey();
  const cells = Array.from({ length: days }, (_, i) => dateKeyDaysAgo(days - 1 - i));

  return (
    <View style={styles.grid}>
      {cells.map((date) => {
        const complete = isDayComplete(habit, date);
        const isToday = date === today;
        return <View key={date} style={[styles.cell, complete && styles.cellDone, isToday && styles.cellToday]} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cell: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#EDEDF2',
  },
  cellDone: {
    backgroundColor: '#34C759',
  },
  cellToday: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
});
