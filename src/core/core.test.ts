import { describe, expect, it } from 'vitest';
import {
  CATEGORIES,
  DEFAULT_UNIT,
  buildRecap,
  categorizeMerchant,
  computeBudget,
  coolingProgress,
  createWish,
  dailySpend,
  dayIndexInWeek,
  daysLeftInWeek,
  findShameMatch,
  formatMoney,
  formatRemaining,
  formatUnits,
  formatWork,
  friendlyNumber,
  friesLeft,
  isRegretDue,
  parseAmountToCents,
  recapVerdict,
  recommendedCoolingHours,
  regretQueue,
  regretStats,
  roastFor,
  roastKind,
  sampleRoast,
  startOfWeek,
  toWeeklyCents,
  unlockedStickerIds,
  weeklyPoolCents,
  wishPhase,
  worstRegretCategories,
  type Purchase,
  type RoastCtx,
  type Settings,
  type Wallet,
  type WalletMoney,
  BUILTIN_CATEGORIES,
  computeOverview,
  currencyDef,
  makeCustomCategory,
  registerCustomCategories,
  roastSetFor,
  unitForCurrency,
} from './index';
import * as EN from './roasts-en';

const HOUR = 3600 * 1000;
let n = 0;
const mk = (ts: number, amountCents: number, category: Purchase['category'] = 'coffee', extra: Partial<Purchase> = {}): Purchase => ({
  id: `p${n++}`,
  walletId: 'w1',
  ts,
  amountCents,
  category,
  method: 'tap',
  roast: '',
  source: 'manual',
  ...extra,
});

type Combined = Settings & WalletMoney;
const settings = (over: Partial<Combined> = {}): Combined => ({
  onboarded: true,
  startedTs: new Date(2026, 8, 1).getTime(),
  income: [],
  recurring: [],
  savingsWeeklyCents: 0,
  budgetMode: 'manual',
  manualWeeklyCents: 14000,
  unit: DEFAULT_UNIT,
  hourlyCents: null,
  unitMode: 'hsp',
  shiftHours: 6,
  roastLevel: 'medium',
  bodyRoasts: false,
  weekStartsOn: 1,
  goalName: '',
  language: 'en',
  currency: 'AUD',
  showCents: false,
  roundSummaries: false,
  theme: 'garlic',
  activeWalletId: 'w1',
  notifyWish: true,
  notifyWeekly: false,
  notifyPace: true,
  notifyRecurring: true,
  notifyEvening: false,
  lockApp: false, lastBackupTs: null,
  adultConfirmed: false,
  reviewAsks: 0,
  lastReviewAskTs: null,
  sounds: true,
  haptics: true,
  ...over,
});
const walletOf = (c: Combined, id = 'w1'): Wallet => ({
  id,
  name: 'Main',
  icon: 'hsp',
  color: '#FFD23F',
  income: c.income,
  recurring: c.recurring,
  savingsWeeklyCents: c.savingsWeeklyCents,
  budgetMode: c.budgetMode,
  manualWeeklyCents: c.manualWeeklyCents,
  createdTs: 0,
});

// Mon 19 Oct 2026 is the start of the week we test in
const MON = new Date(2026, 9, 19, 9, 0).getTime();
const TUE = new Date(2026, 9, 20, 9, 0).getTime();
const WED = new Date(2026, 9, 21, 9, 0).getTime();
const SUN = new Date(2026, 9, 25, 20, 0).getTime();

