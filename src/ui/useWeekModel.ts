import { useMemo } from 'react';
import { RoastLevel, buildRecap, categoryMeta } from '../core';
import type { Purchase } from '../core';
import type { Mood } from '../art/mascot';
import { catLabel, useT } from '../i18n';
import { useStore } from '../store';
import { useTheme } from '../theme';
import { useFmt } from './useFmt';
import { weatherOf } from './weather';

/** Everything the Week hero and the share card both say about one week: totals, mood, colours and the roast. */
export function useWeekModel(weekStart: number, budgetCents: number, purchases: Purchase[]) {
  const p = useTheme();
  const t = useT();
  const f = useFmt();
  const roastLevel = useStore((s) => s.settings.roastLevel);

  const recap = useMemo(() => buildRecap(purchases, weekStart, budgetCents), [purchases, weekStart, budgetCents]);
  const weather = weatherOf(recap.leftCents, recap.budgetCents);
  const wc = p.weather[weather];
  const over = recap.budgetCents > 0 && recap.spentCents > recap.budgetCents;
  const frac = recap.budgetCents > 0 ? Math.min(1, recap.spentCents / recap.budgetCents) : 0;
  const mood: Mood = recap.count === 0 ? 'ok' : over ? (recap.spentCents > recap.budgetCents * 1.25 ? 'broke' : 'sad') : frac < 0.7 ? 'proud' : 'happy';

  const verdict = useMemo(() => {
    const lv: RoastLevel = roastLevel;
    const seed = Math.floor(weekStart / 86400000);
    const topMeta = recap.topCategory ? categoryMeta(recap.topCategory.category) : null;
    const vars = {
      over: f.hsp(Math.max(0, -recap.leftCents)),
      left: f.hsp(Math.max(0, recap.leftCents)),
      top: topMeta ? catLabel(t, topMeta).toLowerCase() : '',
      topAmt: recap.topCategory ? f.sum(recap.topCategory.cents) : '',
    };
    const k = recap.count === 0 ? 'none' : over || !recap.underBudget ? 'over' : 'under';
    return t.pick(`week.v.${k}.${lv}` as never, seed, vars);
  }, [recap, roastLevel, weekStart, t, f, over]);

  return { recap, weather, wc, over, frac, mood, verdict };
}
