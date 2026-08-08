import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppData } from '../context/AppDataContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { requestNotificationPermission } from '../feedback/notifications';
import { DevToolsModal } from '../components/DevToolsModal';

export function SettingsScreen() {
  const { settings, updateSettings, devToolsVisible, setDevToolsVisible, user, isGuest, signOut } = useAppData();

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(
          'Notifications disabled',
          'Enable notifications for this app in your device settings to get reminders.'
        );
        return;
      }
    }
    updateSettings({ notificationsEnabled: value });
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out?', 'You will be signed out of your cloud account. Local cache will remain.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Account & Sync Section */}
        <Text style={styles.sectionTitle}>Account & Supabase Cloud Sync</Text>
        <View style={styles.card}>
          <View style={styles.accountHeader}>
            <View style={styles.avatarCircle}>
              <Ionicons name={user ? 'person' : 'flash'} size={20} color="#6366F1" />
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>
                {user ? user.email : 'Guest Mode (Local Cache)'}
              </Text>
              <Text style={styles.accountStatus}>
                {user
                  ? 'Connected to Supabase Database'
                  : isSupabaseConfigured
                  ? 'Local Cache Active · Sign in to sync across devices'
                  : 'Supabase URL/Key needed for remote cloud sync'}
              </Text>
            </View>
          </View>

          <View style={styles.syncBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
            <Text style={styles.syncBadgeText}>0ms Local-First Cache Engine Active</Text>
          </View>

          {user && (
            <Pressable style={styles.signOutButton} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={16} color="#EF4444" />
              <Text style={styles.signOutButtonText}>Sign Out of Account</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.sectionTitle}>Reminders</Text>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Daily reminders</Text>
            <Text style={styles.rowHint}>Set custom reminder times per habit on its edit screen.</Text>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ true: '#6366F1' }}
          />
        </View>

        <Text style={styles.sectionTitle}>Reward Feedback</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Sound FX</Text>
          <Switch
            value={settings.soundEnabled}
            onValueChange={(v) => updateSettings({ soundEnabled: v })}
            trackColor={{ true: '#6366F1' }}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Haptic Feedback</Text>
          <Switch
            value={settings.hapticsEnabled}
            onValueChange={(v) => updateSettings({ hapticsEnabled: v })}
            trackColor={{ true: '#6366F1' }}
          />
        </View>

        <Text style={styles.sectionTitle}>Developer Testing</Text>
        <Pressable style={styles.devRow} onPress={() => setDevToolsVisible(true)}>
          <View style={styles.devRowLeft}>
            <Ionicons name="bug-outline" size={20} color="#FF9500" />
            <Text style={styles.devRowLabel}>Open Developer Test Tools</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </Pressable>
      </ScrollView>

      <DevToolsModal visible={devToolsVisible} onClose={() => setDevToolsVisible(false)} />
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
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    marginTop: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  card: {
    backgroundColor: '#16161A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#26262E',
    marginBottom: 8,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#202026',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F4F4F5',
  },
  accountStatus: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#14291D',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  syncBadgeText: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#26262E',
  },
  signOutButtonText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#16161A',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#26262E',
  },
  rowText: {
    flex: 1,
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F4F4F5',
  },
  rowHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 3,
  },
  devRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#16161A',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#26262E',
  },
  devRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  devRowLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F4F4F5',
  },
});
