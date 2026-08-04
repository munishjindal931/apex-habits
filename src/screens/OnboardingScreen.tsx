import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAppData } from '../context/AppDataContext';
import { Habit, HabitType } from '../types';

export function OnboardingScreen() {
  const { addHabit, startChallenge, updateSettings } = useAppData();
  const [step, setStep] = useState<'create' | 'challenge'>('create');
  const [name, setName] = useState('');
  const [type, setType] = useState<HabitType>('binary');
  const [targetCount, setTargetCount] = useState(3);
  const [createdHabit, setCreatedHabit] = useState<Habit | null>(null);

  const finish = () => updateSettings({ onboardingComplete: true });

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const habit = addHabit({ name: trimmed, type, targetCount, reminderTime: null });
    setCreatedHabit(habit);
    setStep('challenge');
  };

  const handleStartChallenge = () => {
    if (createdHabit) startChallenge(createdHabit, 3);
    finish();
  };

  if (step === 'challenge' && createdHabit) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.emoji}>🔥</Text>
          <Text style={styles.title}>Kick off with a 3-day challenge?</Text>
          <Text style={styles.subtitle}>
            Do "{createdHabit.name}" three days in a row and earn a bonus reward. You can start challenges for any
            habit later too.
          </Text>
          <Pressable style={styles.primaryButton} onPress={handleStartChallenge}>
            <Text style={styles.primaryButtonText}>Start the challenge</Text>
          </Pressable>
          <Pressable style={styles.skipButton} onPress={finish}>
            <Text style={styles.skipButtonText}>Maybe later</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome 👋</Text>
          <Text style={styles.subtitle}>What's the first habit you want to build?</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="e.g. Drink water"
            value={name}
            onChangeText={setName}
            returnKeyType="done"
            onSubmitEditing={handleCreate}
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
            <View style={styles.stepperRow}>
              <Text style={styles.label}>Target per day</Text>
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
        </View>

        <Pressable
          style={[styles.primaryButton, !name.trim() && styles.primaryButtonDisabled]}
          onPress={handleCreate}
          disabled={!name.trim()}
        >
          <Text style={styles.primaryButtonText}>Create habit</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 15,
    color: '#6E6E73',
    marginTop: 8,
    textAlign: 'left',
    lineHeight: 21,
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 28,
    flex: 1,
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6E6E73',
    marginTop: 24,
    marginBottom: 10,
    textTransform: 'uppercase',
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
  stepperRow: {
    marginTop: 4,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  stepperCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    minWidth: 30,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: 16,
    marginHorizontal: 24,
    marginBottom: 16,
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
  skipButton: {
    marginTop: 4,
    paddingVertical: 10,
  },
  skipButtonText: {
    color: '#8E8E93',
    fontSize: 15,
    fontWeight: '600',
  },
});
