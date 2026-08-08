import { StyleSheet, View } from 'react-native';
import { Habit } from '../types';
import { dateKeyDaysAgo, isDayComplete, todayKey } from '../habitUtils';

type Props = {
  habit: Habit;
  days?: number;
};

export function CalendarHeatmap({ habit, days = 30 }: Props) {
  const today = todayKey();
  const themeColor = habit.color ?? '#22C55E';
  const cells = Array.from({ length: days }, (_, i) => dateKeyDaysAgo(days - 1 - i));

  return (
    <View style={styles.grid}>
      {cells.map((date) => {
        const complete = isDayComplete(habit, date);
        const isToday = date === today;
        return (
          <View
            key={date}
            style={[
              styles.cell,
              complete && { backgroundColor: themeColor },
              isToday && styles.cellToday,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  cell: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#202026',
    borderWidth: 1,
    borderColor: '#26262E',
  },
  cellToday: {
    borderWidth: 2,
    borderColor: '#F4F4F5',
  },
});