describe('money', () => {
  it('formats dollars without trailing .00', () => {
    expect(formatMoney(1800)).toBe('$18');
    expect(formatMoney(1850)).toBe('$18.50');
    expect(formatMoney(5)).toBe('$0.05');
    expect(formatMoney(-2500)).toBe('-$25');
    expect(formatMoney(120000)).toBe('$1,200');
  });

  it('parses keypad input', () => {
    expect(parseAmountToCents('12')).toBe(1200);
    expect(parseAmountToCents('12.5')).toBe(1250);
    expect(parseAmountToCents('12.50')).toBe(1250);
    expect(parseAmountToCents('.5')).toBe(50);
    expect(parseAmountToCents('7.999')).toBe(799);
    expect(parseAmountToCents('')).toBeNull();
    expect(parseAmountToCents('.')).toBeNull();
  });

  it('prices things in HSPs at $18 each', () => {
    expect(DEFAULT_UNIT.priceCents).toBe(1800);
    expect(formatUnits(1800, DEFAULT_UNIT)).toBe('1 HSP');
    expect(formatUnits(5400, DEFAULT_UNIT)).toBe('3 HSPs');
    expect(formatUnits(2700, DEFAULT_UNIT)).toBe('1.5 HSPs');
    expect(formatUnits(900, DEFAULT_UNIT)).toBe('0.5 HSPs');
    expect(formatUnits(36000, DEFAULT_UNIT)).toBe('20 HSPs');
  });

  it('never shows 2.0 or -0', () => {
    expect(friendlyNumber(2.0)).toBe('2');
    expect(friendlyNumber(0.04)).toBe('0');
    expect(friendlyNumber(-0.02)).toBe('0');
    expect(friendlyNumber(12.6)).toBe('13');
  });

  it('turns money into hours of work', () => {
    expect(formatWork(2500, null)).toBeNull();
    expect(formatWork(2500, 2500)).toBe('1 hr of work');
    expect(formatWork(3750, 2500)).toBe('1.5 hrs of work');
    expect(formatWork(1250, 2500)).toBe('30 min of work');
  });
});

describe('week', () => {
  it('finds the start of a Monday week', () => {
    expect(startOfWeek(WED, 1)).toBe(new Date(2026, 9, 19).getTime());
    expect(startOfWeek(SUN, 1)).toBe(new Date(2026, 9, 19).getTime());
  });
  it('counts days', () => {
    expect(dayIndexInWeek(MON, 1)).toBe(0);
    expect(dayIndexInWeek(WED, 1)).toBe(2);
    expect(daysLeftInWeek(MON, 1)).toBe(7);
    expect(daysLeftInWeek(SUN, 1)).toBe(1);
  });
});

describe('budget', () => {
  it('converts frequencies to weekly', () => {
    expect(toWeeklyCents(1000, 'weekly')).toBe(1000);
    expect(toWeeklyCents(2000, 'fortnightly')).toBe(1000);
    expect(toWeeklyCents(52000, 'yearly')).toBe(1000);
    expect(toWeeklyCents(100000, 'monthly')).toBe(Math.round((100000 * 12) / 52));
  });

  it('builds the weekly pool from income, bills and savings', () => {
    const s = settings({
      budgetMode: 'auto',
      income: [{ id: 'a', label: 'Fishbowl', amountCents: 60000, freq: 'weekly' }],
      recurring: [{ id: 'b', label: 'Rent', amountCents: 30000, freq: 'weekly' }],
      savingsWeeklyCents: 5000,
    });
    expect(weeklyPoolCents(s)).toBe(25000);
  });

  it('never goes below zero', () => {
    const s = settings({
      budgetMode: 'auto',
      income: [{ id: 'a', label: 'x', amountCents: 10000, freq: 'weekly' }],
      recurring: [{ id: 'b', label: 'Rent', amountCents: 30000, freq: 'weekly' }],
    });
    expect(weeklyPoolCents(s)).toBe(0);
  });

  it('manual mode ignores income', () => {
    expect(weeklyPoolCents(settings({ manualWeeklyCents: 9000 }))).toBe(9000);
  });

  it('safe to spend today on a fresh Monday is a seventh of the week', () => {
    const b = computeBudget(settings(), [], MON);
    expect(b.safeTodayCents).toBe(2000);
    expect(b.daysLeft).toBe(7);
    expect(b.friesLeft).toBe(9);
  });

  it('overspending Monday shows negative safe today, and spreads the rest of the week on Wednesday', () => {
    const ps = [mk(MON, 3000)];
    expect(computeBudget(settings(), ps, MON).safeTodayCents).toBe(-1000);
    const wed = computeBudget(settings(), ps, WED);
    expect(wed.spentWeekCents).toBe(3000);
    expect(wed.safeTodayCents).toBe(Math.floor((14000 - 3000) / 5));
  });

  it('ignores purchases from other weeks', () => {
    const last = mk(new Date(2026, 9, 18, 12).getTime(), 9999);
    expect(computeBudget(settings(), [last], WED).spentWeekCents).toBe(0);
  });

  it('counts pay-later purchases in full', () => {
    const p = mk(MON, 8000, 'clothes', { method: 'bnpl' });
    expect(computeBudget(settings(), [p], MON).spentWeekCents).toBe(8000);
  });

  it('fries left shrinks with spending and clamps', () => {
    expect(friesLeft(14000, 0)).toBe(9);
    expect(friesLeft(14000, 7000)).toBe(5);
    expect(friesLeft(14000, 14000)).toBe(0);
    expect(friesLeft(14000, 99999)).toBe(0);
    expect(friesLeft(0, 0)).toBe(9);
  });

  it('mood goes from happy to broke', () => {
    expect(computeBudget(settings(), [], WED).mood).toBe('proud');
    expect(computeBudget(settings(), [mk(MON, 14000)], WED).mood).toBe('broke');
    expect(computeBudget(settings(), [mk(WED, 9000)], WED).mood).toBe('sad');
  });

  it('streak counts days under the daily allowance since you started', () => {
    const s = settings({ startedTs: new Date(2026, 9, 19).getTime() });
    const ps = [mk(MON, 500), mk(TUE, 1500)];
    expect(computeBudget(s, ps, WED).streak).toBe(3);
    const blown = [mk(MON, 500), mk(TUE, 5000)];
    expect(computeBudget(s, blown, WED).streak).toBe(1);
  });

  it('daily spend buckets the week', () => {
    const d = dailySpend([mk(MON, 100), mk(MON, 200), mk(WED, 500)], new Date(2026, 9, 19).getTime());
    expect(d).toEqual([300, 0, 500, 0, 0, 0, 0]);
  });
});

