import { describe, expect, it } from 'vitest';
import { en } from './en';
import { es } from './es';
import { id } from './id';
import { makeT } from './translate';
import { zh } from './zh';

type Entry = string | readonly string[];
const LANGS = { zh, id, es } as const;
const EN = en as unknown as Record<string, Entry>;

const list = (e: Entry): string[] => (Array.isArray(e) ? [...(e as readonly string[])] : [e as string]);
const holes = (s: string): string[] => [...new Set([...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))].sort();

describe('translations', () => {
  for (const [code, dict] of Object.entries(LANGS)) {
    const d = dict as unknown as Record<string, Entry>;

    describe(code, () => {
      it('has every English key', () => {
        const missing = Object.keys(EN).filter((k) => !(k in d));
        expect(missing).toEqual([]);
      });

      it('has no keys English does not know', () => {
        const extra = Object.keys(d).filter((k) => !(k in EN));
        expect(extra).toEqual([]);
      });

      it('keeps lists as lists and strings as strings', () => {
        const bad = Object.keys(EN).filter((k) => k in d && Array.isArray(EN[k]) !== Array.isArray(d[k]));
        expect(bad).toEqual([]);
      });

      it('keeps the same {placeholders}', () => {
        const bad: string[] = [];
        for (const k of Object.keys(EN)) {
          if (!(k in d)) continue;
          const src = list(EN[k]).map(holes);
          // placeholders every English variant uses, and every one any variant may use
          const all = [...new Set(src.flat())].sort();
          const common = all.filter((h) => src.every((s) => s.includes(h)));
          for (const line of list(d[k])) {
            const got = holes(line);
            const unknown = got.filter((h) => !all.includes(h));
            const dropped = common.filter((h) => !got.includes(h));
            if (unknown.length || dropped.length) bad.push(`${k}: ${JSON.stringify(line)} unknown=${unknown} dropped=${dropped}`);
          }
        }
        expect(bad).toEqual([]);
      });

      it('has no empty lines', () => {
        const bad = Object.keys(d).filter((k) => list(d[k]).some((s) => s.trim() === ''));
        expect(bad).toEqual([]);
      });

      it('avoids em dashes and emoji, like the English copy', () => {
        const bad = Object.keys(d).filter((k) => list(d[k]).some((s) => /[—–]|\p{Extended_Pictographic}/u.test(s)));
        expect(bad).toEqual([]);
      });

      it('has both plural forms wherever English does', () => {
        const bad = Object.keys(EN)
          .filter((k) => k.endsWith('.one'))
          .filter((k) => !(k in d) || !(k.replace(/\.one$/, '.other') in d));
        expect(bad).toEqual([]);
      });

      it('keeps spreadsheet sheet names legal and short', () => {
        const names = Object.keys(d).filter((k) => k.startsWith('xl.sheet.'));
        const unique = new Set<string>();
        for (const k of names) {
          const v = d[k] as string;
          expect(v.length).toBeLessThanOrEqual(31);
          expect(v).not.toMatch(/[\\/?*[\]:']/);
          unique.add(v.toLowerCase());
        }
        expect(unique.size).toBe(names.length);
      });

      it('keeps number-format suffixes free of double quotes', () => {
        for (const k of ['xl.perDay', 'xl.each', 'xl.hoursSuffix']) expect(d[k] as string).not.toContain('"');
      });
    });
  }

  it('falls back to English for an unknown language key and reads each language', () => {
    for (const lang of ['en', 'zh', 'id', 'es'] as const) {
      const t = makeT(lang);
      expect(t('export.done').length).toBeGreaterThan(0);
      expect(t('receipt.rate', { unit: 'HSP', price: '$18' })).toContain('HSP');
      expect(t.n('history.count', 1)).toContain('1');
      expect(t.n('history.count', 3)).toContain('3');
    }
  });
});
