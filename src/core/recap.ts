import { GROUPS, categoryMeta, groupOf } from './categories';
import { formatMoney, formatUnits } from './money';
import { addDays } from './week';
import type { CategoryId, GroupId, Purchase, RoastLevel, UnitDef } from './types';

export interface CategoryTotal {
  category: CategoryId;
  cents: number;
  count: number;
}

export interface GroupTotal {
  group: GroupId;
  cents: number;
  count: number;
  /** share of total spend, 0..1 */
  share: number;
}

export interface Recap {
  weekStart: number;
  spentCents: number;
  budgetCents: number;
  count: number;
  byCategory: CategoryTotal[];
  byGroup: GroupTotal[];
  topCategory: CategoryTotal | null;
  biggest: Purchase | null;
  underBudget: boolean;
  /** budget minus spent; negative when over */
  leftCents: number;
}

export function buildRecap(purchases: Purchase[], weekStart: number, budgetCents: number): Recap {
  const end = addDays(weekStart, 7);
  const week = purchases.filter((p) => p.ts >= weekStart && p.ts < end);
  const spentCents = week.reduce((n, p) => n + p.amountCents, 0);
  const cat = new Map<CategoryId, CategoryTotal>();
  for (const p of week) {
    const cur = cat.get(p.category) ?? { category: p.category, cents: 0, count: 0 };
    cur.cents += p.amountCents;
    cur.count += 1;
    cat.set(p.category, cur);
  }
  const byCategory = [...cat.values()].sort((a, b) => b.cents - a.cents);
  const groupMap = new Map<GroupId, GroupTotal>(GROUPS.map((g) => [g.id, { group: g.id, cents: 0, count: 0, share: 0 }]));
  for (const c of byCategory) {
    const g = groupMap.get(groupOf(c.category)) as GroupTotal;
    g.cents += c.cents;
    g.count += c.count;
  }
  const byGroup = GROUPS.map((g) => {
    const t = groupMap.get(g.id) as GroupTotal;
    return { ...t, share: spentCents > 0 ? t.cents / spentCents : 0 };
  });
  const biggest = week.length ? week.reduce((a, b) => (b.amountCents > a.amountCents ? b : a)) : null;
  return {
    weekStart,
    spentCents,
    budgetCents,
    count: week.length,
    byCategory,
    byGroup,
    topCategory: byCategory[0] ?? null,
    biggest,
    underBudget: budgetCents > 0 && spentCents <= budgetCents,
    leftCents: budgetCents - spentCents,
  };
}

/** One-line verdict for the week, in Brokey's voice. */
export function recapVerdict(rc: Recap, level: RoastLevel, unit: UnitDef): string {
  if (rc.count === 0) {
    return level === 'mild'
      ? 'Nothing logged yet. Either you are a saint or you forgot to log.'
      : level === 'medium'
        ? 'Zero logged. Suspicious. Did you actually spend nothing or are you hiding?'
        : 'Zero purchases? Nobody believes that. Log your sins.';
  }
  const top = rc.topCategory ? categoryMeta(rc.topCategory.category).headline : 'stuff';
  const topAmt = rc.topCategory ? formatMoney(rc.topCategory.cents) : '$0';
  if (!rc.underBudget) {
    const over = formatUnits(-rc.leftCents, unit);
    return level === 'mild'
      ? `You went over by ${over}. Mostly ${top}. Next week we go gentler.`
      : level === 'medium'
        ? `Over by ${over}, with ${topAmt} on ${top}. Your future self is annoyed.`
        : `Over by ${over}. ${topAmt} on ${top}. Genuinely a crime scene.`;
  }
  const left = formatUnits(rc.leftCents, unit);
  return level === 'mild'
    ? `Under budget with ${left} spare. Nice work, ${topAmt} on ${top} was your big one.`
    : level === 'medium'
      ? `Under budget with ${left} spare. Do not get cocky, ${top} was still ${topAmt}.`
      : `${left} left over. I am shocked. Do not spend it all on ${top}.`;
}
