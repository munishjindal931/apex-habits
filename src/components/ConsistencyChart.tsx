import { StyleSheet, Text, View } from 'react-native';
import { todayKey } from '../habitUtils';

const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function weekdayInitial(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00`);
  return WEEKDAY_INITIALS[d.getDay()];
}

type Props = {
  series: { date: string; ratio: number }[];
  trackHeight?: number;
};

export function ConsistencyChart({ series, trackHeight = 120 }: Props) {
  const today = todayKey();

  return (
    <View style={styles.container}>
      <View style={[styles.track, { height: trackHeight }]}>
        {series.map((point) => {
          const barHeight = Math.max(4, point.ratio * trackHeight);
          const isToday = point.date === today;
          return (
            <View key={point.date} style={styles.barColumn}>
              <View style={[styles.bar, { height: barHeight }, isToday && styles.barToday]} />
            </View>
          );
        })}
      </View>
      {series.length <= 7 && (
        <View style={styles.labelRow}>
          {series.map((point) => (
            <Text key={point.date} style={styles.label}>
              {weekdayInitial(point.date)}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  bar: {
    width: '70%',
    borderRadius: 6,
    backgroundColor: '#C7E9D2',
  },
  barToday: {
    backgroundColor: '#34C759',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  label: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    color: '#8E8E93',
  },
});
