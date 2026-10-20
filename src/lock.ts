import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

const native = Platform.OS === 'ios' || Platform.OS === 'android';

export type UnlockResult = 'ok' | 'cancelled' | 'unavailable' | 'failed';

/** Can this phone ask for Face ID / Touch ID / a passcode at all? */
export async function canLock(): Promise<boolean> {
  if (!native) return false;
  try {
    return (await LocalAuthentication.hasHardwareAsync()) && (await LocalAuthentication.isEnrolledAsync());
  } catch {
    return false;
  }
}

/** Face ID first, the phone passcode if Face ID keeps failing. */
export async function unlock(reason: string): Promise<UnlockResult> {
  if (!native) return 'ok';
  try {
    const r = await LocalAuthentication.authenticateAsync({ promptMessage: reason, disableDeviceFallback: false });
    if (r.success) return 'ok';
    if (r.error === 'user_cancel' || r.error === 'system_cancel' || r.error === 'app_cancel') return 'cancelled';
    if (r.error === 'not_enrolled' || r.error === 'not_available' || r.error === 'passcode_not_set') return 'unavailable';
    return 'failed';
  } catch {
    return 'unavailable';
  }
}
