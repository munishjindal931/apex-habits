import { useLayoutEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppData } from '../context/AppDataContext';
import { HabitType } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEditHabit'>;

function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = ((hour + 11) % 12) + 1;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
}

export function AddEditHabitScreen({ navigation, route }: Props) {
  const { habits, addHabit, updateHabit, removeHabit } = useAppData();
  const habitId = route.params?.habitId;
  const existing = habits.find((h) => h.id === habitId);
  const isEditing = Boolean(existing);

  const [name, setName] = useState(existing?.name ?? '');
  const [type, setType] = useState<HabitType>(existing?.type ?? 'binary');
  const [targetCount, setTargetCount] = useState(
    existing?.targetCount && existing.targetCount > 1 ? existing.targetCount : 3
  );
  const [reminderOn, setReminderOn] = useState(Boolean(existing?.reminderTime));
  const [hour, setHour] = useState(existing?.reminderTime ? Number(existing.reminderTime.split(':')[0]) : 9);
  const [minute, setMinute] = useState(existing?.reminderTime ? Number(existing.reminderTime.split(':')[1]) : 0);

  useLayoutEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Edit Habit' : 'New Habit' });
  }, [navigation, isEditing]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const reminderTime = reminderOn
      ? `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      : null;

    if (isEditing && existing) {
      updateHabit(existing.id, {
        name: trimmed,
        type,
        targetCount: type === 'binary' ? 1 : targetCount,
        reminderTime,
      });
    } else {
      addHabit({ name: trimmed, type, targetCount, reminderTime });
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    if (!existing) return;
    Alert.alert('Delete habit?', `This removes "${existing.name}" and its history.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeHabit(existing.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Habit name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Read"
          returnKeyType="done"
        />

        <Text style={styles.label}>How often per day?</Text>
        <View style={styles.typeRow}>
          <Pressable
            style={[styles.typeOption, type === 'binary' && styles.typeOptionActive]}
            onPress={() => setType('binary')}
          >
            <Text style={[styles.typeOptionText, type === 'binary' && styles.typeOptionTextActive]}>
              Once a day
            </Text>
          </Pressable>
          <Pressable
            style={[styles.typeOption, type === 'count' && styles.typeOptionActive]}
            onPress={() => setType('count')}
          >
            <Text style={[styles.typeOptionText, type === 'count' && styles.typeOptionTextActive]}>
              Multiple times
            </Text>
          </Pressable>
        </View>

        {type === 'count' && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Target per day</Text>
            <View style={styles.stepper}>
              <Pressable style={styles.stepperButton} onPress={() => setTargetCount((c) => Math.max(2, c - 1))}>
                <Text style={styles.stepperButtonText}>−</Text>
              </Pressable>
              <Text style={styles.stepperCount}>{targetCount}</Text>
              <Pressable style={styles.stepperButton} onPress={() => setTargetCount((c) => Math.min(10, c + 1))}>
                <Text style={styles.stepperButtonText}>+</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Daily reminder</Text>
          <Switch value={reminderOn} onValueChange={setReminderOn} />
        </View>

        {reminderOn && (
          <View style={styles.timeBlock}>
            <View style={styles.timeStepper}>
              <Pressable style={styles.stepperButton} onPress={() => setHour((h) => (h + 23) % 24)}>
                <Text style={styles.stepperButtonText}>−</Text>
              </Pressable>
              <Text style={styles.timeText}>{formatTime(hour, minute)}</Text>
              <Pressable style={styles.stepperButton} onPress={() => setHour((h) => (h + 1) % 24)}>
                <Text style={styles.stepperButtonText}>+</Text>
              </Pressable>
            </View>
            <View style={styles.minuteRow}>
              {[0, 15, 30, 45].map((m) => (
                <Pressable
                  key={m}
                  style={[styles.minuteOption, minute === m && styles.minuteOptionActive]}
                  onPress={() => setMinute(m)}
                >
                  <Text style={[styles.minuteOptionText, minute === m && styles.minuteOptionTextActive]}>
                    :{m.toString().padStart(2, '0')}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <Pressable
          style={[styles.primaryButton, !name.trim() && styles.primaryButtonDisabled]}
          onPress={handleSave}
          disabled={!name.trim()}
        >
          <Text style={styles.primaryButtonText}>{isEditing ? 'Save changes' : 'Create habit'}</Text>
        </Pressable>

        {isEditing && (
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete habit</Text>
          </Pressable>
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6E6E73',
    marginBottom: 10,
    marginTop: 20,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
  },
  typeOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  typeOptionTextActive: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E',
    minWidth: 24,
    textAlign: 'center',
  },
  timeBlock: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  timeStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  timeText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    minWidth: 110,
    textAlign: 'center',
  },
  minuteRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  minuteOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
  },
  minuteOptionActive: {
    backgroundColor: '#007AFF',
  },
  minuteOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  minuteOptionTextActive: {
    color: '#FFFFFF',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 32,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  deleteButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 10,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 15,
    fontWeight: '600',
  },
});
