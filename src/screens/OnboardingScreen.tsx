import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppData } from '../context/AppDataContext';
import { Habit, HabitType } from '../types';
import { PresetSelector } from '../components/PresetSelector';
import { HabitPreset } from '../constants/presets';
import { RootStackParamList } from '../navigation/types';

export function OnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { addHabit, startChallenge, updateSettings } = useAppData();
  const [step, setStep] = useState<'overview' | 'create' | 'challenge'>('overview');
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('flame');
  const [color, setColor] = useState('#3B82F6');
  const [type, setType] = useState<HabitType>('binary');
  const [targetCount, setTargetCount] = useState(3);
  const [createdHabit, setCreatedHabit] = useState<Habit | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>();

  const finish = () => updateSettings({ onboardingComplete: true });

  const handleSelectPreset = (preset: HabitPreset) => {
    setSelectedPresetId(preset.id);
    setName(preset.name);
    setIcon(preset.icon);
    setColor(preset.color);
    setType(preset.type);
    setTargetCount(preset.targetCount);
  };

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const habit = addHabit({ name: trimmed, type, targetCount, reminderTime: null, icon, color });
    setCreatedHabit(habit);
    setStep('challenge');
  };

  const handleStartChallenge = () => {
    if (createdHabit) startChallenge(createdHabit, 3);
    finish();
  };

  if (step === 'overview') {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.overviewContainer}>
          <View style={styles.overviewHeader}>
            <Text style={styles.logoEmoji}>✨</Text>
            <Text style={styles.title}>How It Works</Text>
            <Text style={styles.subtitle}>Build lasting daily habits with proven reward feedback loops.</Text>
          </View>

          <View style={styles.featureCards}>
            <View style={styles.featureCard}>
              <View style={styles.iconCircle}>
                <Ionicons name="checkbox" size={24} color="#007AFF" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>1. Create & Track</Text>
                <Text style={styles.featureDesc}>
                  Set up single check-off or daily counter targets (e.g. drink 8 glasses of water).
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.iconCircle}>
                <Ionicons name="trophy" size={24} color="#FF9500" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>2. Hit Milestones</Text>
                <Text style={styles.featureDesc}>
                  Kick off 3, 7, or 30-day streak challenges and earn animated celebratory rewards.
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.iconCircle}>
                <Ionicons name="analytics" size={24} color="#34C759" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>3. Visual Progress</Text>
                <Text style={styles.featureDesc}>
                  Track your monthly calendar heatmaps and consistency charts to stay motivated.
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.iconCircle}>
                <Ionicons name="cloud-done" size={24} color="#5856D6" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>4. Supabase Cloud Sync</Text>
                <Text style={styles.featureDesc}>
                  0ms local-first cache with automatic multi-device cloud database sync.
                </Text>
              </View>
            </View>
          </View>

          <Pressable style={styles.primaryButton} onPress={() => setStep('create')}>
            <Text style={styles.primaryButtonText}>Get Started →</Text>
          </Pressable>

          <Pressable
            style={styles.authButton}
            onPress={() => {
              finish();
              navigation.navigate('Auth');
            }}
          >
            <Ionicons name="log-in-outline" size={18} color="#6366F1" />
            <Text style={styles.authButtonText}>Already have an account? Sign In / Sign Up</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'challenge' && createdHabit) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.emoji}>🔥</Text>
          <Text style={styles.title}>Kick off with a 3-day challenge?</Text>
          <Text style={styles.subtitle}>
            Do "{createdHabit.name}" three days in a row and earn a bonus celebration reward!
          </Text>
          <Pressable style={styles.primaryButton} onPress={handleStartChallenge}>
            <Text style={styles.primaryButtonText}>Start 3-Day Challenge</Text>
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
          <Text style={styles.title}>Your First Habit 👋</Text>
          <Text style={styles.subtitle}>What habit would you like to track daily?</Text>
        </View>

        <View style={styles.form}>
          <PresetSelector selectedPresetId={selectedPresetId} onSelectPreset={handleSelectPreset} />

          <Text style={styles.label}>Habit Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Read 20 pages"
            placeholderTextColor="#8E8E93"
            value={name}
            onChangeText={(val) => {
              setName(val);
              setSelectedPresetId(undefined);
            }}
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
          <Text style={styles.primaryButtonText}>Create Habit</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0B0B0E',
  },
  flex: {
    flex: 1,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  overviewContainer: {
    padding: 24,
    paddingBottom: 40,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  overviewHeader: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  logoEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  featureCards: {
    gap: 16,
    marginBottom: 24,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16161A',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#26262E',
    gap: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#202026',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F4F4F5',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
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
    color: '#F4F4F5',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 21,
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 28,
    flex: 1,
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
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    marginTop: 24,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
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
  stepperRow: {
    marginTop: 4,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    backgroundColor: '#16161A',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#26262E',
  },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#202026',
    borderWidth: 1,
    borderColor: '#26262E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F4F4F5',
  },
  stepperCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F4F4F5',
    minWidth: 30,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    borderRadius: 14,
    paddingVertical: 16,
    marginHorizontal: 24,
    marginBottom: 12,
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
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginHorizontal: 24,
  },
  authButtonText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '700',
  },
  skipButton: {
    marginTop: 4,
    paddingVertical: 10,
  },
  skipButtonText: {
    color: '#9CA3AF',
    fontSize: 15,
  },
});
