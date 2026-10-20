import { DOMParser } from '@xmldom/xmldom';
import { strFromU8, unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { DEFAULT_UNIT, Purchase, ShameItem, Wallet, WishItem } from '../core';
import { makeT } from '../i18n/translate';
import { buildReport, monthStartOf } from './report';
import { buildWorkbook, cleanKey } from './xlsx/build';
import { colLetter, esc, range, ref, serialDay } from './xlsx/writer';

const wallet = (id: string, weekly: number, extra: Partial<Wallet> = {}): Wallet => ({
  id,
  name: id,
  icon: 'hsp',
  color: '#FFD23F',
  income: [],
  recurring: [],
  savingsWeeklyCents: 0,
  budgetMode: 'manual',
  manualWeeklyCents: weekly,
  createdTs: 0,
  ...extra,
});

let n = 0;
const buy = (y: number, m: number, d: number, cents: number, extra: Partial<Purchase> = {}): Purchase => ({
  id: `p${n++}`,
  walletId: 'main',
  ts: new Date(y, m - 1, d, 12, 0).getTime(),
  amountCents: cents,
  category: 'coffee',
  method: 'tap',
  roast: '',
  source: 'manual',
  ...extra,
});

const settings = { unit: DEFAULT_UNIT, hourlyCents: 2800, weekStartsOn: 1, currency: 'AUD' as const, language: 'en' as const };
const NOW = new Date(2026, 9, 20, 11, 0).getTime();
const base = (over: Partial<Parameters<typeof buildReport>[0]> = {}) =>
  buildReport({ purchases: [], wishes: [], shame: [], wallets: [wallet('main', 14000)], walletId: 'main', settings, month: new Date(2026, 8, 15).getTime(), now: NOW, ...over });

describe('report', () => {
  it('only counts the month asked for, inclusive of the first and last day', () => {
    const r = base({
      purchases: [buy(2026, 8, 31, 100), buy(2026, 9, 1, 200), buy(2026, 9, 30, 400), buy(2026, 10, 1, 800)],
    });
    expect(r.count).toBe(2);
    expect(r.spentCents).toBe(600);
    expect(r.daysInMonth).toBe(30);
    expect(r.byDay[0].cents).toBe(200);
    expect(r.byDay[29].cents).toBe(400);
  });

  it('scopes to one wallet, or pools every wallet', () => {
    const wallets = [wallet('main', 14000), wallet('trip', 7000)];
    const purchases = [buy(2026, 9, 3, 1000), buy(2026, 9, 4, 500, { walletId: 'trip' })];
    expect(base({ wallets, purchases, walletId: 'trip' }).spentCents).toBe(500);
    const all = base({ wallets, purchases, walletId: 'all' });
    expect(all.spentCents).toBe(1500);
    expect(all.walletName).toBeNull();
    expect(all.budgetCents).toBe(Math.round((21000 * 30) / 7));
  });

  it('keeps archived wallets in the pooled history but not in the pooled budget', () => {
    const wallets = [wallet('main', 14000), wallet('old', 7000, { archived: true })];
    const r = base({ wallets, purchases: [buy(2026, 9, 3, 1000, { walletId: 'old' })], walletId: 'all' });
    expect(r.spentCents).toBe(1000);
    expect(r.budgetCents).toBe(Math.round((14000 * 30) / 7));
  });

  it('ranks categories by spend with shares that add to one', () => {
    const r = base({ purchases: [buy(2026, 9, 3, 300, { category: 'coffee' }), buy(2026, 9, 4, 900, { category: 'tech' }), buy(2026, 9, 5, 300, { category: 'tech' })] });
    expect(r.byCategory.map((c) => c.category)).toEqual(['tech', 'coffee']);
    expect(r.byCategory.reduce((a, c) => a + c.share, 0)).toBeCloseTo(1);
    expect(r.byGroup.reduce((a, g) => a + g.cents, 0)).toBe(r.spentCents);
  });

  it('clips weeks to the month and the week budgets add up to the month budget', () => {
    const r = base({ purchases: [buy(2026, 9, 1, 100), buy(2026, 9, 30, 100)] });
    expect(r.byWeek[0].start).toBe(new Date(2026, 8, 1).getTime());
    expect(r.byWeek.reduce((a, w) => a + w.count, 0)).toBe(2);
    expect(r.byWeek.reduce((a, w) => a + w.cents, 0)).toBe(200);
    expect(Math.abs(r.byWeek.reduce((a, w) => a + w.budgetCents, 0) - r.budgetCents)).toBeLessThanOrEqual(W_ROUNDING);
  });

  it('merges merchants ignoring case and keeps the top five', () => {
    const names = ['Cafe', 'cafe', 'Zed', 'Yan', 'Xi', 'Wu', 'Vi'];
    const r = base({ purchases: names.map((m, i) => buy(2026, 9, i + 1, 100 + i, { merchant: m })) });
    expect(r.topMerchants).toHaveLength(5);
    expect(r.topMerchants.find((m) => m.name.toLowerCase() === 'cafe')?.count).toBe(2);
  });

  it('stops counting no-spend days at today for the current month', () => {
    const r = base({ month: NOW, purchases: [buy(2026, 10, 2, 100)] });
    expect(r.zeroDays).toBe(19); // 1st to the 20th, minus the 2nd
  });

  it('counts the money you did not spend, and only shelf items from this month', () => {
    const mid = new Date(2026, 8, 10).getTime();
    const wishes: WishItem[] = [
      { id: 'w1', walletId: 'main', label: 'a', amountCents: 5000, category: 'tech', createdTs: mid, unlockTs: mid, status: 'ditched', decidedTs: mid },
      { id: 'w2', walletId: 'main', label: 'b', amountCents: 7000, category: 'tech', createdTs: mid, unlockTs: mid, status: 'bought', decidedTs: mid },
      { id: 'w3', walletId: 'main', label: 'c', amountCents: 900, category: 'tech', createdTs: new Date(2026, 6, 1).getTime(), unlockTs: 0, status: 'ditched', decidedTs: new Date(2026, 6, 2).getTime() },
    ];
    const shame: ShameItem[] = [
      { id: 's1', ts: mid, label: 'x', amountCents: 1200, source: 'manual' },
      { id: 's2', ts: new Date(2026, 7, 1).getTime(), label: 'y', amountCents: 3400, source: 'manual' },
    ];
    const r = base({ wishes, shame });
    expect(r.ditchedCents).toBe(5000);
    expect(r.wishes).toHaveLength(2);
    expect(r.shameCents).toBe(1200);
  });

  it('survives a month with nothing in it', () => {
    const r = base();
    expect(r.count).toBe(0);
    expect(r.avgCents).toBe(0);
    expect(r.biggest).toBeNull();
    expect(r.busiestDay).toBeNull();
    expect(r.hsp).toBe(0);
  });

  it('month helpers handle year boundaries', () => {
    expect(monthStartOf(new Date(2026, 11, 31, 23, 59).getTime())).toBe(new Date(2026, 11, 1).getTime());
  });
});

const W_ROUNDING = 5;

describe('workbook writer helpers', () => {
  it('names columns and ranges', () => {
    expect(colLetter(0)).toBe('A');
    expect(colLetter(25)).toBe('Z');
    expect(colLetter(26)).toBe('AA');
    expect(ref(0, 0)).toBe('A1');
    expect(ref(4, 6, true)).toBe('$G$5');
    expect(range(2, 6, 9, 6, true)).toBe('$G$3:$G$10');
  });

  it('escapes markup and drops control characters', () => {
    expect(esc('a<b>&"c"\u0001')).toBe('a&lt;b&gt;&amp;&quot;c&quot;');
  });

  it('dates are whole numbers at midnight and match Excel serials', () => {
    expect(serialDay(new Date(2026, 0, 1, 15, 30).getTime())).toBe(46023);
    expect(serialDay(new Date(1900, 2, 1).getTime())).toBe(61);
  });

  it('keeps text from acting as a wildcard or operator in a criterion', () => {
    expect(cleanKey('Pets?*')).toBe('Pets');
    expect(cleanKey('>= big')).toBe('big');
    expect(cleanKey('  a~b  ')).toBe('a b');
    expect(cleanKey('x'.repeat(200)).length).toBe(60);
  });
});

describe('workbook', () => {
  const t = makeT('en');
  const purchases = [
    buy(2026, 9, 3, 650, { merchant: 'Corner Cafe', regret: 'worth' }),
    buy(2026, 9, 3, 4200, { category: 'nightout', regret: 'nah', note: 'a & b <c>' }),
    buy(2026, 9, 9, 8900, { category: 'clothes', merchant: 'Thrift "Haul"' }),
  ];
  const rep = base({ purchases });
  const files = unzipSync(buildWorkbook(rep, { t, now: NOW }));
  const text = (p: string) => strFromU8(files[p]);

  it('has every part a spreadsheet app expects', () => {
    for (const p of ['[Content_Types].xml', '_rels/.rels', 'xl/workbook.xml', 'xl/_rels/workbook.xml.rels', 'xl/styles.xml', 'xl/sharedStrings.xml']) expect(files[p], p).toBeTruthy();
    for (let i = 1; i <= 8; i++) expect(files[`xl/worksheets/sheet${i}.xml`], `sheet${i}`).toBeTruthy();
    expect(Object.keys(files).filter((f) => f.startsWith('xl/charts/chart')).length).toBe(4);
  });

  it('every part is well-formed XML', () => {
    const errors: string[] = [];
    for (const [name, data] of Object.entries(files)) {
      new DOMParser({ errorHandler: { warning: () => {}, error: (m: string) => errors.push(`${name}: ${m}`), fatalError: (m: string) => errors.push(`${name}: ${m}`) } }).parseFromString(strFromU8(data), 'text/xml');
    }
    expect(errors).toEqual([]);
  });

  it('names the sheets and defines the inputs people may change', () => {
    const wbx = text('xl/workbook.xml');
    for (const name of ['Summary', 'Purchases', 'By day', 'By category', 'Weeks', 'Cooling off', 'Shame shelf', 'About']) expect(wbx).toContain(`name="${name}"`);
    for (const nm of ['UnitPrice', 'HourlyPay', 'MonthBudget', 'DaysInMonth', 'TotalSpent', 'BuyCount']) expect(wbx).toContain(`<definedName name="${nm}">`);
    expect(wbx).toContain('fullCalcOnLoad="1"');
  });

  it('writes totals as live formulas with a cached value', () => {
    const s1 = text('xl/worksheets/sheet1.xml');
    expect(s1).toMatch(/<f>SUM\('Purchases'!\$G\$3:\$G\$5\)<\/f><v>137\.5<\/v>/);
    expect(s1).toContain('<f>TotalSpent/UnitPrice</f>');
  });

  it('can leave the cached values out so another app must calculate', () => {
    const bare = unzipSync(buildWorkbook(rep, { t, now: NOW, cache: false }));
    expect(strFromU8(bare['xl/worksheets/sheet1.xml'])).toMatch(/<f>SUM\('Purchases'!\$G\$3:\$G\$5\)<\/f><\/c>/);
  });

  it('keeps awkward text intact and safe', () => {
    const shared = text('xl/sharedStrings.xml');
    expect(shared).toContain('a &amp; b &lt;c&gt;');
    expect(shared).toContain('Thrift &quot;Haul&quot;');
  });

  it('names the sheets in the chosen language', () => {
    const zh = unzipSync(buildWorkbook(rep, { t: makeT('zh'), now: NOW }));
    const wb = strFromU8(zh['xl/workbook.xml']);
    expect(wb).toContain('name="摘要"');
    expect(wb).not.toContain('name="Summary"');
    const es = unzipSync(buildWorkbook(rep, { t: makeT('es'), now: NOW }));
    expect(strFromU8(es['xl/workbook.xml'])).not.toContain('name="Summary"');
  });

  it('copes with an empty month', () => {
    const empty = unzipSync(buildWorkbook(base(), { t, now: NOW }));
    expect(strFromU8(empty['xl/sharedStrings.xml'])).toContain('No buys this month.');
    expect(strFromU8(empty['xl/worksheets/sheet1.xml'])).toContain("<f>SUM('Purchases'!$G$3:$G$3)</f>");
  });
});
