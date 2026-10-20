import { describe, expect, it } from 'vitest';
import { RoastCtx, roastFor } from './roasts';
import { MELB_KEYS, melbLines } from './roasts-melb';
import { DEFAULT_UNIT } from './money';
import type { LangId, RoastLevel } from './types';

const LANGS: LangId[] = ['en', 'zh', 'id', 'es'];
const LEVELS: RoastLevel[] = ['mild', 'medium', 'unhinged'];

const ctx = (lang: LangId, over: Partial<RoastCtx> = {}): RoastCtx => ({
  category: 'coffee',
  amountCents: 600,
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
  melbourne: true,
  ...over,
});

describe('Melbourne roast lines', () => {
  it('exist in every language, every level, at least two lines each', () => {
    for (const lang of LANGS) {
      for (const key of MELB_KEYS) {
        for (const lv of LEVELS) expect(melbLines(lang, key, lv).length, `${lang} ${key} ${lv}`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('only use placeholders the engine can fill, and no brand names outside English', () => {
    for (const lang of LANGS) {
      const all = JSON.stringify(MELB_KEYS.map((k) => LEVELS.map((lv) => melbLines(lang, k, lv))));
      const used = new Set([...all.matchAll(/\{([a-z]+)\}/g)].map((m) => m[1]));
      for (const u of used) expect(['amt', 'units', 'n', 'work', 'unit', 'nth', 'noun', 'merchant'], `${lang} {${u}}`).toContain(u);
      if (lang !== 'en') {
        for (const u of used) expect(['amt', 'units', 'n', 'work', 'unit'], `${lang} {${u}}`).toContain(u);
        expect(all).not.toMatch(/maccas|mcdonald|uber|coles|woolies|sephora|twisties|tiktok|netflix|myki|spotify|doordash|apple/i);
      }
    }
  });

  it('are not the English lines when the language is not English', () => {
    const en = new Set(MELB_KEYS.flatMap((k) => LEVELS.flatMap((lv) => melbLines('en', k, lv))));
    for (const lang of LANGS.filter((l) => l !== 'en')) {
      for (const k of MELB_KEYS) for (const lv of LEVELS) for (const l of melbLines(lang, k, lv)) expect(en.has(l)).toBe(false);
    }
  });

  it('get mixed in only when the wallet is Melbourne, and always come out filled', () => {
    for (const lang of LANGS) {
      const seen = new Set<string>();
      for (let seed = 0; seed < 40; seed++) {
        const line = roastFor(ctx(lang, { seed, countThisWeek: 2 }));
        expect(line).not.toMatch(/\{[a-z]+\}/);
        seen.add(line);
      }
      const melb = new Set(LEVELS.flatMap((lv) => melbLines(lang, 'coffee', lv).map((l) => l)));
      const plain = new Set<string>();
      for (let seed = 0; seed < 40; seed++) plain.add(roastFor(ctx(lang, { seed, countThisWeek: 2, melbourne: false })));
      // no Melbourne wording leaks into a non-Melbourne wallet
      const only = melbLines(lang, 'coffee', 'medium').map((l) => l.replace(/\{[a-z]+\}/g, '').slice(0, 8));
      for (const frag of only) for (const line of plain) expect(line.includes(frag) && frag.length > 4).toBe(false);
      expect(melb.size).toBeGreaterThan(0);
      // with the flag on, some line should come from the Melbourne set at the medium level
      const med = new Set(melbLines(lang, 'coffee', 'medium').map((l) => l.replace(/\{[a-z]+\}/g, '')));
      let hit = false;
      for (let seed = 0; seed < 60 && !hit; seed++) {
        const line = roastFor(ctx(lang, { seed, countThisWeek: 2 }));
        for (const m of med) if (m.length > 4 && line.includes(m.slice(0, 6))) hit = true;
      }
      expect(hit, `${lang} never produced a Melbourne line`).toBe(true);
    }
  });

  it('special banks feed over, big, repeat and late roasts', () => {
    for (const lang of LANGS) {
      for (const over of [{ overBudget: true }, { amountCents: 9000 }, { countThisWeek: 4 }, { hour: 2 }]) {
        for (let seed = 0; seed < 12; seed++) expect(roastFor(ctx(lang, { ...over, seed }))).not.toMatch(/\{[a-z]+\}/);
      }
    }
  });
});
