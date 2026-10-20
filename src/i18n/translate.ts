import { LangId } from '../core/types';
import { en } from './en';
import { es } from './es';
import { id } from './id';
import { zh } from './zh';

import type { Key } from './en';
type Entry = string | readonly string[];
type Dict = Partial<Record<Key, Entry>>;
type Vars = Record<string, string | number>;

const DICTS: Record<LangId, Dict> = { en, zh, id, es };

export const LANGUAGES: { id: LangId; name: string; native: string }[] = [
  { id: 'en', name: 'English', native: 'English' },
  { id: 'zh', name: 'Chinese', native: '中文' },
  { id: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
  { id: 'es', name: 'Spanish', native: 'Español' },
];

function fill(s: string, vars?: Vars): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

function entry(lang: LangId, key: Key): Entry {
  return DICTS[lang][key] ?? en[key];
}

/** Plain lookup with {placeholders}. Missing translations fall back to English. */
export function translate(lang: LangId, key: Key, vars?: Vars): string {
  const e = entry(lang, key);
  return fill(Array.isArray(e) ? (e as readonly string[])[0] : (e as string), vars);
}

/** Pick one line from a list entry. */
export function translatePick(lang: LangId, key: Key, seed: number, vars?: Vars): string {
  const e = entry(lang, key);
  if (!Array.isArray(e)) return fill(e as string, vars);
  const list = e as readonly string[];
  return fill(list[Math.abs(Math.floor(seed)) % list.length], vars);
}

/** Plural-aware: looks for `${key}.one` when n is 1, else `${key}.other`. */
export function translateN(lang: LangId, key: string, n: number, vars?: Vars): string {
  const k1 = `${key}.one` as Key;
  const k2 = `${key}.other` as Key;
  const k = n === 1 && (k1 in en) ? k1 : k2;
  return translate(lang, k, { n, ...vars });
}

export interface T {
  (key: Key, vars?: Vars): string;
  pick: (key: Key, seed: number, vars?: Vars) => string;
  n: (key: string, n: number, vars?: Vars) => string;
  lang: LangId;
}

export function makeT(lang: LangId): T {
  const t = ((key: Key, vars?: Vars) => translate(lang, key, vars)) as T;
  t.pick = (key, seed, vars) => translatePick(lang, key, seed, vars);
  t.n = (key, n, vars) => translateN(lang, key, n, vars);
  t.lang = lang;
  return t;
}

