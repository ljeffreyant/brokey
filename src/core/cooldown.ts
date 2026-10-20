import type { CategoryId, ShameItem, WishItem } from './types';
import { uid } from './money';

const HOUR = 60 * 60 * 1000;

/** How long to make you wait. Bigger buys wait longer. */
export function recommendedCoolingHours(amountCents: number): 24 | 48 | 72 {
  if (amountCents < 3000) return 24;
  if (amountCents < 10000) return 48;
  return 72;
}

export function createWish(
  label: string,
  amountCents: number,
  category: CategoryId,
  hours: number,
  now: number,
): WishItem {
  return {
    id: uid(),
    label: label.trim() || 'Something shiny',
    amountCents,
    category,
    createdTs: now,
    unlockTs: now + hours * HOUR,
    status: 'cooling',
  };
}

export type WishPhase = 'cooling' | 'ready' | 'bought' | 'ditched';

export function wishPhase(w: WishItem, now: number): WishPhase {
  if (w.status === 'bought') return 'bought';
  if (w.status === 'ditched') return 'ditched';
  return now >= w.unlockTs ? 'ready' : 'cooling';
}

export function remainingMs(w: WishItem, now: number): number {
  return Math.max(0, w.unlockTs - now);
}

/** "23h 10m", "45m", "now" */
export function formatRemaining(ms: number): string {
  if (ms <= 0) return 'now';
  const totalMin = Math.ceil(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h >= 48) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h > 0) return m ? `${h}h ${m}m` : `${h}h`;
  return `${m}m`;
}

/** 0 at the start of the wait, 1 when it unlocks. */
export function coolingProgress(w: WishItem, now: number): number {
  const total = w.unlockTs - w.createdTs;
  if (total <= 0) return 1;
  return Math.max(0, Math.min(1, (now - w.createdTs) / total));
}

export function totalDitchedCents(wishes: WishItem[]): number {
  return wishes.filter((w) => w.status === 'ditched').reduce((n, w) => n + w.amountCents, 0);
}

const STOP = new Set(['the', 'and', 'for', 'with', 'new', 'from', 'that', 'this', 'some', 'another', 'pair']);

function words(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOP.has(w))
    .map((w) => (w.endsWith('s') ? w.slice(0, -1) : w));
}

/** If what you want sounds like something already on the shame shelf, say so. */
export function findShameMatch(label: string, shelf: ShameItem[]): ShameItem | null {
  const w = new Set(words(label));
  if (w.size === 0) return null;
  for (const item of shelf) {
    for (const x of words(item.label)) if (w.has(x)) return item;
  }
  return null;
}
