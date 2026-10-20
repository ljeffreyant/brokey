import { BODY_ROASTS_AVAILABLE } from '../config';
import { categoryMeta, roastSetFor } from './categories';
import { MoneyFmt, formatMoney, formatUnits, formatWork } from './money';
import { ES } from './roasts-es';
import { melbLines } from './roasts-melb';
import * as EN from './roasts-en';
import { ID } from './roasts-id';
import { ZH } from './roasts-zh';
import type { Bank } from './roasts-en';
import type { CategoryId, LangId, PayMethod, RoastLevel, UnitDef } from './types';

export interface RoastCtx {
  category: CategoryId;
  amountCents: number;
  level: RoastLevel;
  bodyRoasts: boolean;
  unit: UnitDef;
  hourlyCents: number | null;
  /** the amount from which a buy counts as big (defaults to two units) */
  bigAtCents?: number;
  /** purchases in this category this week, counting this one */
  countThisWeek: number;
  /** after this purchase, is the week's budget blown? */
  overBudget: boolean;
  weeklyBudgetCents: number;
  method: PayMethod;
  /** local hour 0-23 */
  hour: number;
  merchant?: string;
  seed: number;
  /** roast lines used recently, so we don't repeat */
  recent?: string[];
  fmt?: Partial<MoneyFmt>;
  lang?: LangId;
  /** Mix in the Melbourne-only jokes (on for Australian dollar wallets). */
  melbourne?: boolean;
}

export interface RoastBanks {
  BASE: Record<CategoryId, Bank>;
  OVER: Bank;
  BIG: Bank;
  REPEAT: Bank;
  LATE: Bank;
  BNPL: Bank;
  BODY: Partial<Record<CategoryId, string[]>>;
  WANT: Bank;
}

const EN_BANKS: RoastBanks = { BASE: EN.BASE, OVER: EN.OVER, BIG: EN.BIG, REPEAT: EN.REPEAT, LATE: EN.LATE, BNPL: EN.BNPL, BODY: EN.BODY, WANT: EN.WANT };

const banksByLang: Partial<Record<LangId, RoastBanks>> = { en: EN_BANKS, zh: ZH, id: ID, es: ES };

/** Other languages register their banks here. Missing languages fall back to English. */
export function registerRoastBanks(lang: LangId, banks: RoastBanks): void {
  banksByLang[lang] = banks;
}

function banks(lang?: LangId): RoastBanks {
  return banksByLang[lang ?? 'en'] ?? EN_BANKS;
}

