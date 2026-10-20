import type { Freq, Purchase, Settings, Wallet } from './types';
import type { Mood } from '../art/mascot';
import { addDays, dayIndexInWeek, daysLeftInWeek, startOfDay, startOfWeek } from './week';

export const FRIES_TOTAL = 9;

export function toWeeklyCents(amountCents: number, freq: Freq): number {
  switch (freq) {
    case 'weekly':
      return amountCents;
    case 'fortnightly':
      return Math.round(amountCents / 2);
    case 'monthly':
      return Math.round((amountCents * 12) / 52);
    case 'yearly':
      return Math.round(amountCents / 52);
  }
}

/** Everything the budget maths needs: one wallet's money plus the global week settings. */
export type WalletMoney = Pick<Wallet, 'income' | 'recurring' | 'savingsWeeklyCents' | 'budgetMode' | 'manualWeeklyCents'>;
export type BudgetSource = WalletMoney & Pick<Settings, 'weekStartsOn' | 'startedTs'>;

export function weeklyIncomeCents(s: Pick<Wallet, 'income'>): number {
  return s.income.reduce((n, i) => n + toWeeklyCents(i.amountCents, i.freq), 0);
}

export function weeklyRecurringCents(s: Pick<Wallet, 'recurring'>): number {
  return s.recurring.reduce((n, i) => n + toWeeklyCents(i.amountCents, i.freq), 0);
}

/** What you can actually blow each week after rent, subs and the savings you promised yourself. */
export function weeklyPoolCents(s: WalletMoney): number {
  if (s.budgetMode === 'manual') return Math.max(0, s.manualWeeklyCents);
  return Math.max(0, weeklyIncomeCents(s) - weeklyRecurringCents(s) - s.savingsWeeklyCents);
}

export function purchasesBetween(purchases: Purchase[], from: number, to: number): Purchase[] {
  return purchases.filter((p) => p.ts >= from && p.ts < to);
}

export function sumCents(purchases: Purchase[]): number {
  return purchases.reduce((n, p) => n + p.amountCents, 0);
}

export interface BudgetState {
  weekStart: number;
  weekEnd: number;
  budgetCents: number;
  spentWeekCents: number;
  remainingCents: number;
  spentTodayCents: number;
  /** what's left to spend today if you spread the rest of the week evenly. can be negative. */
  safeTodayCents: number;
  dailyAllowanceCents: number;
  dayIndex: number;
  daysLeft: number;
  /** spent / what you'd have spent if you drip-fed the budget evenly up to end of today */
  pace: number;
  friesLeft: number;
  mood: Mood;
  streak: number;
  overBudget: boolean;
}

export function friesLeft(budgetCents: number, spentCents: number, total = FRIES_TOTAL): number {
  if (budgetCents <= 0) return spentCents > 0 ? 0 : total;
  const left = 1 - spentCents / budgetCents;
  return Math.max(0, Math.min(total, Math.round(left * total)));
}

