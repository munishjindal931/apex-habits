import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { saveSupabaseCredentials, SUPABASE_ANON_KEY, SUPABASE_URL } from '../lib/supabase';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function SupabaseSetupModal({ visible, onClose, onSuccess }: Props) {
  const [url, setUrl] = useState(
    SUPABASE_URL.includes('your-') ? '' : SUPABASE_URL
  );
  const [key, setKey] = useState(
    SUPABASE_ANON_KEY.includes('your-') ? '' : SUPABASE_ANON_KEY
  );

  const handleSave = async () => {
    const success = await saveSupabaseCredentials(url, key);
    if (!success) {
      Alert.alert(
        'Invalid Credentials',
        'Please enter a valid Supabase Project URL (e.g. https://xyz.supabase.co) and Anon Key.'
      );
      return;
    }
    Alert.alert('Supabase Connected! 🎉', 'Your Supabase credentials have been saved.', [
      {
        text: 'OK',
        onPress: () => {
          onSuccess();
          onClose();
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="cloud-done" size={22} color="#6366F1" />
            <Text style={styles.title}>Connect Supabase Database</Text>
          </View>
          <Pressable style={styles.closeButton} onPress={onClose} hitSlop={10}>
            <Ionicons name="close-circle" size={26} color="#9CA3AF" />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.instructionCard}>
            <Text style={styles.instructionTitle}>📋 Quick Setup Guide</Text>
            <Text style={styles.instructionStep}>
              1. Create a free project at <Text style={styles.link}>https://database.new</Text>.
            </Text>
            <Text style={styles.instructionStep}>
              2. Go to <Text style={styles.bold}>Project Settings ➔ API</Text> and copy your <Text style={styles.bold}>URL</Text> and <Text style={styles.bold}>anon key</Text>.
            </Text>
            <Text style={styles.instructionStep}>
              3. Run the SQL script from <Text style={styles.code}>supabase/schema.sql</Text> in your Supabase SQL Editor.
            </Text>
          </View>

          <Text style={styles.label}>Supabase Project URL</Text>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            placeholder="https://xyzproject.supabase.co"
            placeholderTextColor="#6B7280"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Supabase Anon / Public Key</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={key}
            onChangeText={setKey}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            placeholderTextColor="#6B7280"
            autoCapitalize="none"
            autoCorrect={false}
            multiline
          />

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Connect & Save Credentials</Text>
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
    fontSize: 14,
    fontWeight: '700',
    color: '#F4F4F5',
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
  bold: {
    color: '#F4F4F5',
    fontWeight: '700',
  },
  code: {
    color: '#22C55E',
    fontWeight: '700',
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
    fontSize: 14,
    color: '#F4F4F5',
    borderWidth: 1,
    borderColor: '#26262E',
  },
  multilineInput: {
    height: 90,
    textAlignVertical: 'top',
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
