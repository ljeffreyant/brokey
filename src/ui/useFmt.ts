import { useEffect, useMemo, useState } from 'react';
import {
  Wallet,
  computeOverview,
  formatMoney,
  formatUnits,
  displayUnit,
  friendlyNumber,
  unitLabel,
  unitsNumber,
} from '../core';
import { useT } from '../i18n';
import { moneyFmt, useStore } from '../store';

/** Every money and unit string in the app comes from here, so currency, decimals and language stay consistent. */
export function useFmt() {
  const settings = useStore((s) => s.settings);
  const t = useT();
  return useMemo(() => {
    const f = moneyFmt(settings);
    const fs = moneyFmt(settings, true);
    const unit = displayUnit(settings.unit, settings.hourlyCents, settings.unitMode);
    const lang = settings.language;
    return {
      unit,
      lang,
      fmt: f,
      money: (cents: number, signed = false) => formatMoney(cents, { fmt: f, sign: signed }),
      /** for totals: rounds when the user asked for rounded summaries */
      sum: (cents: number) => formatMoney(cents, { fmt: fs }),
      hsp: (cents: number) => formatUnits(cents, unit, lang),
      hspNum: (cents: number) => unitsNumber(cents, unit, lang),
      hspLabel: (cents: number) => unitLabel(cents, unit),
      /** the short unit tag next to a big number: "HSP" in HSP mode, nothing in work mode ("35m" says it already) */
      unitTag: (_cents: number) => (unit.id === 'work' ? '' : unit.singular),
      workMode: unit.id === 'work',
      work: (cents: number): string | null => {
        const h = settings.hourlyCents;
        if (!h || h <= 0) return null;
        const hrs = Math.abs(cents) / h;
        if (hrs < 0.1) return t('work.under');
        if (hrs < 1) return t('work.min', { n: Math.round(hrs * 60) });
        return t.n('work.hrs', Math.round(hrs * 10) / 10, { v: friendlyNumber(hrs, lang) });
      },
    };
  }, [settings, t]);
}

/** A clock that re-renders on an interval, for countdowns. */
export function useNow(ms = 30000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

/** The wallet on screen (or the pooled overview) with its budget state. */
export function useBudget() {
  const wallets = useStore((s) => s.wallets);
  const purchases = useStore((s) => s.purchases);
  const settings = useStore((s) => s.settings);
  const now = useNow(60000);
  return useMemo(() => {
    const live = wallets.filter((w) => !w.archived);
    const overview = computeOverview(wallets, settings, purchases, now);
    const wallet: Wallet | null = settings.activeWalletId === 'all' ? null : live.find((w) => w.id === settings.activeWalletId) ?? live[0] ?? null;
    const budget = wallet ? overview.wallets.find((x) => x.wallet.id === wallet.id)?.budget ?? overview.total : overview.total;
    const ids = new Set(wallet ? [wallet.id] : live.map((w) => w.id));
    const mine = purchases.filter((p) => ids.has(p.walletId));
    return { wallet, live, budget, overview, purchases: mine, now, isAll: !wallet };
  }, [wallets, purchases, settings, now]);
}

export function formatClock(ts: number, lang: string): string {
  try {
    return new Date(ts).toLocaleTimeString(lang === 'zh' ? 'zh-CN' : lang, { hour: 'numeric', minute: '2-digit' });
  } catch {
    const d = new Date(ts);
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
}

export function formatDayName(ts: number, lang: string, style: 'long' | 'short' = 'long'): string {
  try {
    return new Date(ts).toLocaleDateString(lang === 'zh' ? 'zh-CN' : lang, { weekday: style });
  } catch {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(ts).getDay()];
  }
}

export function formatDate(ts: number, lang: string): string {
  try {
    return new Date(ts).toLocaleDateString(lang === 'zh' ? 'zh-CN' : lang, { day: 'numeric', month: 'short' });
  } catch {
    const d = new Date(ts);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }
}

export function formatMonth(ts: number, lang: string): string {
  try {
    return new Date(ts).toLocaleDateString(lang === 'zh' ? 'zh-CN' : lang, { month: 'long', year: 'numeric' });
  } catch {
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
}
