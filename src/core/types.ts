export type RoastLevel = 'mild' | 'medium' | 'unhinged';
export type GroupId = 'chips' | 'meat' | 'garlic' | 'chilli' | 'bbq';
export type CategoryId = string;

export type PayMethod = 'tap' | 'card' | 'cash' | 'bnpl';
export type Regret = 'worth' | 'meh' | 'nah';
export type Freq = 'weekly' | 'fortnightly' | 'monthly' | 'yearly';
export type CurrencyCode = 'AUD' | 'USD' | 'EUR' | 'GBP' | 'NZD' | 'CAD' | 'SGD' | 'IDR' | 'MYR' | 'JPY' | 'CNY' | 'HKD' | 'INR' | 'KRW' | 'PHP' | 'THB' | 'VND' | 'MXN';
export type LangId = 'en' | 'zh' | 'id' | 'es';
export type ThemeId = 'system' | 'garlic' | 'bbq' | 'kebab' | 'chilli' | 'mint';
export type WalletKind = 'main' | 'savings' | 'trip' | 'fun' | 'shared' | 'custom';

export interface Purchase {
  id: string;
  walletId: string;
  ts: number;
  amountCents: number;
  category: CategoryId;
  merchant?: string;
  method: PayMethod;
  note?: string;
  roast: string;
  regret?: Regret;
  regretTs?: number;
  source: 'manual' | 'shortcut' | 'cooling';
  wishId?: string;
}

export interface IncomeItem {
  id: string;
  label: string;
  amountCents: number;
  freq: Freq;
}

export interface RecurringItem {
  id: string;
  label: string;
  amountCents: number;
  freq: Freq;
}

export interface UnitDef {
  id: string;
  singular: string;
  plural: string;
  priceCents: number;
  /** only on the derived "shift" unit: the hourly rate it was built from, so tiny prices can fall back to minutes */
  hourlyCents?: number;
}

export interface Wallet {
  id: string;
  name: string;
  /** icon id from the icon library */
  icon: string;
  /** accent colour for this wallet's chips and cards */
  color: string;
  income: IncomeItem[];
  recurring: RecurringItem[];
  savingsWeeklyCents: number;
  budgetMode: 'auto' | 'manual';
  manualWeeklyCents: number;
  archived?: boolean;
  createdTs: number;
}

export interface Settings {
  onboarded: boolean;
  startedTs: number;
  unit: UnitDef;
  /** after-tax hourly pay, used to show prices as hours of work */
  hourlyCents: number | null;
  /** show prices in HSPs, as hours of work, or as shifts (the last two need hourlyCents) */
  unitMode: 'hsp' | 'work' | 'shift';
  /** how long one shift is, in hours (for the shifts view) */
  shiftHours: number;
  roastLevel: RoastLevel;
  bodyRoasts: boolean;
  weekStartsOn: number;
  goalName: string;
  language: LangId;
  currency: CurrencyCode;
  /** always show two decimals ($18.00 instead of $18) */
  showCents: boolean;
  /** round weekly summaries and totals to whole dollars */
  roundSummaries: boolean;
  theme: ThemeId;
  /** wallet id, or 'all' for the overview */
  activeWalletId: string;
  notifyWish: boolean;
  notifyWeekly: boolean;
  /** heads-up the day before the money runs out at the current pace */
  notifyPace: boolean;
  /** heads-up the day before a repeating charge is due */
  notifyRecurring: boolean;
  /** an evening "anything to log from today?" nudge, skipped on days that already have something logged */
  notifyEvening: boolean;
  /** ask for Face ID (or the passcode) to open the app */
  lockApp: boolean;
  /** when the user last saved a backup file (ms), or null if never */
  lastBackupTs: number | null;
  /** user said they are 18+, needed for the unhinged roast level */
  adultConfirmed: boolean;
  /** little sound effects (they follow the silent switch) */
  /** how many times we asked for an App Store rating, and when last */
  reviewAsks: number;
  lastReviewAskTs: number | null;
  sounds: boolean;
  /** haptic taps and buzzes */
  haptics: boolean;
}

export interface WishItem {
  id: string;
  walletId?: string;
  label: string;
  amountCents: number;
  category: CategoryId;
  createdTs: number;
  unlockTs: number;
  status: 'cooling' | 'bought' | 'ditched';
  decidedTs?: number;
  /** id of the local notification that fires when the timer ends */
  notifId?: string;
}

export interface ShameItem {
  id: string;
  ts: number;
  label: string;
  amountCents: number;
  category?: CategoryId;
  story?: string;
  source: 'manual' | 'regret';
  purchaseId?: string;
}

export interface CategoryMeta {
  id: CategoryId;
  /** shown for custom categories; built-ins use the translation table */
  label: string;
  group: GroupId;
  /** icon id from the icon library */
  icon: string;
  /** plural noun for "3 ___ this week" */
  noun: string;
  /** used in recap headline: "$84 on ___" */
  headline: string;
  /** which built-in roast set to borrow */
  roastAs: CategoryId;
  builtin?: boolean;
}

export interface GroupMeta {
  id: GroupId;
  label: string;
  blurb: string;
  color: string;
}