describe('roasts', () => {
  const base: RoastCtx = {
    category: 'matcha',
    amountCents: 1400,
    level: 'medium',
    bodyRoasts: false,
    unit: DEFAULT_UNIT,
    hourlyCents: null,
    countThisWeek: 1,
    overBudget: false,
    weeklyBudgetCents: 14000,
    method: 'tap',
    hour: 14,
    seed: 0,
  };

  it('picks the right kind of roast', () => {
    expect(roastKind(base)).toBe('base');
    expect(roastKind({ ...base, overBudget: true })).toBe('over');
    expect(roastKind({ ...base, amountCents: 3600 })).toBe('big');
    expect(roastKind({ ...base, countThisWeek: 3 })).toBe('repeat');
    expect(roastKind({ ...base, hour: 2 })).toBe('late');
    expect(roastKind({ ...base, category: 'groceries' })).toBe('praise');
    expect(roastKind({ ...base, category: 'pharmacy' })).toBe('praise');
  });

  it('never body roasts in the App Store build', () => {
    const f = { ...base, category: 'fastfood' as const, level: 'unhinged' as const, bodyRoasts: true };
    expect(roastKind(f)).toBe('base');
  });

  it('keeps brand names out of the roast copy', () => {
    const all = JSON.stringify([EN.BASE, EN.OVER, EN.BIG, EN.REPEAT, EN.LATE, EN.BNPL, EN.BODY, EN.WANT]);
    expect(all).not.toMatch(/maccas|mcdonald|uber|coles|woolies|sephora|twisties|tiktok|netflix|myki|spotify|doordash|apple/i);
  });

  it('custom and new categories borrow a roast set', () => {
    expect(roastSetFor('pizza')).toBe('fastfood');
    registerCustomCategories([makeCustomCategory('c1', 'Pigeon food', 'chips', 'bread')]);
    expect(roastSetFor('c1')).toBe('snacks');
    expect(roastFor({ ...base, category: 'c1' })).not.toMatch(/\{[a-z]+\}/);
    registerCustomCategories([]);
    expect(roastSetFor('c1')).toBe('other');
  });

  it('is deterministic for a seed and fills every token', () => {
    const a = roastFor({ ...base, seed: 4 });
    expect(roastFor({ ...base, seed: 4 })).toBe(a);
    expect(a).not.toMatch(/\{[a-z]+\}/);
  });

  it('avoids lines used recently', () => {
    const first = roastFor({ ...base, seed: 1 });
    const second = roastFor({ ...base, seed: 1, recent: [first] });
    expect(second).not.toBe(first);
  });

  it('adds a note for pay later', () => {
    expect(roastFor({ ...base, method: 'bnpl' })).toMatch(/full/);
  });

  it('no category, level or kind leaves a token or an em dash behind', () => {
    for (const c of CATEGORIES) {
      for (const level of ['mild', 'medium', 'unhinged'] as const) {
        for (let seed = 0; seed < 6; seed++) {
          for (const extra of [
            {},
            { overBudget: true },
            { amountCents: 9000 },
            { countThisWeek: 4 },
            { hour: 3 },
            { method: 'bnpl' as const },
            { bodyRoasts: true },
          ]) {
            const line = roastFor({ ...base, category: c.id, level, seed, merchant: 'Maccas', ...extra });
            expect(line.length).toBeGreaterThan(5);
            expect(line).not.toMatch(/\{[a-z]+\}/);
            expect(line).not.toContain('—');
          }
        }
      }
    }
  });

  it('sample roasts exist at each level', () => {
    for (const lv of ['mild', 'medium', 'unhinged'] as const) expect(sampleRoast(lv, true, DEFAULT_UNIT).length).toBeGreaterThan(5);
  });
});

