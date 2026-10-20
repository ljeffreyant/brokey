import { WeatherId } from '../theme';

/** How the money weather looks for a given amount left. */
export function weatherOf(remainingCents: number, budgetCents: number): WeatherId {
  if (budgetCents <= 0) return 'mild';
  if (remainingCents <= 0) return 'broke';
  const f = remainingCents / budgetCents;
  return f > 0.55 ? 'sunny' : f > 0.25 ? 'mild' : 'tight';
}
