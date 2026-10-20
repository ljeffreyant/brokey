import { useMemo } from 'react';
import { LangId } from '../core/types';
import { useStore } from '../store';
import { Key, en } from './en';
import { T, makeT } from './translate';

export type { Key } from './en';
export * from './translate';

export function useT(): T {
  const lang = useStore((s) => s.settings.language);
  return useMemo(() => makeT(lang), [lang]);
}

export const useLang = (): LangId => useStore((s) => s.settings.language);

/** Label for a category: translated for built-ins, as typed for custom ones. */
export function catLabel(t: T, meta: { id: string; label: string; builtin?: boolean }): string {
  if (!meta.builtin) return meta.label;
  const k = `cat.${meta.id}` as Key;
  return k in en ? t(k) : meta.label;
}

export function groupLabel(t: T, id: string): string {
  return t(`group.${id}` as Key);
}

export function groupBlurb(t: T, id: string): string {
  return t(`group.${id}.blurb` as Key);
}