const nth = (n: number, lang: LangId) => {
  if (lang !== 'en') return `#${n}`;
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const WORK_FALLBACK: Record<LangId, string> = { en: 'a few shifts', zh: '好几个班', id: 'beberapa shift kerja', es: 'unos cuantos turnos' };
const MERCHANT_FALLBACK: Record<LangId, string> = { en: 'there', zh: '那里', id: 'sana', es: 'ahí' };

function fill(line: string, ctx: RoastCtx): string {
  const lang = ctx.lang ?? 'en';
  const cat = categoryMeta(ctx.category);
  return line
    .replace(/\{amt\}/g, formatMoney(ctx.amountCents, { fmt: ctx.fmt }))
    .replace(/\{units\}/g, formatUnits(ctx.amountCents, ctx.unit, lang))
    .replace(/\{n\}/g, String(ctx.countThisWeek))
    .replace(/\{nth\}/g, nth(ctx.countThisWeek, lang))
    .replace(/\{noun\}/g, cat.noun)
    .replace(/\{work\}/g, formatWork(ctx.amountCents, ctx.hourlyCents, lang) ?? WORK_FALLBACK[lang])
    .replace(/\{merchant\}/g, ctx.merchant || MERCHANT_FALLBACK[lang])
    .replace(/\{unit\}/g, ctx.unit.singular);
}

function pick(arr: string[], seed: number, recent: string[] = []): string {
  if (arr.length === 0) return '';
  const start = Math.abs(Math.floor(seed)) % arr.length;
  for (let i = 0; i < arr.length; i++) {
    const cand = arr[(start + i) % arr.length];
    if (!recent.includes(cand)) return cand;
  }
  return arr[start];
}

export type RoastKind = 'over' | 'big' | 'repeat' | 'late' | 'body' | 'base' | 'praise';

export function roastKind(ctx: RoastCtx): RoastKind {
  const set = roastSetFor(ctx.category);
  if (set === 'groceries' && !ctx.overBudget) return 'praise';
  if (set === 'health' && !ctx.overBudget) return 'praise';
  if (ctx.overBudget) return 'over';
  if (ctx.amountCents >= (ctx.bigAtCents ?? ctx.unit.priceCents * 2)) return 'big';
  if (ctx.countThisWeek >= 3 && set !== 'subscription' && set !== 'uni') return 'repeat';
  if (ctx.hour >= 23 || ctx.hour < 5) return 'late';
  if (BODY_ROASTS_AVAILABLE && ctx.level === 'unhinged' && ctx.bodyRoasts && banks(ctx.lang).BODY[set]) return 'body';
  return 'base';
}

/** Lines that only make sense when this is not the first one, so they must not be used on a first buy. */
export const REPEATISH: Record<LangId, RegExp> = {
  en: /\b(again|once more|back at it|back already|keep (buying|ordering|doing)|here we go|the usual|as usual|regular)\b/i,
  zh: /又(是|来|买|点|喝|吃)|再(来|次|买|点)|老是|总是|依旧|照旧|继续|常客/,
  id: /\b(lagi-lagi|lagi|terus|kambuh|sekali lagi|seperti biasa|langganan)\b/i,
  es: /\b(otra vez|de nuevo|nuevamente|como siempre|vuelves|otra ronda|de siempre|habitual)\b/i,
};

/** Lines that only make sense when prices are in HSPs ("{units} of actual snack packs"). */
const HSP_ONLY = /snack\s*pack|HSP/i;

/** First buy of its kind this week: drop lines that talk as if there was a last time (never leaves the bank empty). */
function forFirstBuy(bank: string[], lang: LangId): string[] {
  const fresh = bank.filter((l) => !REPEATISH[lang].test(l) && !/\{n(th)?\}/.test(l));
  return fresh.length > 0 ? fresh : bank;
}

export function roastFor(ctx: RoastCtx): string {
  const b = banks(ctx.lang);
  const set = roastSetFor(ctx.category);
  const kind = roastKind(ctx);
  let bank: string[];
  switch (kind) {
    case 'over':
      bank = b.OVER[ctx.level];
      break;
    case 'big':
      bank = b.BIG[ctx.level];
      break;
    case 'repeat':
      bank = b.REPEAT[ctx.level];
      break;
    case 'late':
      bank = b.LATE[ctx.level];
      break;
    case 'body':
      bank = b.BODY[set] as string[];
      break;
    default:
      bank = (b.BASE[set] ?? b.BASE.other)[ctx.level];
  }
  if (ctx.melbourne && kind !== 'body') {
    const key = kind === 'over' ? 'OVER' : kind === 'big' ? 'BIG' : kind === 'repeat' ? 'REPEAT' : kind === 'late' ? 'LATE' : set;
    bank = [...bank, ...melbLines(ctx.lang ?? 'en', key, ctx.level)];
  }
  if (ctx.unit.id === 'work') {
    const rest = bank.filter((l) => !HSP_ONLY.test(l));
    if (rest.length > 0) bank = rest;
  }
  if (kind !== 'repeat' && ctx.countThisWeek <= 1) bank = forFirstBuy(bank, ctx.lang ?? 'en');
  // fill first, then pick, so "recent" (which holds finished lines) can be compared properly
  let line = pick(bank.map((l) => fill(l, ctx)), ctx.seed, ctx.recent);
  if (ctx.method === 'bnpl') line += ' ' + fill(pick(b.BNPL[ctx.level], ctx.seed), ctx);
  return line;
}

/** For the preview in settings: one sample line at each level. */
export function sampleRoast(level: RoastLevel, bodyRoasts: boolean, unit: UnitDef, lang: LangId = 'en', fmt?: Partial<MoneyFmt>): string {
  return roastFor({
    category: BODY_ROASTS_AVAILABLE && bodyRoasts && level === 'unhinged' ? 'fastfood' : 'matcha',
    amountCents: 1400,
    level,
    bodyRoasts,
    unit,
    hourlyCents: null,
    countThisWeek: 1,
    overBudget: false,
    weeklyBudgetCents: 10000,
    method: 'tap',
    hour: 14,
    seed: 0,
    lang,
    fmt,
  });
}

// ---------------------------------------------------------------------------
// "I want this" nudges
// ---------------------------------------------------------------------------
export function wantNudge(level: RoastLevel, seed: number, lang: LangId = 'en'): string {
  return pick(banks(lang).WANT[level], seed);
}

export function shameMatchLine(level: RoastLevel, label: string, matchLabel: string): string {
  const base: Bank = {
    mild: [`You regretted "${matchLabel}" before. Maybe pause on "${label}".`],
    medium: [`Remember "${matchLabel}"? You said "nah". "${label}" feels similar.`],
    unhinged: [`You already bought "${matchLabel}" and hated it. And now "${label}"? Same energy, stupid.`],
  };
  return base[level][0];
}
