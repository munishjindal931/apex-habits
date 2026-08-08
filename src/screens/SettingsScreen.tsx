import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppData } from '../context/AppDataContext';
import { requestNotificationPermission } from '../feedback/notifications';
import { DevToolsModal } from '../components/DevToolsModal';

export function SettingsScreen() {
  const { settings, updateSettings, devToolsVisible, setDevToolsVisible } = useAppData();

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

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
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
