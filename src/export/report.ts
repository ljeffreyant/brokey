import {
  GROUPS,
  GroupId,
  PayMethod,
  Purchase,
  Settings,
  ShameItem,
  UnitDef,
  Wallet,
  WishItem,
  addDays,
  categoryMeta,
  groupOf,
  regretStats,
  startOfDay,
  startOfWeek,
  weeklyPoolCents,
} from '../core';

export interface ReportInput {
  purchases: Purchase[];
  wishes: WishItem[];
  shame: ShameItem[];
  wallets: Wallet[];
  /** a wallet id, or 'all' for every live wallet pooled */
  walletId: string;
  settings: Pick<Settings, 'unit' | 'hourlyCents' | 'weekStartsOn' | 'currency' | 'language'>;
  /** any timestamp inside the month you want */
  month: number;
  now: number;
}

export interface DayRow {
  ts: number;
  cents: number;
  count: number;
}
export interface CategoryRow {
  category: string;
  group: GroupId;
  cents: number;
  count: number;
  nah: number;
  share: number;
}
export interface GroupRow {
  group: GroupId;
  cents: number;
  count: number;
  share: number;
}
export interface WeekRow {
  start: number;
  cents: number;
  count: number;
  budgetCents: number;
}
export interface MerchantRow {
  name: string;
  cents: number;
  count: number;
}
export interface MethodRow {
  method: PayMethod;
  cents: number;
  count: number;
}

export interface Report {
  monthStart: number;
  /** exclusive */
  monthEnd: number;
  daysInMonth: number;
  walletName: string | null;
  currency: string;
  unit: UnitDef;
  hourlyCents: number | null;
  /** what the wallets' weekly budgets add up to over this month */
  budgetCents: number;
  purchases: Purchase[];
  spentCents: number;
  count: number;
  avgCents: number;
  biggest: Purchase | null;
  byDay: DayRow[];
  byCategory: CategoryRow[];
  byGroup: GroupRow[];
  byWeek: WeekRow[];
  byMethod: MethodRow[];
  topMerchants: MerchantRow[];
  busiestDay: DayRow | null;
  zeroDays: number;
  regret: { answered: number; worth: number; meh: number; nah: number; regretCents: number };
  wishes: WishItem[];
  ditchedCents: number;
  ditchedCount: number;
  shame: ShameItem[];
  shameCents: number;
  hsp: number;
  workHours: number | null;
}

