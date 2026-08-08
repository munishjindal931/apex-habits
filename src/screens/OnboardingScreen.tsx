import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppData } from '../context/AppDataContext';

export function OnboardingScreen() {
  const { updateSettings } = useAppData();

  const finish = () => updateSettings({ onboardingComplete: true });

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

        <Pressable style={styles.primaryButton} onPress={finish}>
          <Text style={styles.primaryButtonText}>Get Started →</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0B0B0E',
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
  primaryButton: {
    backgroundColor: '#6366F1',
    borderRadius: 14,
    paddingVertical: 16,
    marginHorizontal: 24,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