describe('cooling off', () => {
  it('waits longer for bigger buys', () => {
    expect(recommendedCoolingHours(1500)).toBe(24);
    expect(recommendedCoolingHours(5000)).toBe(48);
    expect(recommendedCoolingHours(25000)).toBe(72);
  });

  it('moves from cooling to ready', () => {
    const w = createWish('Headphones', 25000, 'tech', 48, MON);
    expect(wishPhase(w, MON + 10 * HOUR)).toBe('cooling');
    expect(wishPhase(w, MON + 48 * HOUR)).toBe('ready');
    expect(wishPhase({ ...w, status: 'ditched' }, MON)).toBe('ditched');
    expect(coolingProgress(w, MON)).toBe(0);
    expect(coolingProgress(w, MON + 24 * HOUR)).toBeCloseTo(0.5);
    expect(coolingProgress(w, MON + 99 * HOUR)).toBe(1);
  });

  it('formats time left', () => {
    expect(formatRemaining(0)).toBe('now');
    expect(formatRemaining(45 * 60000)).toBe('45m');
    expect(formatRemaining(23 * HOUR + 10 * 60000)).toBe('23h 10m');
    expect(formatRemaining(5 * HOUR)).toBe('5h');
    expect(formatRemaining(50 * HOUR)).toBe('2d 2h');
  });

  it('matches wants against the shame shelf', () => {
    const shelf = [{ id: '1', ts: 0, label: 'Wired earphones', amountCents: 9000, source: 'manual' as const }];
    expect(findShameMatch('Fancy earphones', shelf)?.id).toBe('1');
    expect(findShameMatch('Jacket', shelf)).toBeNull();
    expect(findShameMatch('', shelf)).toBeNull();
  });
});

describe('regret check-ins', () => {
  it('asks after a day, longer for big buys, never for groceries', () => {
    const p = mk(MON, 1500, 'matcha');
    expect(isRegretDue(p, MON + 23 * HOUR)).toBe(false);
    expect(isRegretDue(p, MON + 25 * HOUR)).toBe(true);
    const big = mk(MON, 8000, 'clothes');
    expect(isRegretDue(big, MON + 25 * HOUR)).toBe(false);
    expect(isRegretDue(big, MON + 49 * HOUR)).toBe(true);
    expect(isRegretDue(mk(MON, 8000, 'groceries'), MON + 99 * HOUR)).toBe(false);
    expect(isRegretDue(mk(MON, 200, 'snacks'), MON + 99 * HOUR)).toBe(false);
    expect(isRegretDue({ ...p, regret: 'worth' }, MON + 99 * HOUR)).toBe(false);
  });

  it('queues at most a few, oldest first', () => {
    const ps = [1, 2, 3, 4, 5].map((i) => mk(MON + i * HOUR, 1500, 'coffee'));
    const q = regretQueue(ps, MON + 100 * HOUR);
    expect(q).toHaveLength(3);
    expect(q[0].ts).toBeLessThan(q[1].ts);
  });

  it('computes stats and the worst categories', () => {
    const ps = [
      mk(MON, 1500, 'matcha', { regret: 'nah' }),
      mk(MON, 1500, 'matcha', { regret: 'nah' }),
      mk(MON, 1500, 'matcha', { regret: 'worth' }),
      mk(MON, 4000, 'tech', { regret: 'worth' }),
      mk(MON, 1000, 'coffee'),
    ];
    const s = regretStats(ps);
    expect(s.answered).toBe(4);
    expect(s.nah).toBe(2);
    expect(s.regretRate).toBeCloseTo(0.5);
    expect(s.regretCents).toBe(3000);
    const worst = worstRegretCategories(ps);
    expect(worst[0].category).toBe('matcha');
    expect(worst).toHaveLength(1);
  });
});

