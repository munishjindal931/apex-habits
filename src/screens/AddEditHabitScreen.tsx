import { useLayoutEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppData } from '../context/AppDataContext';
import { showAlert } from '../lib/alert';
import { PresetSelector } from '../components/PresetSelector';
import { AVAILABLE_COLORS, AVAILABLE_ICONS, HabitPreset } from '../constants/presets';
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
  const [icon, setIcon] = useState(existing?.icon ?? 'flame');
  const [color, setColor] = useState(existing?.color ?? '#3B82F6');
  const [type, setType] = useState<HabitType>(existing?.type ?? 'binary');
  const [targetCount, setTargetCount] = useState(
    existing?.targetCount && existing.targetCount > 1 ? existing.targetCount : 3
  );
  const [reminderOn, setReminderOn] = useState(Boolean(existing?.reminderTime));
  const [hour, setHour] = useState(existing?.reminderTime ? Number(existing.reminderTime.split(':')[0]) : 9);
  const [minute, setMinute] = useState(existing?.reminderTime ? Number(existing.reminderTime.split(':')[1]) : 0);
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>();

  useLayoutEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Edit Habit' : 'New Habit' });
  }, [navigation, isEditing]);

  const handleSelectPreset = (preset: HabitPreset) => {
    setSelectedPresetId(preset.id);
    setName(preset.name);
    setIcon(preset.icon);
    setColor(preset.color);
    setType(preset.type);
    setTargetCount(preset.targetCount);
    if (preset.reminderTime) {
      setReminderOn(true);
      const [h, m] = preset.reminderTime.split(':').map(Number);
      setHour(h);
      setMinute(m);
    }
  };

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
        icon,
        color,
      });
    } else {
      addHabit({ name: trimmed, type, targetCount, reminderTime, icon, color });
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    if (!existing) return;
    showAlert('Delete habit?', `This removes "${existing.name}" and its history.`, [
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
        {/* Preset Selector */}
        {!isEditing && (
          <PresetSelector selectedPresetId={selectedPresetId} onSelectPreset={handleSelectPreset} />
        )}

        <Text style={styles.label}>Habit Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={(val) => {
            setName(val);
            setSelectedPresetId(undefined);
          }}
          placeholder="e.g. Morning Run 20m"
          placeholderTextColor="#8E8E93"
          returnKeyType="done"
        />

        {/* Icon Picker */}
        <Text style={styles.label}>Habit Icon</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickerRow}>
          {AVAILABLE_ICONS.map((ic) => {
            const isSelected = icon === ic;
            return (
              <Pressable
                key={ic}
                style={[
                  styles.iconOption,
                  isSelected && { backgroundColor: color, borderColor: color },
                ]}
                onPress={() => setIcon(ic)}
              >
                <Ionicons name={ic as any} size={22} color={isSelected ? '#FFFFFF' : '#1C1C1E'} />
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Color Theme Picker */}
        <Text style={styles.label}>Theme Color</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickerRow}>
          {AVAILABLE_COLORS.map((c) => {
            const isSelected = color === c;
            return (
              <Pressable
                key={c}
                style={[styles.colorOption, { backgroundColor: c }, isSelected && styles.colorOptionSelected]}
                onPress={() => setColor(c)}
              >
                {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.label}>How often per day?</Text>
        <View style={styles.typeRow}>
          <Pressable
            style={[styles.typeOption, type === 'binary' && { backgroundColor: color, borderColor: color }]}
            onPress={() => setType('binary')}
          >
            <Text style={[styles.typeOptionText, type === 'binary' && styles.typeOptionTextActive]}>
              Once a day
            </Text>
          </Pressable>
          <Pressable
            style={[styles.typeOption, type === 'count' && { backgroundColor: color, borderColor: color }]}
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
          <Switch value={reminderOn} onValueChange={setReminderOn} trackColor={{ true: color }} />
        </View>

        {reminderOn && (
          <View style={styles.timeBlock}>
            <Text style={styles.timeBlockTitle}>Set Reminder Alarm Time</Text>
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
                  style={[styles.minuteOption, minute === m && { backgroundColor: color }]}
                  onPress={() => setMinute(m)}
                >
                  <Text style={[styles.minuteOptionText, minute === m && styles.minuteOptionTextActive]}>
                    :{m.toString().padStart(2, '0')}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={[styles.reminderConfirmedBadge, { backgroundColor: `${color}15` }]}>
              <Ionicons name="checkmark-circle" size={18} color={color} />
              <Text style={[styles.reminderConfirmedText, { color }]}>
                Daily alarm set for {formatTime(hour, minute)}
              </Text>
            </View>
          </View>
        )}

        <Pressable
          style={[styles.primaryButton, { backgroundColor: color }, !name.trim() && styles.primaryButtonDisabled]}
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
    backgroundColor: '#0B0B0E',
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
    marginBottom: 10,
    marginTop: 20,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  input: {
    backgroundColor: '#16161A',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#F4F4F5',
    borderWidth: 1,
    borderColor: '#26262E',
  },
  pickerRow: {
    gap: 10,
    paddingVertical: 4,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#16161A',
    borderWidth: 1,
    borderColor: '#26262E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#16161A',
    borderWidth: 1,
    borderColor: '#26262E',
    alignItems: 'center',
  },
  typeOptionActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  typeOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
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
    color: '#F4F4F5',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepperButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#202026',
    borderWidth: 1,
    borderColor: '#26262E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F4F4F5',
  },
  stepperCount: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F4F4F5',
    minWidth: 24,
    textAlign: 'center',
  },
  timeBlock: {
    marginTop: 16,
    backgroundColor: '#16161A',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#26262E',
  },
  timeBlockTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
    textAlign: 'center',
  },
  timeStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  timeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F4F4F5',
    minWidth: 110,
    textAlign: 'center',
  },
  minuteRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    marginBottom: 14,
  },
  minuteOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#202026',
    borderWidth: 1,
    borderColor: '#26262E',
  },
  minuteOptionActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  minuteOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  minuteOptionTextActive: {
    color: '#FFFFFF',
  },
  reminderConfirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  reminderConfirmedText: {
    fontSize: 13,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#6366F1',
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
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 10,
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
  },
});
