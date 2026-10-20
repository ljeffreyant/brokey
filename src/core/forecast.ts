import type { BudgetState } from './budget';
import type { LangId } from './types';
import { startOfDay } from './week';

const DAY = 24 * 60 * 60 * 1000;

export interface Forecast {
  /** when, at the current pace, the week's money is gone */
  runOutTs: number;
  /** 0 = today, 1 = tomorrow, 2+ = later this week */
  inDays: number;
}

/**
 * "At this pace you run out on Thursday." Only speaks once there is a full day of spending to go on,
 * and stays quiet when the money lasts to the end of the week, or is already gone.
 */
export function forecastRunOut(b: Pick<BudgetState, 'weekStart' | 'weekEnd' | 'budgetCents' | 'spentWeekCents'>, now: number): Forecast | null {
  if (b.budgetCents <= 0 || b.spentWeekCents <= 0 || b.spentWeekCents >= b.budgetCents) return null;
  const elapsedDays = (now - b.weekStart) / DAY;
  if (elapsedDays < 1) return null;
  const perDay = b.spentWeekCents / elapsedDays;
  if (perDay <= 0) return null;
  const runOutTs = now + ((b.budgetCents - b.spentWeekCents) / perDay) * DAY;
  // lasting until the last evening of the week counts as lasting
  if (runOutTs >= b.weekEnd - 6 * 60 * 60 * 1000) return null;
  const inDays = Math.max(0, Math.round((startOfDay(runOutTs) - startOfDay(now)) / DAY));
  return { runOutTs, inDays };
}

const LOCALES: Record<LangId, string> = { en: 'en-AU', zh: 'zh-CN', id: 'id-ID', es: 'es-ES' };
const EN_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** "Thursday", in the app's language. */
export function weekdayName(ts: number, lang: LangId): string {
  try {
    return new Intl.DateTimeFormat(LOCALES[lang] ?? 'en-AU', { weekday: 'long' }).format(new Date(ts));
  } catch {
    return EN_DAYS[new Date(ts).getDay()];
  }
}