export function streakDays(
  purchases: Purchase[],
  dailyAllowanceCents: number,
  now: number,
  startedTs: number,
): number {
  if (dailyAllowanceCents <= 0) return 0;
  const startDay = startOfDay(startedTs);
  const byDay = new Map<number, number>();
  for (const p of purchases) {
    const d = startOfDay(p.ts);
    byDay.set(d, (byDay.get(d) ?? 0) + p.amountCents);
  }
  let streak = 0;
  let day = startOfDay(now);
  for (let i = 0; i < 400 && day >= startDay; i++) {
    const spent = byDay.get(day) ?? 0;
    if (spent > dailyAllowanceCents) break;
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

export function moodFor(args: {
  budgetCents: number;
  spentWeekCents: number;
  safeTodayCents: number;
  dailyAllowanceCents: number;
  pace: number;
  dayIndex: number;
}): Mood {
  const { budgetCents, spentWeekCents, safeTodayCents, dailyAllowanceCents, pace, dayIndex } = args;
  if (budgetCents <= 0) return 'ok';
  if (spentWeekCents >= budgetCents) return 'broke';
  if (safeTodayCents < 0) return 'sad';
  if (pace > 1 || safeTodayCents < dailyAllowanceCents * 0.1) return 'sideeye';
  if (pace <= 0.5 && dayIndex >= 2) return 'proud';
  if (pace <= 0.85) return 'happy';
  return 'ok';
}

export function computeBudget(settings: BudgetSource, purchases: Purchase[], now: number): BudgetState {
  const weekStart = startOfWeek(now, settings.weekStartsOn);
  const weekEnd = addDays(weekStart, 7);
  const today = startOfDay(now);
  const budgetCents = weeklyPoolCents(settings);
  const week = purchasesBetween(purchases, weekStart, weekEnd);
  const spentWeekCents = sumCents(week);
  const spentTodayCents = sumCents(purchasesBetween(purchases, today, addDays(today, 1)));
  const spentBefore = spentWeekCents - spentTodayCents;
  const dayIndex = dayIndexInWeek(now, settings.weekStartsOn);
  const daysLeft = daysLeftInWeek(now, settings.weekStartsOn);
  const safeTodayCents = Math.floor((budgetCents - spentBefore) / daysLeft) - spentTodayCents;
  const dailyAllowanceCents = Math.floor(budgetCents / 7);
  const allowedToDate = (budgetCents * (dayIndex + 1)) / 7;
  const pace = allowedToDate > 0 ? spentWeekCents / allowedToDate : spentWeekCents > 0 ? 9 : 0;
  const mood = moodFor({ budgetCents, spentWeekCents, safeTodayCents, dailyAllowanceCents, pace, dayIndex });
  const streak = streakDays(purchases, dailyAllowanceCents, now, settings.startedTs);
  return {
    weekStart,
    weekEnd,
    budgetCents,
    spentWeekCents,
    remainingCents: budgetCents - spentWeekCents,
    spentTodayCents,
    safeTodayCents,
    dailyAllowanceCents,
    dayIndex,
    daysLeft,
    pace,
    friesLeft: friesLeft(budgetCents, spentWeekCents),
    mood,
    streak,
    overBudget: spentWeekCents > budgetCents,
  };
}

/** Spend for each of the 7 days of the week containing `now`, Monday-style order from weekStart. */
export function dailySpend(purchases: Purchase[], weekStart: number): number[] {
  return Array.from({ length: 7 }, (_, i) => {
    const from = addDays(weekStart, i);
    return sumCents(purchasesBetween(purchases, from, addDays(from, 1)));
  });
}

// ---------------------------------------------------------------------------
// Wallets
// ---------------------------------------------------------------------------

export interface WalletBudget {
  wallet: Wallet;
  budget: BudgetState;
}

export interface Overview {
  wallets: WalletBudget[];
  /** all active wallets pooled together */
  total: BudgetState;
}

/** One wallet's budget, using only that wallet's purchases. */
export function computeWalletBudget(
  wallet: Wallet,
  settings: Pick<Settings, 'weekStartsOn' | 'startedTs'>,
  purchases: Purchase[],
  now: number,
): BudgetState {
  const mine = purchases.filter((p) => p.walletId === wallet.id);
  return computeBudget({ ...wallet, weekStartsOn: settings.weekStartsOn, startedTs: settings.startedTs }, mine, now);
}

/** Pool several wallets into one virtual wallet (their budgets add up). */
export function pooledMoney(wallets: Wallet[]): WalletMoney {
  return {
    income: [],
    recurring: [],
    savingsWeeklyCents: 0,
    budgetMode: 'manual',
    manualWeeklyCents: wallets.reduce((n, w) => n + weeklyPoolCents(w), 0),
  };
}

export function computeOverview(
  wallets: Wallet[],
  settings: Pick<Settings, 'weekStartsOn' | 'startedTs'>,
  purchases: Purchase[],
  now: number,
): Overview {
  const active = wallets.filter((w) => !w.archived);
  const ids = new Set(active.map((w) => w.id));
  const total = computeBudget(
    { ...pooledMoney(active), weekStartsOn: settings.weekStartsOn, startedTs: settings.startedTs },
    purchases.filter((p) => ids.has(p.walletId)),
    now,
  );
  return { wallets: active.map((wallet) => ({ wallet, budget: computeWalletBudget(wallet, settings, purchases, now) })), total };
}
