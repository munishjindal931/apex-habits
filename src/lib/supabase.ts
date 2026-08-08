import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_URL_KEY = 'apex_habits_supabase_url';
const STORAGE_ANON_KEY = 'apex_habits_supabase_anon';

export let SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-supabase-project.supabase.co';
export let SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-placeholder';

export function checkIsConfigured(url = SUPABASE_URL, key = SUPABASE_ANON_KEY): boolean {
  return Boolean(
    url &&
      !url.includes('your-supabase-project') &&
      !url.includes('your-project-id') &&
      key &&
      !key.includes('your-anon-key')
  );
}

export let isSupabaseConfigured = checkIsConfigured();

export let supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Load saved credentials from AsyncStorage if available
AsyncStorage.multiGet([STORAGE_URL_KEY, STORAGE_ANON_KEY]).then(([[, savedUrl], [, savedKey]]) => {
  if (savedUrl && savedKey) {
    SUPABASE_URL = savedUrl;
    SUPABASE_ANON_KEY = savedKey;
    isSupabaseConfigured = checkIsConfigured(savedUrl, savedKey);
    supabase = createClient(savedUrl, savedKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
});

// Save credentials dynamically at runtime
export async function saveSupabaseCredentials(url: string, anonKey: string): Promise<boolean> {
  const trimmedUrl = url.trim();
  const trimmedKey = anonKey.trim();

  if (!checkIsConfigured(trimmedUrl, trimmedKey)) {
    return false;
  }

  await AsyncStorage.multiSet([
    [STORAGE_URL_KEY, trimmedUrl],
    [STORAGE_ANON_KEY, trimmedKey],
  ]);

  SUPABASE_URL = trimmedUrl;
  SUPABASE_ANON_KEY = trimmedKey;
  isSupabaseConfigured = true;

  supabase = createClient(trimmedUrl, trimmedKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return true;
}
