import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SUPABASE_URL } from '../lib/supabase';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function SupabaseSetupModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="cloud-done" size={22} color="#6366F1" />
            <Text style={styles.title}>Supabase Database Connected</Text>
          </View>
          <Pressable style={styles.closeButton} onPress={onClose} hitSlop={10}>
            <Ionicons name="close-circle" size={26} color="#9CA3AF" />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.instructionCard}>
            <Text style={styles.instructionTitle}>⚡ Live Database Connection Active</Text>
            <Text style={styles.instructionStep}>
              Connected Project: <Text style={styles.link}>{SUPABASE_URL}</Text>
            </Text>
            <Text style={styles.instructionStep}>
              Status: <Text style={styles.code}>Ready for User Sign In & Cloud Sync</Text>
            </Text>
          </View>

          <Pressable style={styles.saveButton} onPress={onClose}>
            <Text style={styles.saveButtonText}>Close</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#26262E',
    backgroundColor: '#16161A',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F4F4F5',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  instructionCard: {
    backgroundColor: '#16161A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#26262E',
    marginBottom: 20,
  },
  instructionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#22C55E',
    marginBottom: 10,
  },
  instructionStep: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 6,
  },
  link: {
    color: '#6366F1',
    fontWeight: '600',
  },
  code: {
    color: '#22C55E',
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: '#6366F1',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 28,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
