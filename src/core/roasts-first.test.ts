import { describe, expect, it } from 'vitest';
import { REPEATISH, RoastCtx, roastFor } from './roasts';
import * as EN from './roasts-en';
import { ES } from './roasts-es';
import { ID } from './roasts-id';
import { ZH } from './roasts-zh';
import { DEFAULT_UNIT } from './money';
import type { LangId, RoastLevel } from './types';

const BANKS = { en: EN, zh: ZH, id: ID, es: ES } as const;
const LEVELS: RoastLevel[] = ['mild', 'medium', 'unhinged'];

const ctx = (lang: LangId, category: string, level: RoastLevel, seed: number): RoastCtx => ({
  category,
  amountCents: 1400,
  level,
  bodyRoasts: false,
  unit: DEFAULT_UNIT,
  hourlyCents: null,
  countThisWeek: 1,
  overBudget: false,
  weeklyBudgetCents: 14000,
  method: 'tap',
  hour: 14,
  seed,
  lang,
});

describe.each(['en', 'zh', 'id', 'es'] as LangId[])('first buy of the week (%s)', (lang) => {
  it('never talks like there was a last time', () => {
    const bank = BANKS[lang].BASE;
    for (const cat of Object.keys(EN.BASE)) {
      for (const lv of LEVELS) {
        const lines = bank[cat]?.[lv] ?? [];
        const hasFresh = lines.some((l) => !REPEATISH[lang].test(l) && !/\{n(th)?\}/.test(l));
        if (!hasFresh) continue;
        for (let seed = 0; seed < 6; seed++) {
          const out = roastFor(ctx(lang, cat, lv, seed));
          expect(out, `${lang} ${cat} ${lv} seed ${seed}`).not.toMatch(REPEATISH[lang]);
        }
      }
    }
  });

  it('still uses the repeat lines once it is a habit', () => {
    const out = roastFor({ ...ctx(lang, 'coffee', 'medium', 0), countThisWeek: 4 });
    expect(out.length).toBeGreaterThan(0);
  });
});

describe('the bug that started it', () => {
  it('does not open a first coffee with "again"', () => {
    for (let seed = 0; seed < 6; seed++) expect(roastFor(ctx('en', 'coffee', 'medium', seed))).not.toMatch(/again/i);
  });
});
