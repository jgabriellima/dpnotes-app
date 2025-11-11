/**
 * Supabase Client Configuration
 * 
 * Provides a singleton instance of the Supabase client
 * for database operations and authentication.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database.types';

// Get environment variables (EXPO_PUBLIC_ prefix makes them available via process.env)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase credentials not found. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file and restart the server with --clear flag.'
  );
}

/**
 * Supabase client instance with TypeScript types
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: undefined, // Will be configured with AsyncStorage in auth service
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Check if Supabase is properly configured
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

export default supabase;