describe('recap', () => {
  it('splits the week into the five HSP parts', () => {
    const ps = [mk(MON, 1000, 'coffee'), mk(MON, 3000, 'fastfood'), mk(TUE, 6000, 'clothes')];
    const rc = buildRecap(ps, new Date(2026, 9, 19).getTime(), 14000);
    expect(rc.spentCents).toBe(10000);
    expect(rc.count).toBe(3);
    expect(rc.byGroup).toHaveLength(5);
    expect(rc.byGroup.reduce((a, g) => a + g.share, 0)).toBeCloseTo(1);
    expect(rc.topCategory?.category).toBe('clothes');
    expect(rc.biggest?.amountCents).toBe(6000);
    expect(rc.underBudget).toBe(true);
    expect(rc.leftCents).toBe(4000);
  });

  it('has a verdict whatever happens', () => {
    const empty = buildRecap([], MON, 14000);
    const over = buildRecap([mk(MON, 20000, 'tech')], new Date(2026, 9, 19).getTime(), 14000);
    for (const lv of ['mild', 'medium', 'unhinged'] as const) {
      expect(recapVerdict(empty, lv, DEFAULT_UNIT).length).toBeGreaterThan(10);
      expect(recapVerdict(over, lv, DEFAULT_UNIT)).toMatch(/over/i);
    }
  });
});

describe('merchants', () => {
  it('maps Apple Pay merchants to categories', () => {
    expect(categorizeMerchant('McDonald\'s Southbank')).toBe('fastfood');
    expect(categorizeMerchant('UBER EATS')).toBe('delivery');
    expect(categorizeMerchant('Uber *Trip')).toBe('rideshare');
    expect(categorizeMerchant('Coles Express')).toBe('groceries');
    expect(categorizeMerchant('Spotify')).toBe('music');
    expect(categorizeMerchant('Netflix')).toBe('streaming');
    expect(categorizeMerchant('iCloud')).toBe('subscription');
    expect(categorizeMerchant('Gong Cha')).toBe('bubbletea');
    expect(categorizeMerchant('xyzzy')).toBeNull();
    expect(categorizeMerchant(undefined)).toBeNull();
  });
});

describe('stickers', () => {
  it('unlocks first bite on the first log', () => {
    const base = { wishes: [], shame: [], settings: settings(), wallets: [walletOf(settings())], now: WED };
    expect(unlockedStickerIds({ ...base, purchases: [] })).not.toContain('first-log');
    expect(unlockedStickerIds({ ...base, purchases: [mk(MON, 500)] })).toContain('first-log');
  });
});

