import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppData } from '../context/AppDataContext';
import { requestNotificationPermission } from '../feedback/notifications';

export function SettingsScreen() {
  const { settings, updateSettings } = useAppData();

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
            <Text style={styles.rowHint}>Set reminder times per habit on its edit screen.</Text>
          </View>
          <Switch value={settings.notificationsEnabled} onValueChange={handleToggleNotifications} />
        </View>

        <Text style={styles.sectionTitle}>Reward feedback</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Sound</Text>
          <Switch value={settings.soundEnabled} onValueChange={(v) => updateSettings({ soundEnabled: v })} />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Haptics</Text>
          <Switch value={settings.hapticsEnabled} onValueChange={(v) => updateSettings({ hapticsEnabled: v })} />
        </View>
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
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6E6E73',
    marginTop: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  rowText: {
    flex: 1,
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  rowHint: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 3,
  },
});
