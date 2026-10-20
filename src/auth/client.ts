import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import { AUTH_ENABLED } from '../config';

const URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/** Accounts only exist when the flag is on AND a project is configured. Otherwise the app is fully local. */
export const authAvailable = AUTH_ENABLED && !!URL && !!KEY;

let client: SupabaseClient | null = null;
let foregroundHooked = false;

export function getClient(): SupabaseClient | null {
  if (!authAvailable) return null;
  if (!client) {
    client = createClient(URL as string, KEY as string, {
      auth: {
        // On native the session lives in AsyncStorage. On web the library's default (localStorage) is used.
        ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    // Refresh the session only while the app is in the foreground (from the Supabase React Native guide).
    if (Platform.OS !== 'web' && !foregroundHooked) {
      foregroundHooked = true;
      AppState.addEventListener('change', (state) => {
        if (!client) return;
        if (state === 'active') client.auth.startAutoRefresh();
        else client.auth.stopAutoRefresh();
      });
    }
  }
  return client;
}