describe('currency and display', () => {
  it('formats other currencies and locales', () => {
    expect(formatMoney(1850, { fmt: { currency: 'USD' } })).toBe('$18.50');
    expect(formatMoney(1850, { fmt: { currency: 'EUR', locale: 'es' } })).toBe('\u20AC18,50');
    expect(formatMoney(123456700, { fmt: { currency: 'IDR', locale: 'id' } })).toBe('Rp1.234.567');
    expect(formatMoney(150000, { fmt: { currency: 'JPY' } })).toBe('\u00A51,500');
  });
  it('can always show two decimals, or round away the cents', () => {
    expect(formatMoney(1800, { fmt: { decimals: 'always' } })).toBe('$18.00');
    expect(formatMoney(1849, { fmt: { decimals: 'none' } })).toBe('$18');
    expect(formatMoney(1850, { fmt: { decimals: 'none' } })).toBe('$19');
    expect(formatMoney(-1850, { fmt: { decimals: 'none' } })).toBe('-$19');
  });
  it('scales the HSP price for the currency', () => {
    expect(unitForCurrency(DEFAULT_UNIT, 'IDR').priceCents).toBe(currencyDef('IDR').hsp * 100);
    expect(unitForCurrency(DEFAULT_UNIT, 'AUD').priceCents).toBe(1800);
  });
  it('uses a comma for decimals in Indonesian and Spanish', () => {
    expect(formatUnits(2700, DEFAULT_UNIT, 'id')).toBe('1,5 HSPs');
    expect(parseAmountToCents('12,5')).toBe(1250);
  });
});

describe('wallets', () => {
  const w = (id: string, manual: number): Wallet => ({
    id,
    name: id,
    icon: 'hsp',
    color: '#fff',
    income: [],
    recurring: [],
    savingsWeeklyCents: 0,
    budgetMode: 'manual',
    manualWeeklyCents: manual,
    createdTs: 0,
  });
  it('keeps each wallet separate and pools the total', () => {
    const wallets = [w('w1', 14000), w('w2', 7000)];
    const ps = [mk(MON, 2000, 'coffee', { walletId: 'w1' }), mk(MON, 1000, 'tech', { walletId: 'w2' })];
    const ov = computeOverview(wallets, settings(), ps, MON);
    expect(ov.wallets[0].budget.spentWeekCents).toBe(2000);
    expect(ov.wallets[1].budget.spentWeekCents).toBe(1000);
    expect(ov.total.budgetCents).toBe(21000);
    expect(ov.total.spentWeekCents).toBe(3000);
  });
  it('ignores archived wallets and purchases from unknown wallets', () => {
    const wallets = [w('w1', 14000), { ...w('w2', 7000), archived: true }];
    const ps = [mk(MON, 2000, 'coffee', { walletId: 'w1' }), mk(MON, 1000, 'tech', { walletId: 'w2' })];
    const ov = computeOverview(wallets, settings(), ps, MON);
    expect(ov.wallets).toHaveLength(1);
    expect(ov.total.spentWeekCents).toBe(2000);
  });
});

describe('category catalogue', () => {
  it('has unique ids and a valid roast set for every category', () => {
    const ids = BUILTIN_CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of BUILTIN_CATEGORIES) expect(Object.keys(EN.BASE)).toContain(roastSetFor(c.id));
  });
  it('has plenty of categories, each with an icon', () => {
    expect(BUILTIN_CATEGORIES.length).toBeGreaterThanOrEqual(70);
    for (const c of BUILTIN_CATEGORIES) expect(c.icon.length).toBeGreaterThan(1);
  });
});

import { formatTyped, pressKey } from './keypad';

describe('keypad', () => {
  it('builds numbers digit by digit', () => {
    let v = '';
    for (const k of ['1', '2', '.', '5']) v = pressKey(v, k, false);
    expect(v).toBe('12.5');
  });
  it('limits to two decimals and one point', () => {
    let v = '';
    for (const k of ['3', '.', '1', '4', '9', '.']) v = pressKey(v, k, false);
    expect(v).toBe('3.14');
  });
  it('starts with 0. when you tap the point first, and replaces a lone zero', () => {
    expect(pressKey('', '.', false)).toBe('0.');
    expect(pressKey('0', '7', false)).toBe('7');
  });
  it('deletes, and has a 000 key for zero-decimal currencies', () => {
    expect(pressKey('125', 'del', false)).toBe('12');
    expect(pressKey('15', '000', true)).toBe('15000');
    expect(pressKey('15', '.', true)).toBe('15');
    expect(pressKey('', '000', true)).toBe('');
  });
  it('formats what you typed like money', () => {
    expect(formatTyped('1234567.5', 'en')).toBe('1,234,567.5');
    expect(formatTyped('1234.5', 'id')).toBe('1.234,5');
    expect(formatTyped('', 'en')).toBe('0');
  });
});
