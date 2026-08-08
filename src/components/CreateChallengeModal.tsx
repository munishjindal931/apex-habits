import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppData } from '../context/AppDataContext';

type Props = {
  visible: boolean;
  habitId?: string;
  onClose: () => void;
};

const DURATION_OPTIONS = [3, 7, 14, 30];

export function CreateChallengeModal({ visible, habitId, onClose }: Props) {
  const { habits, startChallenge } = useAppData();
  const [selectedHabitId, setSelectedHabitId] = useState<string>(habitId ?? habits[0]?.id ?? '');
  const [lengthDays, setLengthDays] = useState<number>(3);

  const activeHabitId = habitId ?? selectedHabitId;
  const habit = habits.find((h) => h.id === activeHabitId) ?? habits[0];

  const handleStart = () => {
    if (!habit) return;
    startChallenge(habit, lengthDays);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="trophy" size={22} color="#F59E0B" />
            <Text style={styles.title}>Create Kickstart Challenge</Text>
          </View>
          <Pressable style={styles.closeButton} onPress={onClose} hitSlop={10}>
            <Ionicons name="close-circle" size={26} color="#9CA3AF" />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {!habitId && habits.length > 0 && (
            <>
              <Text style={styles.label}>Select Target Habit</Text>
              <View style={styles.habitList}>
                {habits.map((h) => {
                  const isSelected = h.id === activeHabitId;
                  const themeColor = h.color ?? '#6366F1';
                  const iconName = (h.icon as any) ?? 'flame';
                  return (
                    <Pressable
                      key={h.id}
                      style={[
                        styles.habitOptionCard,
                        isSelected && { borderColor: themeColor, backgroundColor: `${themeColor}15` },
                      ]}
                      onPress={() => setSelectedHabitId(h.id)}
                    >
                      <View style={[styles.habitIconBadge, { backgroundColor: isSelected ? themeColor : `${themeColor}20` }]}>
                        <Ionicons name={iconName} size={20} color={isSelected ? '#FFFFFF' : themeColor} />
                      </View>
                      <Text style={[styles.habitOptionName, isSelected && { color: '#F4F4F5' }]}>
                        {h.name}
                      </Text>
                      <View style={[styles.radioCircle, isSelected && { backgroundColor: themeColor, borderColor: themeColor }]}>
                        {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          <Text style={styles.label}>Challenge Duration</Text>
          <View style={styles.durationRow}>
            {DURATION_OPTIONS.map((days) => {
              const isSelected = lengthDays === days;
              return (
                <Pressable
                  key={days}
                  style={[styles.durationCard, isSelected && styles.durationCardSelected]}
                  onPress={() => setLengthDays(days)}
                >
                  <Text style={[styles.durationNumber, isSelected && styles.durationNumberSelected]}>
                    {days}
                  </Text>
                  <Text style={[styles.durationLabel, isSelected && styles.durationLabelSelected]}>
                    Days Streak
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="sparkles" size={22} color="#F59E0B" />
            <Text style={styles.infoText}>
              Complete <Text style={styles.bold}>{habit?.name ?? 'your habit'}</Text> for {lengthDays} consecutive days
              to finish this kickstart challenge and earn a bonus reward!
            </Text>
          </View>

          <Pressable style={styles.startButton} onPress={handleStart} disabled={!habit}>
            <Text style={styles.startButtonText}>🔥 Start {lengthDays}-Day Kickstart</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#26262E',
    backgroundColor: '#16161A',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F4F4F5',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    marginTop: 18,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  habitList: {
    gap: 10,
    marginBottom: 6,
  },
  habitOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16161A',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#26262E',
  },
  habitIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  habitOptionName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#3F3F46',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#202026',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 10,
  },
  durationCard: {
    flex: 1,
    backgroundColor: '#16161A',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#26262E',
  },
  durationCardSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  durationNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F4F4F5',
  },
  durationNumberSelected: {
    color: '#FFFFFF',
  },
  durationLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: '600',
  },
  durationLabelSelected: {
    color: '#E0E7FF',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1A160B',
    borderRadius: 14,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#3B2E1E',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#F59E0B',
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
  },
  startButton: {
    backgroundColor: '#6366F1',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 28,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
