import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { LangId } from './core/types';
import { translate } from './i18n/translate';

const native = Platform.OS === 'ios' || Platform.OS === 'android';

/** Call once at startup. Without a handler, notifications that arrive while the app is open are dropped. */
export function initNotifications(): void {
  if (!native) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', { name: 'Brokey', importance: Notifications.AndroidImportance.DEFAULT }).catch(() => {});
  }
}

export async function hasPermission(): Promise<boolean> {
  if (!native) return false;
  try {
    const s = await Notifications.getPermissionsAsync();
    return s.granted || s.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  } catch {
    return false;
  }
}

/** Asks politely, and only when the person has just done something that needs it. */
export async function ensurePermission(): Promise<boolean> {
  if (!native) return false;
  if (await hasPermission()) return true;
  try {
    const r = await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowBadge: false, allowSound: true } });
    return r.granted || r.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  } catch {
    return false;
  }
}

/** A local notification for when a wish finishes cooling. Returns its id so it can be cancelled. */
export async function scheduleWishUnlock(args: { lang: LangId; what: string; amount: string; unlockTs: number }): Promise<string | null> {
  if (!native || args.unlockTs <= Date.now() + 5000) return null;
  if (!(await hasPermission())) return null;
  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: translate(args.lang, 'notif.wishTitle'),
        body: translate(args.lang, 'notif.wishBody', { what: args.what, amount: args.amount }),
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(args.unlockTs) },
    });
  } catch {
    return null;
  }
}

export async function cancelNotification(id?: string | null): Promise<void> {
  if (!native || !id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    /* nothing to cancel */
  }
}

const WEEKLY_ID = 'brokey-weekly-recap';

/** Sunday evening, once a week. Off by default; the person has to ask for it in Settings. */
export async function setWeeklyRecap(on: boolean, lang: LangId): Promise<boolean> {
  if (!native) return false;
  await cancelNotification(WEEKLY_ID);
  if (!on) return true;
  if (!(await ensurePermission())) return false;
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: WEEKLY_ID,
      content: { title: translate(lang, 'notif.weeklyTitle'), body: translate(lang, 'notif.weeklyBody') },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: 1, hour: 18, minute: 30 },
    });
    return true;
  } catch {
    return false;
  }
}
