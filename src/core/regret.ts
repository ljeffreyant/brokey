import type { CategoryId, Purchase, Regret } from './types';
import { startOfDay } from './week';

const HOUR = 60 * 60 * 1000;

/** Things that are not worth a "do you regret it" check-in. */
const SKIP: CategoryId[] = ['groceries', 'subscription', 'uni', 'health'];

export function regretDelayHours(amountCents: number): number {
  return amountCents >= 5000 ? 48 : 24;
}

export function isRegretDue(p: Purchase, now: number): boolean {
  if (p.regret) return false;
  if (SKIP.includes(p.category)) return false;
  if (p.amountCents < 500) return false;
  return now - p.ts >= regretDelayHours(p.amountCents) * HOUR;
}

/** Oldest first, but never more than a handful so it never feels like homework. */
export function regretQueue(purchases: Purchase[], now: number, limit = 3): Purchase[] {
  return purchases
    .filter((p) => isRegretDue(p, now))
    .sort((a, b) => a.ts - b.ts)
    .slice(0, limit);
}

/** Purchases older than 5 days that were never answered quietly drop out. */
export function isRegretExpired(p: Purchase, now: number): boolean {
  return !p.regret && now - p.ts > 5 * 24 * HOUR;
}

export interface RegretStats {
  answered: number;
  worth: number;
  meh: number;
  nah: number;
  regretRate: number;
  regretCents: number;
  worthCents: number;
}

export function regretStats(purchases: Purchase[]): RegretStats {
  const s: RegretStats = { answered: 0, worth: 0, meh: 0, nah: 0, regretRate: 0, regretCents: 0, worthCents: 0 };
  for (const p of purchases) {
    if (!p.regret) continue;
    s.answered++;
    s[p.regret as Regret]++;
    if (p.regret === 'nah') s.regretCents += p.amountCents;
    if (p.regret === 'worth') s.worthCents += p.amountCents;
  }
  s.regretRate = s.answered ? s.nah / s.answered : 0;
  return s;
}

export interface CategoryRegret {
  category: CategoryId;
  answered: number;
  nah: number;
  rate: number;
  regretCents: number;
}

/** Which kinds of spending you most often wish you hadn't. Needs 3+ answers to count. */
export function worstRegretCategories(purchases: Purchase[], minAnswered = 3): CategoryRegret[] {
  const map = new Map<CategoryId, CategoryRegret>();
  for (const p of purchases) {
    if (!p.regret) continue;
    const cur = map.get(p.category) ?? { category: p.category, answered: 0, nah: 0, rate: 0, regretCents: 0 };
    cur.answered++;
    if (p.regret === 'nah') {
      cur.nah++;
      cur.regretCents += p.amountCents;
    }
    map.set(p.category, cur);
  }
  return [...map.values()]
    .filter((c) => c.answered >= minAnswered && c.nah > 0)
    .map((c) => ({ ...c, rate: c.nah / c.answered }))
    .sort((a, b) => b.rate - a.rate || b.regretCents - a.regretCents);
}

export function regretedThisWeek(purchases: Purchase[], weekStart: number): Purchase[] {
  const end = startOfDay(weekStart) + 7 * 24 * HOUR;
  return purchases.filter((p) => p.regret === 'nah' && p.ts >= weekStart && p.ts < end + HOUR);
}
