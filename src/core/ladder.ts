/**
 * The savings ladder: rungs measured in units (HSPs) of money you talked yourself out of spending.
 * Thresholds follow the unit price, so a $15 HSP climbs a little faster than an $18 one.
 */
export const LADDER = [
  { id: 'side', units: 10 },
  { id: 'mini', units: 50 },
  { id: 'standard', units: 150 },
  { id: 'banquet', units: 500 },
] as const;

export type RungId = (typeof LADDER)[number]['id'];

export interface Rung {
  id: RungId;
  units: number;
  cents: number;
  reached: boolean;
}

export interface LadderState {
  rungs: Rung[];
  /** the next rung to climb, or null at the top */
  next: Rung | null;
  /** 0..1 of the way from the last rung (or zero) to the next one */
  progress: number;
  toGoCents: number;
}

export function ladderState(savedCents: number, unitPriceCents: number): LadderState {
  const price = Math.max(1, unitPriceCents);
  const saved = Math.max(0, savedCents);
  const rungs: Rung[] = LADDER.map((r) => ({ id: r.id, units: r.units, cents: r.units * price, reached: saved >= r.units * price }));
  const next = rungs.find((r) => !r.reached) ?? null;
  const prevCents = [...rungs].reverse().find((r) => r.reached)?.cents ?? 0;
  const progress = next ? Math.min(1, Math.max(0, (saved - prevCents) / (next.cents - prevCents))) : 1;
  return { rungs, next, progress, toGoCents: next ? next.cents - saved : 0 };
}

/** Totals for a list of repeating charges, so the Shelf can say what the whole pile costs. */
export function bleedTotals(items: { monthlyCents: number; yearlyCents: number }[]): { monthlyCents: number; yearlyCents: number } {
  return items.reduce((a, r) => ({ monthlyCents: a.monthlyCents + r.monthlyCents, yearlyCents: a.yearlyCents + r.yearlyCents }), { monthlyCents: 0, yearlyCents: 0 });
}
