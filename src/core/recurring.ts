import { roastSetFor } from './categories';
import type { CategoryId, Purchase } from './types';

const DAY = 24 * 60 * 60 * 1000;

export interface Recurring {
  /** stable id for the group of charges */
  key: string;
  label: string;
  category: CategoryId;
  /** the wallet it was last logged in */
  walletId: string;
  /** the usual amount (median) */
  amountCents: number;
  /** 7, 14 or 30 */
  everyDays: number;
  count: number;
  lastTs: number;
  /** when the next one should land */
  nextTs: number;
  /** what it costs per month, so weekly and monthly ones compare */
  monthlyCents: number;
  yearlyCents: number;
}

const CADENCES: { days: number; tol: number }[] = [
  { days: 7, tol: 1.5 },
  { days: 14, tol: 2 },
  { days: 30, tol: 4 },
];

const normal = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};

/**
 * Spots charges that keep coming back: same shop, about the same amount, at a steady rhythm.
 * Three in a row is enough; subscription categories only need two. Lapsed ones (probably cancelled) are dropped.
 */
export function detectRecurring(purchases: Purchase[], now: number): Recurring[] {
  const groups = new Map<string, Purchase[]>();
  for (const p of purchases) {
    const name = (p.merchant ?? '').trim();
    if (name.length < 3) continue;
    const key = normal(name);
    if (!key) continue;
    groups.set(key, [...(groups.get(key) ?? []), p]);
  }
  const out: Recurring[] = [];
  for (const [key, list] of groups) {
    const sorted = [...list].sort((a, b) => a.ts - b.ts);
    const sub = roastSetFor(sorted[sorted.length - 1].category) === 'subscription';
    if (sorted.length < (sub ? 2 : 3)) continue;
    const amt = median(sorted.map((p) => p.amountCents));
    if (amt <= 0) continue;
    // same-ish price every time (within 12%)
    if (!sorted.every((p) => Math.abs(p.amountCents - amt) <= amt * 0.12)) continue;
    const gaps = sorted.slice(1).map((p, i) => (p.ts - sorted[i].ts) / DAY);
    const mid = median(gaps);
    const cadence = CADENCES.find((c) => Math.abs(mid - c.days) <= c.tol * 1.5);
    if (!cadence) continue;
    const steady = gaps.filter((g) => Math.abs(g - cadence.days) <= cadence.tol).length;
    if (steady < Math.ceil(gaps.length * 0.75)) continue;
    const last = sorted[sorted.length - 1];
    if (now - last.ts > cadence.days * DAY * 1.6) continue;
    const monthly = Math.round((amt * 30.44) / cadence.days);
    out.push({
      key,
      label: (last.merchant ?? '').trim(),
      category: last.category,
      walletId: last.walletId,
      amountCents: amt,
      everyDays: cadence.days,
      count: sorted.length,
      lastTs: last.ts,
      nextTs: last.ts + cadence.days * DAY,
      monthlyCents: monthly,
      yearlyCents: monthly * 12,
    });
  }
  return out.sort((a, b) => b.yearlyCents - a.yearlyCents);
}

/**
 * The repeat charges that should have landed by now and are not logged yet, so Home can offer a one-tap log.
 * `skips` remembers the ones the person waved off (key -> the due time they skipped), so a skipped charge stays quiet
 * until the next cycle. Anything long overdue is dropped: it was probably cancelled.
 */
export function dueRecurring(items: Recurring[], skips: Record<string, number>, now: number): Recurring[] {
  return items
    .filter((r) => now >= r.nextTs - DAY / 2 && now - r.nextTs <= r.everyDays * DAY * 0.6 && skips[r.key] !== r.nextTs)
    .sort((a, b) => a.nextTs - b.nextTs);
}
