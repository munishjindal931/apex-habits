import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HABIT_PRESETS, HabitPreset } from '../constants/presets';

type Props = {
  selectedPresetId?: string;
  onSelectPreset: (preset: HabitPreset) => void;
};

export function PresetSelector({ selectedPresetId, onSelectPreset }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>⚡ Quick Select Preset Habit</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {HABIT_PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <Pressable
              key={preset.id}
              style={[
                styles.presetPill,
                { borderColor: isSelected ? preset.color : '#26262E' },
                isSelected && { backgroundColor: preset.color },
              ]}
              onPress={() => onSelectPreset(preset)}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : `${preset.color}25` },
                ]}
              >
                <Ionicons
                  name={preset.icon as any}
                  size={16}
                  color={isSelected ? '#FFFFFF' : preset.color}
                />
              </View>
              <Text style={[styles.presetName, isSelected && styles.presetNameSelected]}>
                {preset.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  scrollContent: {
    gap: 10,
    paddingRight: 10,
  },
  presetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16161A',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#26262E',
    gap: 8,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F4F4F5',
  },
  presetNameSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
