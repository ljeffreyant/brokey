import { describe, expect, it } from 'vitest';
import { RoastCtx, roastFor, sampleRoast, wantNudge } from './roasts';
import * as EN from './roasts-en';
import { ES } from './roasts-es';
import { ID } from './roasts-id';
import { ZH } from './roasts-zh';
import { DEFAULT_UNIT } from './money';
import type { LangId, RoastLevel } from './types';

const LANGS: [LangId, typeof ZH][] = [
  ['zh', ZH],
  ['id', ID],
  ['es', ES],
];
const LEVELS: RoastLevel[] = ['mild', 'medium', 'unhinged'];

const ctx = (lang: LangId, over: Partial<RoastCtx> = {}): RoastCtx => ({
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
  lang,
  ...over,
});

describe.each(LANGS)('%s roast banks', (lang, banks) => {
  it('covers every category at every level with at least three lines', () => {
    for (const cat of Object.keys(EN.BASE)) {
      for (const lv of LEVELS) {
        expect(banks.BASE[cat]?.[lv]?.length, `${lang} ${cat} ${lv}`).toBeGreaterThanOrEqual(3);
      }
    }
    for (const name of ['OVER', 'BIG', 'REPEAT', 'LATE', 'WANT'] as const) {
      for (const lv of LEVELS) expect(banks[name][lv].length, `${lang} ${name} ${lv}`).toBeGreaterThanOrEqual(3);
    }
    for (const lv of LEVELS) expect(banks.BNPL[lv].length).toBeGreaterThanOrEqual(1);
  });

  it('only uses placeholders the engine can fill', () => {
    const all = JSON.stringify([banks.BASE, banks.OVER, banks.BIG, banks.REPEAT, banks.LATE, banks.BNPL, banks.WANT]);
    const used = new Set([...all.matchAll(/\{([a-z]+)\}/g)].map((m) => m[1]));
    for (const u of used) expect(['amt', 'units', 'n', 'work', 'unit'], `${lang} uses {${u}}`).toContain(u);
  });

  it('keeps brand names and body jabs out', () => {
    const all = JSON.stringify(banks);
    expect(all).not.toMatch(/maccas|mcdonald|uber|coles|woolies|sephora|twisties|tiktok|netflix|myki|spotify|doordash|apple/i);
    expect(Object.keys(banks.BODY)).toHaveLength(0);
  });

  it('is what roastFor actually returns, with nothing left unfilled', () => {
    for (const cat of Object.keys(EN.BASE)) {
      for (const lv of LEVELS) {
        for (const seed of [0, 1, 2]) {
          const line = roastFor(ctx(lang, { category: cat, level: lv, seed, hourlyCents: seed === 1 ? 2800 : null }));
          expect(line).not.toMatch(/\{[a-z]+\}/);
          expect(line.length).toBeGreaterThan(0);
        }
      }
    }
    expect(roastFor(ctx(lang, { overBudget: true }))).not.toMatch(/\{[a-z]+\}/);
    expect(roastFor(ctx(lang, { amountCents: 9000 }))).not.toMatch(/[a-z]{4,} a few shifts/);
    expect(roastFor(ctx(lang, { countThisWeek: 4 }))).not.toMatch(/\{[a-z]+\}/);
    expect(roastFor(ctx(lang, { hour: 2 }))).not.toMatch(/\{[a-z]+\}/);
    expect(roastFor(ctx(lang, { method: 'bnpl' }))).not.toMatch(/\{[a-z]+\}/);
  });

  it('does not fall back to English lines', () => {
    const english = new Set<string>(Object.values(EN.BASE).flatMap((b) => LEVELS.flatMap((lv) => b[lv])));
    for (const cat of Object.keys(EN.BASE)) {
      for (const lv of LEVELS) for (const l of banks.BASE[cat][lv]) expect(english.has(l)).toBe(false);
    }
    expect(sampleRoast('medium', false, DEFAULT_UNIT, lang)).not.toBe(sampleRoast('medium', false, DEFAULT_UNIT, 'en'));
    expect(wantNudge('medium', 0, lang)).not.toBe(wantNudge('medium', 0, 'en'));
  });
});