export function monthStartOf(ts: number): number {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

export function addMonths(monthStart: number, n: number): number {
  const d = new Date(monthStart);
  return new Date(d.getFullYear(), d.getMonth() + n, 1).getTime();
}

export function buildReport(input: ReportInput): Report {
  const { settings } = input;
  const monthStart = monthStartOf(input.month);
  const monthEnd = addMonths(monthStart, 1);
  const daysInMonth = Math.round((monthEnd - monthStart) / 86400000);
  const live = input.wallets.filter((w) => !w.archived);
  const scope = input.walletId === 'all' ? live : input.wallets.filter((w) => w.id === input.walletId);
  const ids = new Set(scope.map((w) => w.id));
  // archived wallets still count when the whole picture is asked for, so history never goes missing
  const inScope = (id: string) => (input.walletId === 'all' ? true : ids.has(id));

  const purchases = input.purchases.filter((p) => p.ts >= monthStart && p.ts < monthEnd && inScope(p.walletId)).sort((a, b) => a.ts - b.ts);
  const spentCents = purchases.reduce((n, p) => n + p.amountCents, 0);
  const count = purchases.length;
  const weeklyPool = scope.reduce((n, w) => n + weeklyPoolCents(w), 0);
  const budgetCents = Math.round((weeklyPool * daysInMonth) / 7);

  const byDay: DayRow[] = Array.from({ length: daysInMonth }, (_, i) => ({ ts: addDays(monthStart, i), cents: 0, count: 0 }));
  for (const p of purchases) {
    const i = Math.min(daysInMonth - 1, Math.floor((startOfDay(p.ts) - monthStart) / 86400000 + 0.5));
    byDay[i].cents += p.amountCents;
    byDay[i].count += 1;
  }

  const cat = new Map<string, CategoryRow>();
  for (const p of purchases) {
    const cur = cat.get(p.category) ?? { category: p.category, group: groupOf(p.category), cents: 0, count: 0, nah: 0, share: 0 };
    cur.cents += p.amountCents;
    cur.count += 1;
    if (p.regret === 'nah') cur.nah += 1;
    cat.set(p.category, cur);
  }
  const byCategory = [...cat.values()].sort((a, b) => b.cents - a.cents || a.category.localeCompare(b.category)).map((c) => ({ ...c, share: spentCents > 0 ? c.cents / spentCents : 0 }));

  const byGroup: GroupRow[] = GROUPS.map((g) => {
    const rows = byCategory.filter((c) => c.group === g.id);
    const cents = rows.reduce((n, r) => n + r.cents, 0);
    return { group: g.id, cents, count: rows.reduce((n, r) => n + r.count, 0), share: spentCents > 0 ? cents / spentCents : 0 };
  });

  // weeks that touch this month, clipped to the month for the numbers
  const byWeek: WeekRow[] = [];
  let ws = startOfWeek(monthStart, settings.weekStartsOn);
  while (ws < monthEnd) {
    const from = Math.max(ws, monthStart);
    const to = Math.min(addDays(ws, 7), monthEnd);
    const rows = purchases.filter((p) => p.ts >= from && p.ts < to);
    byWeek.push({ start: from, cents: rows.reduce((n, p) => n + p.amountCents, 0), count: rows.length, budgetCents: Math.round((weeklyPool * Math.round((to - from) / 86400000)) / 7) });
    ws = addDays(ws, 7);
  }

  const meth = new Map<PayMethod, MethodRow>();
  for (const p of purchases) {
    const cur = meth.get(p.method) ?? { method: p.method, cents: 0, count: 0 };
    cur.cents += p.amountCents;
    cur.count += 1;
    meth.set(p.method, cur);
  }
  const byMethod = [...meth.values()].sort((a, b) => b.cents - a.cents);

  const mer = new Map<string, MerchantRow>();
  for (const p of purchases) {
    const name = (p.merchant ?? '').trim();
    if (!name) continue;
    const key = name.toLowerCase();
    const cur = mer.get(key) ?? { name, cents: 0, count: 0 };
    cur.cents += p.amountCents;
    cur.count += 1;
    mer.set(key, cur);
  }
  const topMerchants = [...mer.values()].sort((a, b) => b.cents - a.cents).slice(0, 5);

  const biggest = purchases.length ? purchases.reduce((a, b) => (b.amountCents > a.amountCents ? b : a)) : null;
  const busiestDay = byDay.reduce<DayRow | null>((a, d) => (d.cents > 0 && (!a || d.cents > a.cents) ? d : a), null);
  const todayCut = Math.min(monthEnd, startOfDay(input.now) + 86400000);
  const zeroDays = byDay.filter((d) => d.cents === 0 && d.ts < todayCut).length;

  const rs = regretStats(purchases);
  const wishes = input.wishes.filter((w) => inScope(w.walletId ?? 'main') && ((w.createdTs >= monthStart && w.createdTs < monthEnd) || (w.decidedTs != null && w.decidedTs >= monthStart && w.decidedTs < monthEnd)));
  const ditched = wishes.filter((w) => w.status === 'ditched' && (w.decidedTs ?? 0) >= monthStart && (w.decidedTs ?? 0) < monthEnd);
  const shame = input.shame.filter((s) => s.ts >= monthStart && s.ts < monthEnd);

  const price = settings.unit.priceCents;
  return {
    monthStart,
    monthEnd,
    daysInMonth,
    walletName: input.walletId === 'all' ? null : scope[0]?.name ?? null,
    currency: settings.currency,
    unit: settings.unit,
    hourlyCents: settings.hourlyCents,
    budgetCents,
    purchases,
    spentCents,
    count,
    avgCents: count ? Math.round(spentCents / count) : 0,
    biggest,
    byDay,
    byCategory,
    byGroup,
    byWeek,
    byMethod,
    topMerchants,
    busiestDay,
    zeroDays,
    regret: { answered: rs.answered, worth: rs.worth, meh: rs.meh, nah: rs.nah, regretCents: rs.regretCents },
    wishes,
    ditchedCents: ditched.reduce((n, w) => n + w.amountCents, 0),
    ditchedCount: ditched.length,
    shame,
    shameCents: shame.reduce((n, s) => n + s.amountCents, 0),
    hsp: price > 0 ? spentCents / price : 0,
    workHours: settings.hourlyCents && settings.hourlyCents > 0 ? spentCents / settings.hourlyCents : null,
  };
}

/** Name of the category for exports: the translated label for built-ins, as typed for custom ones. */
export function categoryName(id: string, translate?: (meta: ReturnType<typeof categoryMeta>) => string): string {
  const meta = categoryMeta(id);
  return translate ? translate(meta) : meta.label;
}
