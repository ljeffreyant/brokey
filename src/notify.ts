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

/** True only when the person has said no. "Never asked yet" is not blocked. */
export async function permissionDenied(): Promise<boolean> {
  if (!native) return false;
  try {
    const s = await Notifications.getPermissionsAsync();
    return !s.granted && s.ios?.status !== Notifications.IosAuthorizationStatus.PROVISIONAL && s.status === 'denied';
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

// ---------------------------------------------------------------------------
// Heads-ups the app works out for itself. All local, all replaced (never stacked) every time the numbers change.
// ---------------------------------------------------------------------------
const PACE_ID = 'brokey-pace';
const RECUR_PREFIX = 'brokey-recurring-';

/** 9am on the day before `ts`. */
function morningBefore(ts: number): number {
  const d = new Date(ts);
  d.setHours(9, 0, 0, 0);
  d.setDate(d.getDate() - 1);
  return d.getTime();
}

async function cancelPrefix(prefix: string): Promise<void> {
  try {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(all.filter((n) => n.identifier.startsWith(prefix)).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
  } catch {
    /* nothing scheduled */
  }
}

/** "At this pace the budget runs out tomorrow", sent the morning before. Pass null to clear it. */
export async function syncPaceAlert(args: { on: boolean; lang: LangId; runOutTs: number | null; now?: number }): Promise<void> {
  if (!native) return;
  await cancelNotification(PACE_ID);
  if (!args.on || !args.runOutTs) return;
  const at = morningBefore(args.runOutTs);
  if (at <= (args.now ?? Date.now()) + 60_000) return;
  if (!(await hasPermission())) return;
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: PACE_ID,
      content: { title: translate(args.lang, 'notif.paceTitle'), body: translate(args.lang, 'notif.paceBody') },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(at) },
    });
  } catch {
    /* best effort */
  }
}

export interface DueItem {
  key: string;
  label: string;
  amountLabel: string;
  nextTs: number;
}

/** A morning-before reminder for each repeating charge (subscriptions, regular bills). */
export async function syncRecurringReminders(args: { on: boolean; lang: LangId; items: DueItem[]; now?: number }): Promise<void> {
  if (!native) return;
  await cancelPrefix(RECUR_PREFIX);
  if (!args.on || args.items.length === 0) return;
  if (!(await hasPermission())) return;
  const now = args.now ?? Date.now();
  for (const it of args.items.slice(0, 8)) {
    const at = morningBefore(it.nextTs);
    if (at <= now + 60_000) continue;
    try {
      await Notifications.scheduleNotificationAsync({
        identifier: RECUR_PREFIX + it.key,
        content: { title: translate(args.lang, 'notif.recurringTitle'), body: translate(args.lang, 'notif.recurringBody', { what: it.label, amount: it.amountLabel }) },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(at) },
      });
    } catch {
      /* best effort */
    }
  }
}
