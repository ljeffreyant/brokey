import { computeOverview, pooledMoney, purchasesBetween, sumCents, weeklyPoolCents } from './budget';
import { regretStats } from './regret';
import { totalDitchedCents } from './cooldown';
import { LADDER } from './ladder';
import { addDays, startOfWeek } from './week';
import type { Purchase, Settings, ShameItem, WishItem, Wallet } from './types';

export interface StickerDef {
  id: string;
  title: string;
  blurb: string;
  /** emoji-free glyph key the UI maps to an illustration */
  art: 'fries' | 'ice' | 'flame' | 'crown' | 'receipt' | 'bin' | 'bottle' | 'hand' | 'moon' | 'coin';
}

export interface StickerState {
  purchases: Purchase[];
  wishes: WishItem[];
  shame: ShameItem[];
  settings: Settings;
  wallets: Wallet[];
  now: number;
}

interface Rule extends StickerDef {
  test: (s: StickerState) => boolean;
}

/** How many of the weeks that have fully finished (since you started) came in under budget. */
export function underBudgetWeeks(s: StickerState): number {
  const budget = weeklyPoolCents(pooledMoney(s.wallets.filter((w) => !w.archived)));
  if (budget <= 0) return 0;
  const first = startOfWeek(s.settings.startedTs, s.settings.weekStartsOn);
  const thisWeek = startOfWeek(s.now, s.settings.weekStartsOn);
  let n = 0;
  for (let w = first; w < thisWeek; w = addDays(w, 7)) {
    const spent = sumCents(purchasesBetween(s.purchases, w, addDays(w, 7)));
    if (spent <= budget) n++;
  }
  return n;
}

const LADDER_ART: Record<(typeof LADDER)[number]['id'], StickerDef['art']> = { side: 'fries', mini: 'coin', standard: 'bottle', banquet: 'crown' };
const LADDER_NAME = { side: 'Side of Chips', mini: 'Mini Box', standard: 'Standard Box', banquet: 'Family Banquet' } as const;

const RULES: Rule[] = [
  { id: 'first-log', title: 'First bite', blurb: 'Logged your first purchase.', art: 'fries', test: (s) => s.purchases.length >= 1 },
  { id: 'regular', title: 'Regular', blurb: 'Logged 25 purchases. Honesty is the best policy.', art: 'receipt', test: (s) => s.purchases.length >= 25 },
  { id: 'cool-hand', title: 'Cool hand', blurb: 'Walked away from something you wanted.', art: 'ice', test: (s) => s.wishes.some((w) => w.status === 'ditched') },
  {
    id: 'walk-away-100',
    title: 'Five HSPs saved',
    blurb: 'Walked away from five HSPs worth of wants.',
    art: 'coin',
    test: (s) => totalDitchedCents(s.wishes) >= s.settings.unit.priceCents * 5,
  },
  { id: 'streak-3', title: 'Three in a row', blurb: '3 days under your daily allowance.', art: 'flame', test: (s) => computeOverview(s.wallets, s.settings, s.purchases, s.now).total.streak >= 3 },
  { id: 'streak-7', title: 'Lock in', blurb: '7 days under your daily allowance.', art: 'crown', test: (s) => computeOverview(s.wallets, s.settings, s.purchases, s.now).total.streak >= 7 },
  { id: 'under-week', title: 'Under budget', blurb: 'A whole week under budget.', art: 'bottle', test: (s) => underBudgetWeeks(s) >= 1 },
  ...LADDER.map(
    (r): Rule => ({
      id: `ladder-${r.id}`,
      title: LADDER_NAME[r.id],
      blurb: `Talked yourself out of ${r.units} HSPs of wants.`,
      art: LADDER_ART[r.id],
      test: (s) => totalDitchedCents(s.wishes) >= r.units * s.settings.unit.priceCents,
    }),
  ),
  { id: 'honest', title: 'Honest', blurb: 'Answered 5 regret check-ins.', art: 'hand', test: (s) => regretStats(s.purchases).answered >= 5 },
  { id: 'self-roast', title: 'Self roast', blurb: 'Added something to the shame shelf.', art: 'bin', test: (s) => s.shame.length >= 1 },
  {
    id: 'cook',
    title: 'Home cook',
    blurb: 'Logged 3 grocery shops.',
    art: 'fries',
    test: (s) => s.purchases.filter((p) => p.category === 'groceries').length >= 3,
  },
  {
    id: 'zero-day',
    title: 'Zero day',
    blurb: 'A full day with nothing spent.',
    art: 'moon',
    test: (s) => {
      const start = addDays(s.now, -1);
      const day0 = new Date(start);
      day0.setHours(0, 0, 0, 0);
      if (day0.getTime() < new Date(s.settings.startedTs).setHours(0, 0, 0, 0)) return false;
      return purchasesBetween(s.purchases, day0.getTime(), day0.getTime() + 86400000).length === 0;
    },
  },
];

export function allStickers(): StickerDef[] {
  return RULES.map(({ test: _t, ...def }) => def);
}

export function unlockedStickerIds(s: StickerState): string[] {
  return RULES.filter((r) => r.test(s)).map((r) => r.id);
}
