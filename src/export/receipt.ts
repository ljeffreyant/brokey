import { CurrencyCode, GROUPS, formatMoney, formatUnits, friendlyNumber } from '../core';
import type { Key } from '../i18n/en';
import type { T } from '../i18n/translate';
import { Report } from './report';

export interface ReceiptLine {
  name: string;
  qty: string;
  amount: string;
}
export interface ReceiptTotal {
  label: string;
  value: string;
  bold?: boolean;
}
export interface ReceiptModel {
  title: string;
  kicker: string;
  month: string;
  wallet: string;
  header: { item: string; qty: string; amt: string };
  lines: ReceiptLine[];
  empty: string | null;
  totals: ReceiptTotal[];
  extras: ReceiptTotal[];
  stamp: { kind: 'over' | 'under' | 'none'; label: string };
  barcode: number[];
  thanks: string;
}

/** Same input, same bars: a tiny hash so a month always prints the same barcode. */
export function barcodeFor(seedText: string, bars = 46): number[] {
  let h = 2166136261;
  for (let i = 0; i < seedText.length; i++) h = Math.imul(h ^ seedText.charCodeAt(i), 16777619) >>> 0;
  const out: number[] = [];
  for (let i = 0; i < bars; i++) {
    h ^= h << 13; h >>>= 0;
    h ^= h >>> 17;
    h ^= h << 5; h >>>= 0;
    out.push(1 + (h % 3));
  }
  return out;
}

export function buildReceipt(rep: Report, t: T, monthLabel: string): ReceiptModel {
  const lang = t.lang;
  const cur = rep.currency as CurrencyCode;
  const money = (c: number) => formatMoney(c, { fmt: { currency: cur, locale: lang, decimals: 'always' } });
  const left = rep.budgetCents - rep.spentCents;

  const lines: ReceiptLine[] = rep.byGroup
    .filter((g) => g.cents > 0)
    .sort((a, b) => b.cents - a.cents)
    .map((g) => ({ name: t(`group.${g.group}` as Key), qty: `x${g.count}`, amount: money(g.cents) }));

  const totals: ReceiptTotal[] = [{ label: t('receipt.subtotal'), value: money(rep.spentCents), bold: true }];
  const extras: ReceiptTotal[] = [];
  const unit = rep.unit;
  extras.push({ label: t('receipt.rate', { unit: unit.singular, price: money(unit.priceCents) }), value: '' });
  extras.push({ label: t('receipt.eaten', { unit: unit.plural }), value: formatUnits(rep.spentCents, unit, lang).replace(/\s.*$/, ''), bold: true });
  if (rep.workHours != null) extras.push({ label: t('receipt.hours'), value: `${friendlyNumber(rep.workHours, lang)} h` });
  if (rep.budgetCents > 0) {
    extras.push({ label: t('receipt.budget'), value: money(rep.budgetCents) });
    extras.push({ label: left < 0 ? t('receipt.overBy') : t('receipt.underBy'), value: money(Math.abs(left)), bold: true });
  }
  extras.push({ label: t('receipt.noSpend'), value: String(rep.zeroDays) });
  if (rep.regret.answered > 0) extras.push({ label: t('receipt.regret'), value: t('receipt.regretVal', { n: rep.regret.nah, total: rep.regret.answered }) });

  const stamp: ReceiptModel['stamp'] = rep.count === 0 ? { kind: 'none', label: t('receipt.stampNone') } : left < 0 ? { kind: 'over', label: t('receipt.stampOver') } : { kind: 'under', label: t('receipt.stampUnder') };

  return {
    title: t('receipt.title'),
    kicker: t('receipt.kicker'),
    month: monthLabel,
    wallet: rep.walletName ?? t('wallet.all'),
    header: { item: t('receipt.item'), qty: t('receipt.qty'), amt: t('receipt.amt') },
    lines,
    empty: lines.length === 0 ? t('receipt.empty') : null,
    totals,
    extras,
    stamp,
    barcode: barcodeFor(`${rep.monthStart}:${rep.spentCents}:${rep.count}`),
    thanks: t.pick('receipt.thanks', Math.floor(rep.monthStart / 86400000)),
  };
}

