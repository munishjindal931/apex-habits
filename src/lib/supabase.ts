import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Default Supabase configuration placeholders (replaceable via process.env or settings)
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-supabase-project.supabase.co';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-placeholder';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
    !SUPABASE_URL.includes('your-supabase-project') &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_ANON_KEY.includes('your-anon-key')
);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
