import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppData } from '../context/AppDataContext';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { SupabaseSetupModal } from '../components/SupabaseSetupModal';

type Props = {
  onSuccess?: () => void;
};

export function AuthScreen({ onSuccess }: Props) {
  const { setAuthSession } = useAppData();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [setupModalVisible, setSetupModalVisible] = useState(false);

  const handleAuth = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert('Missing fields', 'Please enter both email and password.');
      return;
    }

    if (!isSupabaseConfigured) {
      Alert.alert(
        'Supabase Not Connected',
        'Please enter your Supabase URL & Anon Key to authenticate.',
        [{ text: 'Connect Supabase', onPress: () => setSetupModalVisible(true) }]
      );
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
        });
        if (error) throw error;

        if (data.user) {
          // If session was returned or auto-signin active
          if (data.session) {
            setAuthSession(data.session, data.user);
            if (onSuccess) onSuccess();
          } else {
            // Attempt immediate sign in with the new credentials
            const signInRes = await supabase.auth.signInWithPassword({
              email: trimmedEmail,
              password,
            });
            if (signInRes.data.session && signInRes.data.user) {
              setAuthSession(signInRes.data.session, signInRes.data.user);
              if (onSuccess) onSuccess();
            } else {
              Alert.alert(
                'Account Created! 🎉',
                'Your Apex Habits account has been created. Please sign in now.',
                [{ text: 'Sign In', onPress: () => setMode('signin') }]
              );
            }
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (error) throw error;

        if (data.session && data.user) {
          setAuthSession(data.session, data.user);
          if (onSuccess) onSuccess();
        }
      }
    } catch (err: any) {
      Alert.alert('Authentication Error', err.message || 'Failed to authenticate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Ionicons name="flame" size={36} color="#6366F1" />
            </View>
            <Text style={styles.title}>Apex Habits</Text>
            <Text style={styles.subtitle}>
              {mode === 'signin'
                ? 'Sign in to your Apex Habits account'
                : 'Create an Apex Habits account to track & sync habits'}
            </Text>
          </View>

          {/* Config Setup Alert Banner */}
          {!isSupabaseConfigured && (
            <Pressable style={styles.setupBanner} onPress={() => setSetupModalVisible(true)}>
              <Ionicons name="cloud-offline" size={20} color="#F59E0B" />
              <View style={styles.setupBannerTextContainer}>
                <Text style={styles.setupBannerTitle}>Supabase Not Connected Yet</Text>
                <Text style={styles.setupBannerSub}>Tap to enter URL & Anon Key or edit .env</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#F59E0B" />
            </Pressable>
          )}

          {/* Mode Switcher */}
          <View style={styles.tabRow}>
            <Pressable
              style={[styles.tab, mode === 'signin' && styles.tabActive]}
              onPress={() => setMode('signin')}
            >
              <Text style={[styles.tabText, mode === 'signin' && styles.tabTextActive]}>Sign In</Text>
            </Pressable>
            <Pressable
              style={[styles.tab, mode === 'signup' && styles.tabActive]}
              onPress={() => setMode('signup')}
            >
              <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>Create Account</Text>
            </Pressable>
          </View>

          {/* Form Inputs */}
          <View style={styles.form}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#6B7280"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#6B7280"
                secureTextEntry={!showPassword}
              />
              <Pressable style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#9CA3AF" />
              </Pressable>
            </View>

            <Pressable
              style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {mode === 'signin' ? 'Sign In to Apex Habits' : 'Create Apex Habits Account'}
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SupabaseSetupModal
        visible={setupModalVisible}
        onClose={() => setSetupModalVisible(false)}
        onSuccess={() => {}}
      />
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
  content: {
    padding: 24,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#16161A',
    borderWidth: 1,
    borderColor: '#26262E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F4F4F5',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 6,
    textAlign: 'center',
  },
  setupBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A160B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3B2E1E',
    gap: 12,
  },
  setupBannerTextContainer: {
    flex: 1,
  },
  setupBannerTitle: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '700',
  },
  setupBannerSub: {
    color: '#D97706',
    fontSize: 12,
    marginTop: 2,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#16161A',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#26262E',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#6366F1',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 8,
    marginTop: 12,
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
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16161A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#26262E',
    paddingRight: 14,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#F4F4F5',
  },
  eyeButton: {
    padding: 4,
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
