import type { CurrencyCode, LangId, UnitDef } from './types';

export interface CurrencyDef {
  code: CurrencyCode;
  symbol: string;
  name: string;
  /** currencies with no minor unit never show decimals */
  zeroDecimal?: boolean;
  /** a plausible price for one HSP, in this currency's major units */
  hsp: number;
}

export const CURRENCIES: CurrencyDef[] = [
  { code: 'AUD', symbol: '$', name: 'Australian dollar', hsp: 18 },
  { code: 'USD', symbol: '$', name: 'US dollar', hsp: 12 },
  { code: 'EUR', symbol: '€', name: 'Euro', hsp: 11 },
  { code: 'GBP', symbol: '£', name: 'British pound', hsp: 10 },
  { code: 'NZD', symbol: '$', name: 'New Zealand dollar', hsp: 19 },
  { code: 'CAD', symbol: '$', name: 'Canadian dollar', hsp: 16 },
  { code: 'SGD', symbol: '$', name: 'Singapore dollar', hsp: 12 },
  { code: 'HKD', symbol: '$', name: 'Hong Kong dollar', hsp: 90 },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian rupiah', zeroDecimal: true, hsp: 75000 },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian ringgit', hsp: 25 },
  { code: 'PHP', symbol: '₱', name: 'Philippine peso', hsp: 400 },
  { code: 'THB', symbol: '฿', name: 'Thai baht', hsp: 200 },
  { code: 'VND', symbol: '₫', name: 'Vietnamese dong', zeroDecimal: true, hsp: 120000 },
  { code: 'JPY', symbol: '¥', name: 'Japanese yen', zeroDecimal: true, hsp: 1500 },
  { code: 'CNY', symbol: '¥', name: 'Chinese yuan', hsp: 60 },
  { code: 'KRW', symbol: '₩', name: 'South Korean won', zeroDecimal: true, hsp: 14000 },
  { code: 'INR', symbol: '₹', name: 'Indian rupee', hsp: 450 },
  { code: 'MXN', symbol: '$', name: 'Mexican peso', hsp: 200 },
];

export function currencyDef(code: CurrencyCode): CurrencyDef {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

export const UNIT_PRESETS: UnitDef[] = [
  { id: 'hsp', singular: 'HSP', plural: 'HSPs', priceCents: 1800 },
  { id: 'boba', singular: 'bubble tea', plural: 'bubble teas', priceCents: 800 },
  { id: 'fastfood', singular: 'fast food meal', plural: 'fast food meals', priceCents: 1600 },
  { id: 'chook', singular: 'rotisserie chook', plural: 'rotisserie chooks', priceCents: 1200 },
  { id: 'flatwhite', singular: 'flat white', plural: 'flat whites', priceCents: 550 },
];

export const DEFAULT_UNIT: UnitDef = UNIT_PRESETS[0];

/** A unit's price scaled for a currency (HSP is 18 AUD, so ~75,000 IDR). */
export function unitForCurrency(unit: UnitDef, code: CurrencyCode): UnitDef {
  if (unit.id !== 'hsp') return unit;
  return { ...unit, priceCents: currencyDef(code).hsp * 100 };
}

export type DecimalMode = 'auto' | 'always' | 'none';

export interface MoneyFmt {
  currency: CurrencyCode;
  locale: LangId;
  decimals: DecimalMode;
}

export const DEFAULT_FMT: MoneyFmt = { currency: 'AUD', locale: 'en', decimals: 'auto' };

function seps(locale: LangId): { group: string; decimal: string } {
  return locale === 'id' || locale === 'es' ? { group: '.', decimal: ',' } : { group: ',', decimal: '.' };
}

function groupDigits(n: number, sep: string): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

export function formatMoney(cents: number, opts: { sign?: boolean; fmt?: Partial<MoneyFmt> } = {}): string {
  const fmt = { ...DEFAULT_FMT, ...(opts.fmt ?? {}) };
  const cur = currencyDef(fmt.currency);
  const { group, decimal } = seps(fmt.locale);
  const neg = cents < 0;
  let abs = Math.abs(cents);
  const noDecimals = cur.zeroDecimal || fmt.decimals === 'none';
  if (noDecimals) abs = Math.round(abs / 100) * 100;
  const whole = Math.floor(abs / 100);
  const rem = abs % 100;
  let body = groupDigits(whole, group);
  if (!noDecimals && (fmt.decimals === 'always' || rem)) body += decimal + String(rem).padStart(2, '0');
  const sign = neg ? '-' : opts.sign && cents > 0 ? '+' : '';
  return `${sign}${cur.symbol}${body}`;
}

/** Parse what a person types on a keypad: "12", "12.5", "12,50", ".5". null if nothing usable. */
export function parseAmountToCents(input: string): number | null {
  const cleaned = input.replace(/[^0-9.,]/g, '').replace(',', '.');
  if (!cleaned || cleaned === '.') return null;
  const parts = cleaned.split('.');
  const whole = parts[0] === '' ? '0' : parts[0];
  const frac = (parts[1] ?? '').slice(0, 2).padEnd(2, '0');
  const cents = parseInt(whole, 10) * 100 + parseInt(frac || '0', 10);
  return Number.isFinite(cents) ? cents : null;
}

/** Raw unit count, e.g. 3.17 */
export function unitsOf(cents: number, unit: UnitDef): number {
  return unit.priceCents > 0 ? cents / unit.priceCents : 0;
}

/** Friendly number: 14, 2.5, 0.8. Never "2.0". */
export function friendlyNumber(v: number, locale: LangId = 'en'): string {
  const abs = Math.abs(v);
  let out: string;
  if (abs >= 10) out = String(Math.round(v));
  else {
    const r = Math.round(v * 10) / 10;
    if (Object.is(r, -0) || r === 0) return '0';
    out = Number.isInteger(r) ? String(r) : r.toFixed(1);
  }
  return seps(locale).decimal === ',' ? out.replace('.', ',') : out;
}

export function formatUnits(cents: number, unit: UnitDef, locale: LangId = 'en'): string {
  const v = unitsOf(cents, unit);
  const n = friendlyNumber(v, locale);
  const one = Math.abs(parseFloat(n.replace(',', '.'))) === 1;
  return `${n} ${one ? unit.singular : unit.plural}`;
}

/** Just the number part, for big display. */
export function unitsNumber(cents: number, unit: UnitDef, locale: LangId = 'en'): string {
  return friendlyNumber(unitsOf(cents, unit), locale);
}

export function unitLabel(cents: number, unit: UnitDef): string {
  const n = friendlyNumber(unitsOf(cents, unit));
  return Math.abs(parseFloat(n)) === 1 ? unit.singular : unit.plural;
}

/** Hours of work at an after-tax hourly rate, e.g. "1.4 hrs of work". null if no rate set. */
export function formatWork(cents: number, hourlyCents: number | null, locale: LangId = 'en'): string | null {
  if (!hourlyCents || hourlyCents <= 0) return null;
  const h = Math.abs(cents) / hourlyCents;
  if (h < 0.1) return 'under 6 min of work';
  if (h < 1) return `${Math.round(h * 60)} min of work`;
  const n = friendlyNumber(h, locale);
  return `${n} ${n === '1' ? 'hr' : 'hrs'} of work`;
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
