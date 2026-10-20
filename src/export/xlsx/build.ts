import { CurrencyCode, GROUPS, GroupId, PayMethod, Purchase, categoryMeta, currencyDef, groupOf } from '../../core';
import { en } from '../../i18n/en';
import type { Key } from '../../i18n/en';
import type { T } from '../../i18n/translate';
import { Report } from '../report';
import { ChartSpec, Sheet, StyleSpec, Workbook, range, ref, serial, serialDay } from './writer';

const C = {
  ink: '24120A',
  mustard: 'FFD23F',
  cream: 'FFF4D6',
  paper: 'FFFDF6',
  line: 'E6D5B5',
  dim: '7A6650',
  red: 'D8321F',
  redSoft: 'FDE3DE',
  input: '1F4FD8',
  white: 'FFFFFF',
};

export interface BuildOptions {
  t: T;
  now: number;
  /** false leaves formula results out, so a spreadsheet app has to calculate them (tests only) */
  cache?: boolean;
}

const q = (name: string) => `'${name.replace(/'/g, "''")}'`;
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const qs = (s: string) => `"${s.replace(/"/g, '""')}"`;

/** Text used as a SUMIFS or COUNTIFS criterion must not look like a wildcard or an operator. */
export function cleanKey(s: string, max = 60): string {
  return s.replace(/[*?~]/g, ' ').replace(/^[=<>\s]+/, '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function sheetName(s: string): string {
  return s.replace(/[[\]:*?/\\]/g, '-').slice(0, 31) || 'Sheet';
}

function localeOf(lang: string): string {
  return lang === 'zh' ? 'zh-CN' : lang;
}

function monthTitle(ts: number, lang: string): string {
  try {
    return new Date(ts).toLocaleDateString(localeOf(lang), { month: 'long', year: 'numeric' });
  } catch {
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
}

function longDate(ts: number, lang: string): string {
  try {
    return new Date(ts).toLocaleDateString(localeOf(lang), { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return new Date(ts).toISOString().slice(0, 10);
  }
}

function weekday(ts: number, lang: string): string {
  try {
    return new Date(ts).toLocaleDateString(localeOf(lang), { weekday: 'short' });
  } catch {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(ts).getDay()];
  }
}

const REGRET_KEY: Record<string, Key> = { worth: 'regret.worth', meh: 'regret.meh', nah: 'regret.nope' };

export function buildWorkbook(rep: Report, opt: BuildOptions): Uint8Array {
  const { t, now } = opt;
  const lang = t.lang;
  const wb = new Workbook('Arial', 10);
  wb.omitCached = opt.cache === false;
  wb.title = `Brokey ${monthTitle(rep.monthStart, lang)}`;

  // ------------------------------------------------------------ naming
  const S = {
    summary: sheetName(t('xl.sheet.summary')),
    purchases: sheetName(t('xl.sheet.purchases')),
    days: sheetName(t('xl.sheet.days')),
    cats: sheetName(t('xl.sheet.cats')),
    weeks: sheetName(t('xl.sheet.weeks')),
    cool: sheetName(t('xl.sheet.cool')),
    shame: sheetName(t('xl.sheet.shame')),
    about: sheetName(t('xl.sheet.about')),
  };
  const sum = wb.sheet(S.summary);
  const pur = wb.sheet(S.purchases);
  const day = wb.sheet(S.days);
  const cat = wb.sheet(S.cats);
  const wk = wb.sheet(S.weeks);
  const cool = wb.sheet(S.cool);
  const shm = wb.sheet(S.shame);
  const abt = wb.sheet(S.about);
  sum.tab = C.mustard;
  pur.tab = C.ink;
  day.tab = 'B56D36';
  cat.tab = 'EE3B2B';
  wk.tab = '8A4B24';
  cool.tab = '6FB7D8';
  shm.tab = 'C9A27A';
  abt.tab = C.line;

  const unitName = cap(rep.unit.plural);
  const cur = currencyDef(rep.currency as CurrencyCode);
  const sym = cur.symbol.replace(/"/g, '');
  const MONEY = cur.zeroDecimal ? `"${sym}"#,##0;-"${sym}"#,##0` : `"${sym}"#,##0.00;-"${sym}"#,##0.00`;
  const UNITS = '0.0';
  const DATE = 'd mmm yyyy';

  const unitPrice = rep.unit.priceCents / 100;
  const hourly = rep.hourlyCents && rep.hourlyCents > 0 ? rep.hourlyCents / 100 : null;
  const budget = rep.budgetCents / 100;
  const spent = rep.spentCents / 100;

  // unique, criterion-safe labels
  const catIds = [...new Set(rep.purchases.map((p) => p.category))];
  const catLabels = new Map<string, string>();
  const used = new Set<string>();
  for (const id of catIds) {
    const meta = categoryMeta(id);
    const k = `cat.${id}` as Key;
    let label = cleanKey(meta.builtin && k in en ? t(k) : meta.label) || id;
    if (used.has(label.toLowerCase())) label = `${label} (${id})`.slice(0, 60);
    used.add(label.toLowerCase());
    catLabels.set(id, label);
  }
  const catName = (id: string) => catLabels.get(id) ?? cleanKey(categoryMeta(id).label);
  const groupName = (g: GroupId) => t(`group.${g}` as Key);
  const methodName = (m: PayMethod) => t(`method.${m}` as Key);
  const regretName = (p: Purchase) => (p.regret ? t(REGRET_KEY[p.regret]) : '');
  const sourceName = (s: string) => t(`xl.src.${s}` as Key);

  const n = rep.purchases.length;
  const D = rep.daysInMonth;

  // ------------------------------------------------------------ shared looks
  const body: StyleSpec = { size: 10, color: C.ink, v: 'center' };
  const hair: StyleSpec['border'] = { color: C.line, style: 'thin', sides: ['b'] };
  const cell = (extra: StyleSpec = {}): StyleSpec => ({ ...body, border: hair, ...extra });
  const bandStyle: StyleSpec = { bold: true, size: 14, color: C.mustard, fill: C.ink, v: 'center' };
  const headStyle: StyleSpec = { bold: true, size: 9, color: C.mustard, fill: C.ink, v: 'center', h: 'center', wrap: true };
  const headLeft: StyleSpec = { ...headStyle, h: 'left' };
  const totalStyle = (extra: StyleSpec = {}): StyleSpec => ({ ...body, bold: true, fill: C.cream, border: { color: C.ink, style: 'medium', sides: ['t'] }, ...extra });
  const dxfRed = wb.styles.dxf({ color: C.red, fill: C.redSoft, bold: true });
  const dxfRedText = wb.styles.dxf({ color: C.red, bold: true });

  const band = (sh: Sheet, r: number, c1: number, text: string, height = 30) => {
    sh.set(r, 0, text, { ...bandStyle, indent: 1 });
    sh.fillRow(r, 0, c1, bandStyle);
    sh.height(r, height);
  };
  const label = (sh: Sheet, r: number, c0: number, c1: number, text: string, style: StyleSpec) => {
    sh.set(r, c0, text, style);
    for (let c = c0 + 1; c <= c1; c++) sh.blank(r, c, style);
    if (c1 > c0) sh.merge(r, c0, r, c1);
  };

  // ------------------------------------------------------------ Purchases
  const PR = { first: 2, last: Math.max(2, 2 + n - 1) };
  const PCOL = { date: 0, time: 1, day: 2, cat: 3, group: 4, where: 5, amount: 6, units: 7, hours: 8, method: 9, regret: 10, note: 11, roast: 12, source: 13 };
  const pr = (col: number) => `${q(S.purchases)}!${range(PR.first, col, PR.last, col, true)}`;

  band(pur, 0, 13, `${t('xl.sheet.purchases')}`);
  pur.set(0, PCOL.where, t('xl.showing'), { ...bandStyle, size: 9, h: 'right' });
  const amtRng = range(PR.first, PCOL.amount, PR.last, PCOL.amount);
  const unitRng = range(PR.first, PCOL.units, PR.last, PCOL.units);
  const hrsRng = range(PR.first, PCOL.hours, PR.last, PCOL.hours);
  pur.formula(0, PCOL.amount, `SUBTOTAL(109,${amtRng})`, spent, { ...bandStyle, size: 11, numFmt: MONEY, h: 'right' });
  pur.formula(0, PCOL.units, `SUBTOTAL(109,${unitRng})`, rep.hsp, { ...bandStyle, size: 11, numFmt: UNITS, h: 'right' });
  pur.formula(0, PCOL.hours, `SUBTOTAL(109,${hrsRng})`, hourly ? spent / hourly : 0, { ...bandStyle, size: 11, numFmt: '0.0', h: 'right' });

  const heads: [number, string, number][] = [
    [PCOL.date, t('xl.c.date'), 13],
    [PCOL.time, t('xl.c.time'), 10],
    [PCOL.day, t('xl.c.day'), 7],
    [PCOL.cat, t('xl.c.cat'), 18],
    [PCOL.group, t('xl.group'), 10],
    [PCOL.where, t('xl.c.where'), 22],
    [PCOL.amount, t('xl.c.amount'), 12],
    [PCOL.units, unitName, 9],
    [PCOL.hours, t('xl.c.hours'), 10],
    [PCOL.method, t('xl.c.method'), 11],
    [PCOL.regret, t('xl.c.regret'), 12],
    [PCOL.note, t('xl.c.note'), 26],
    [PCOL.roast, t('xl.c.roast'), 48],
    [PCOL.source, t('xl.c.source'), 18],
  ];
  for (const [c, text, w] of heads) {
    pur.set(1, c, text, c >= PCOL.amount && c <= PCOL.hours ? headStyle : headLeft);
    pur.width(c, w);
  }
  pur.height(1, 28);

  rep.purchases.forEach((p, i) => {
    const r = PR.first + i;
    const a = ref(r, PCOL.amount);
    const merchant = cleanKey(p.merchant ?? '');
    pur.set(r, PCOL.date, serialDay(p.ts), cell({ numFmt: DATE, h: 'left' }));
    pur.set(r, PCOL.time, serial(p.ts) - serialDay(p.ts), cell({ numFmt: 'h:mm AM/PM', h: 'left', color: C.dim }));
    pur.set(r, PCOL.day, weekday(p.ts, lang), cell({ color: C.dim }));
    pur.set(r, PCOL.cat, catName(p.category), cell({ bold: true }));
    pur.set(r, PCOL.group, groupName(groupOf(p.category)), cell({ color: C.dim }));
    pur.set(r, PCOL.where, merchant, cell());
    pur.set(r, PCOL.amount, p.amountCents / 100, cell({ numFmt: MONEY, bold: true }));
    pur.formula(r, PCOL.units, `${a}/UnitPrice`, p.amountCents / 100 / unitPrice, cell({ numFmt: UNITS, color: C.dim, h: 'center' }));
    pur.formula(r, PCOL.hours, `IF(HourlyPay>0,${a}/HourlyPay,"")`, hourly ? p.amountCents / 100 / hourly : '', cell({ numFmt: '0.0', color: C.dim, h: 'center' }));
    pur.set(r, PCOL.method, methodName(p.method), cell());
    pur.set(r, PCOL.regret, regretName(p), cell());
    pur.set(r, PCOL.note, p.note ?? '', cell());
    pur.set(r, PCOL.roast, p.roast ?? '', cell({ color: C.dim, italic: true }));
    pur.set(r, PCOL.source, sourceName(p.source), cell({ color: C.dim }));
  });
  if (n === 0) pur.set(PR.first, PCOL.cat, t('xl.noPurchases'), cell({ italic: true, color: C.dim }));
  pur.freeze = { rows: 2, cols: 0 };
  pur.filter = range(1, 0, PR.last, 13);
  pur.dataBar(amtRng, 'FFD23F');
  pur.landscape = true;
  if (n > 0) {
    pur.when(range(PR.first, PCOL.regret, PR.last, PCOL.regret), `${ref(PR.first, PCOL.regret)}=${qs(t('regret.nope'))}`, dxfRedText);
  }

  // ------------------------------------------------------------ Summary
  const SUM = {
    unitPrice: 9,
    hourly: 10,
    budget: 11,
    days: 12,
  };
  const sRef = (r: number, c: number) => `${q(S.summary)}!${ref(r, c, true)}`;
  wb.defineName('UnitPrice', sRef(SUM.unitPrice, 5));
  wb.defineName('HourlyPay', sRef(SUM.hourly, 5));
  wb.defineName('MonthBudget', sRef(SUM.budget, 5));
  wb.defineName('DaysInMonth', sRef(SUM.days, 5));
  wb.defineName('TotalSpent', sRef(5, 1));
  wb.defineName('BuyCount', sRef(5, 7));

  sum.width(0, 2);
  for (let c = 1; c <= 10; c++) sum.width(c, 13.5);
  sum.height(0, 8);

  const monthName = monthTitle(rep.monthStart, lang);
  const walletName = rep.walletName ?? t('wallet.all');
  label(sum, 1, 1, 10, t('xl.title', { month: monthName }), { bold: true, size: 22, color: C.mustard, fill: C.ink, v: 'center', indent: 1 });
  sum.height(1, 46);
  label(sum, 2, 1, 10, t('xl.sub', { wallet: walletName, currency: rep.currency }), { size: 10, color: C.cream, fill: C.ink, v: 'center', indent: 1 });
  sum.height(2, 22);
  sum.height(3, 12);

  // tiles
  const tile = (c: number, head: string, f: string, cached: number | string, fmt: string, fill: string, subF: string, subCached: number | string, subFmt: string) => {
    const edge = { color: C.ink, style: 'medium' as const };
    const sides = (l: boolean, top: boolean, bottom: boolean) => ({ ...edge, sides: [l ? 'l' : 'r', ...(top ? ['t'] : []), ...(bottom ? ['b'] : [])] as ('l' | 'r' | 't' | 'b')[] });
    const mk = (extra: StyleSpec, l: boolean, top: boolean, bottom: boolean): StyleSpec => ({ fill, h: 'center', v: 'center', color: C.ink, border: sides(l, top, bottom), ...extra });
    // row 4: label
    sum.set(4, c, head, mk({ size: 9, bold: true }, true, true, false));
    sum.blank(4, c + 1, mk({ size: 9, bold: true }, false, true, false));
    // row 5: value
    sum.formula(5, c, f, cached, mk({ size: 18, bold: true, numFmt: fmt }, true, false, false));
    sum.blank(5, c + 1, mk({ size: 18, bold: true, numFmt: fmt }, false, false, false));
    // row 6: sub
    sum.formula(6, c, subF, subCached, mk({ size: 9, color: C.dim, numFmt: subFmt }, true, false, true));
    sum.blank(6, c + 1, mk({ size: 9, color: C.dim, numFmt: subFmt }, false, false, true));
    sum.merge(4, c, 4, c + 1).merge(5, c, 5, c + 1).merge(6, c, 6, c + 1);
  };
  sum.height(4, 20).height(5, 38).height(6, 20);
  const perDay = D > 0 ? budget / D : 0;
  const left = budget - spent;
  tile(1, t('xl.spent').toUpperCase(), `SUM(${pr(PCOL.amount)})`, spent, MONEY, C.mustard, 'TotalSpent/UnitPrice', rep.hsp, `${UNITS}" ${rep.unit.plural}"`);
  tile(3, t('xl.budget').toUpperCase(), 'MonthBudget', budget, MONEY, C.paper, 'IF(DaysInMonth>0,MonthBudget/DaysInMonth,0)', perDay, `"${sym}"0.00" ${t('xl.perDay')}"`);
  tile(5, t('xl.left').toUpperCase(), 'MonthBudget-TotalSpent', left, MONEY, C.paper, '(MonthBudget-TotalSpent)/UnitPrice', left / unitPrice, `${UNITS}" ${rep.unit.plural}";-${UNITS}" ${rep.unit.plural}"`);
  tile(7, t('xl.buys').toUpperCase(), `COUNT(${pr(PCOL.amount)})`, n, '0', C.paper, 'IF(BuyCount=0,0,TotalSpent/BuyCount)', n ? spent / n : 0, `"${sym}"0.00" ${t('xl.each')}"`);
  tile(9, unitName.toUpperCase(), 'TotalSpent/UnitPrice', rep.hsp, UNITS, C.cream, 'IF(HourlyPay>0,TotalSpent/HourlyPay,"")', hourly ? spent / hourly : '', `0.0" ${t('xl.hoursSuffix')}"`);
  sum.when(range(4, 5, 6, 6), '$F$6<0', dxfRed);
  sum.height(7, 14);

  const section = (sh: Sheet, r: number, c0: number, c1: number, text: string) => {
    label(sh, r, c0, c1, text.toUpperCase(), { bold: true, size: 10, color: C.ink, v: 'bottom', border: { color: C.ink, style: 'medium', sides: ['b'] } });
    sh.height(r, 24);
  };

  // inputs
  section(sum, 8, 1, 10, t('xl.inputs'));
  const inputStyle: StyleSpec = { bold: true, color: C.input, fill: C.cream, h: 'right', v: 'center', border: { color: C.ink, style: 'thin' } };
  const labStyle: StyleSpec = { ...body, border: hair };
  const hint: StyleSpec = { ...body, color: C.dim, italic: true, border: hair, indent: 1, h: 'left' };
  const inputRow = (r: number, text: string, value: number | null, fmt: string, hintText = '') => {
    label(sum, r, 1, 4, text, labStyle);
    sum.set(r, 5, value, { ...inputStyle, numFmt: fmt });
    label(sum, r, 6, 10, hintText, hint);
    sum.height(r, 20);
  };
  inputRow(SUM.unitPrice, t('xl.unitPrice', { unit: rep.unit.singular }), unitPrice, MONEY);
  inputRow(SUM.hourly, t('xl.hourly'), hourly, MONEY, t('xl.hourlyHint'));
  inputRow(SUM.budget, t('xl.monthBudget'), budget, MONEY);
  label(sum, SUM.days, 1, 4, t('xl.daysInMonth'), labStyle);
  sum.formula(SUM.days, 5, `COUNT(${q(S.days)}!${range(2, 0, 2 + D - 1, 0, true)})`, D, { ...body, bold: true, h: 'right', border: hair, numFmt: '0' });
  label(sum, SUM.days, 6, 10, '', hint);
  sum.height(SUM.days, 20);
  sum.height(13, 14);

  // highlights
  section(sum, 14, 1, 10, t('xl.highlights'));
  const hl = (r: number, text: string) => {
    label(sum, r, 1, 4, text, labStyle);
    sum.height(r, 20);
  };
  const dRng = (col: number) => `${q(S.days)}!${range(2, col, 2 + D - 1, col, true)}`;
  const val: StyleSpec = { ...body, bold: true, h: 'right', border: hair };
  const det: StyleSpec = { ...body, color: C.dim, border: hair, indent: 1, h: 'left' };

  hl(15, t('xl.avg'));
  sum.formula(15, 5, 'IF(BuyCount=0,0,TotalSpent/BuyCount)', n ? spent / n : 0, { ...val, numFmt: MONEY });
  label(sum, 15, 6, 10, '', det);

  hl(16, t('xl.biggest'));
  const big = rep.biggest;
  sum.formula(16, 5, `MAX(${pr(PCOL.amount)})`, big ? big.amountCents / 100 : 0, { ...val, numFmt: MONEY });
  {
    const m = `MATCH($F$17,${pr(PCOL.amount)},0)`;
    const f = `IFERROR(INDEX(${pr(PCOL.cat)},${m})&IF(INDEX(${pr(PCOL.where)},${m})="",""," · "&INDEX(${pr(PCOL.where)},${m})),"")`;
    const cached = big ? catName(big.category) + (cleanKey(big.merchant ?? '') ? ` · ${cleanKey(big.merchant ?? '')}` : '') : '';
    sum.formula(16, 6, f, cached, det);
    for (let c = 7; c <= 10; c++) sum.blank(16, c, det);
    sum.merge(16, 6, 16, 10);
  }

  hl(17, t('xl.busiest'));
  const bd = rep.busiestDay;
  sum.formula(17, 5, `MAX(${dRng(2)})`, bd ? bd.cents / 100 : 0, { ...val, numFmt: MONEY });
  {
    const f = `IF($F$18=0,"",INDEX(${dRng(0)},MATCH($F$18,${dRng(2)},0)))`;
    sum.formula(17, 6, f, bd ? serialDay(bd.ts) : '', { ...det, numFmt: 'dddd d mmmm', h: 'left' });
    for (let c = 7; c <= 10; c++) sum.blank(17, c, det);
    sum.merge(17, 6, 17, 10);
  }

  hl(18, t('xl.zeroDays'));
  sum.formula(18, 5, `COUNTIFS(${dRng(0)},"<="&TODAY(),${dRng(2)},0)`, rep.zeroDays, { ...val, numFmt: '0' });
  label(sum, 18, 6, 10, '', det);
  sum.height(19, 14);

  // where it went
  section(sum, 20, 1, 10, t('xl.where'));
  label(sum, 21, 1, 2, t('xl.group'), headLeft);
  sum.set(21, 3, t('xl.spent'), headStyle).set(21, 4, t('xl.buys'), headStyle).set(21, 5, t('xl.share'), headStyle);
  sum.height(21, 22);
  const G0 = 22;
  const groupSpent: number[] = [];
  GROUPS.forEach((g, i) => {
    const r = G0 + i;
    const row = rep.byGroup.find((x) => x.group === g.id);
    const gc = (row?.cents ?? 0) / 100;
    groupSpent.push(gc);
    label(sum, r, 1, 2, groupName(g.id), cell({ bold: true }));
    sum.formula(r, 3, `SUMIFS(${pr(PCOL.amount)},${pr(PCOL.group)},$B${r + 1})`, gc, cell({ numFmt: MONEY }));
    sum.formula(r, 4, `COUNTIFS(${pr(PCOL.group)},$B${r + 1})`, row?.count ?? 0, cell({ numFmt: '0', h: 'center' }));
    sum.formula(r, 5, `IF(TotalSpent=0,0,D${r + 1}/TotalSpent)`, row?.share ?? 0, cell({ numFmt: '0%', h: 'center' }));
    sum.height(r, 20);
  });
  {
    const r = G0 + GROUPS.length;
    label(sum, r, 1, 2, t('xl.total'), totalStyle());
    sum.formula(r, 3, `SUM(D${G0 + 1}:D${r})`, spent, totalStyle({ numFmt: MONEY }));
    sum.formula(r, 4, `SUM(E${G0 + 1}:E${r})`, n, totalStyle({ numFmt: '0', h: 'center' }));
    sum.formula(r, 5, `SUM(F${G0 + 1}:F${r})`, spent > 0 ? 1 : 0, totalStyle({ numFmt: '0%', h: 'center' }));
    sum.height(r, 22);
  }
  const pie: ChartSpec = {
    kind: 'pie',
    title: t('xl.where'),
    legend: true,
    anchor: { c0: 6, r0: 21, c1: 11, r1: 35, pad: 150000 },
    series: [
      {
        name: t('xl.spent'),
        valuesRef: `${q(S.summary)}!${range(G0, 3, G0 + GROUPS.length - 1, 3, true)}`,
        catsRef: `${q(S.summary)}!${range(G0, 1, G0 + GROUPS.length - 1, 1, true)}`,
        values: groupSpent,
        cats: GROUPS.map((g) => groupName(g.id)),
        colors: GROUPS.map((g) => g.color.replace('#', '')),
      },
    ],
  };
  sum.addChart(pie);
  sum.height(28, 14);

  // regret check
  section(sum, 29, 1, 5, t('xl.regretTitle'));
  const rg = rep.regret;
  const regLine = (r: number, text: string, f: string, cached: number, fmt = '0') => {
    label(sum, r, 1, 4, text, labStyle);
    sum.formula(r, 5, f, cached, { ...val, numFmt: fmt });
    sum.height(r, 20);
  };
  regLine(30, t('xl.answered'), 'SUM(F32:F34)', rg.answered);
  regLine(31, t('regret.worth'), `COUNTIF(${pr(PCOL.regret)},$B32)`, rg.worth);
  regLine(32, t('regret.meh'), `COUNTIF(${pr(PCOL.regret)},$B33)`, rg.meh);
  regLine(33, t('regret.nope'), `COUNTIF(${pr(PCOL.regret)},$B34)`, rg.nah);
  regLine(34, t('xl.regretMoney'), `SUMIF(${pr(PCOL.regret)},$B34,${pr(PCOL.amount)})`, rg.regretCents / 100, MONEY);
  sum.height(35, 14);

  // top places
  section(sum, 36, 1, 10, t('xl.topPlaces'));
  label(sum, 37, 1, 4, t('xl.place'), headLeft);
  sum.set(37, 5, t('xl.spent'), headStyle).set(37, 6, t('xl.buys'), headStyle);
  sum.height(37, 22);
  if (rep.topMerchants.length === 0) {
    label(sum, 38, 1, 6, '-', cell({ color: C.dim }));
  }
  rep.topMerchants.forEach((m, i) => {
    const r = 38 + i;
    const nm = cleanKey(m.name);
    label(sum, r, 1, 4, nm, cell({ bold: true }));
    sum.formula(r, 5, `SUMIFS(${pr(PCOL.amount)},${pr(PCOL.where)},$B${r + 1})`, m.cents / 100, cell({ numFmt: MONEY }));
    sum.formula(r, 6, `COUNTIFS(${pr(PCOL.where)},$B${r + 1})`, m.count, cell({ numFmt: '0', h: 'center' }));
    sum.height(r, 20);
  });

  // ------------------------------------------------------------ By day
  const DY = { first: 2, last: 2 + D - 1 };
  band(day, 0, 6, t('xl.sheet.days'));
  const dh: [number, string, number][] = [
    [0, t('xl.c.date'), 13],
    [1, t('xl.c.day'), 8],
    [2, t('xl.spent'), 13],
    [3, t('xl.c.count'), 8],
    [4, unitName, 9],
    [5, t('xl.c.running'), 14],
    [6, t('xl.c.pace'), 14],
  ];
  for (const [c, text, w] of dh) {
    day.set(1, c, text, c < 2 ? headLeft : headStyle);
    day.width(c, w);
  }
  day.height(1, 28);
  let running = 0;
  const dayCents: number[] = [];
  const dayDates: number[] = [];
  rep.byDay.forEach((d, i) => {
    const r = DY.first + i;
    const a = ref(r, 0);
    running += d.cents / 100;
    dayCents.push(d.cents / 100);
    dayDates.push(serialDay(d.ts));
    day.set(r, 0, serialDay(d.ts), cell({ numFmt: DATE, h: 'left' }));
    day.set(r, 1, weekday(d.ts, lang), cell({ color: C.dim }));
    day.formula(r, 2, `SUMIFS(${pr(PCOL.amount)},${pr(PCOL.date)},${a})`, d.cents / 100, cell({ numFmt: MONEY, bold: true }));
    day.formula(r, 3, `COUNTIFS(${pr(PCOL.date)},${a})`, d.count, cell({ numFmt: '0;;', h: 'center' }));
    day.formula(r, 4, `${ref(r, 2)}/UnitPrice`, d.cents / 100 / unitPrice, cell({ numFmt: UNITS + ';;', color: C.dim, h: 'center' }));
    day.formula(r, 5, `SUM(${ref(DY.first, 2, true)}:${ref(r, 2)})`, running, cell({ numFmt: MONEY }));
    day.formula(r, 6, `MonthBudget*(${a}-${ref(DY.first, 0, true)}+1)/DaysInMonth`, (budget * (i + 1)) / D, cell({ numFmt: MONEY, color: C.dim }));
  });
  {
    const r = DY.last + 1;
    const rr = (c: number) => range(DY.first, c, DY.last, c);
    day.set(r, 0, t('xl.total'), totalStyle());
    day.blank(r, 1, totalStyle());
    day.formula(r, 2, `SUM(${rr(2)})`, spent, totalStyle({ numFmt: MONEY }));
    day.formula(r, 3, `SUM(${rr(3)})`, n, totalStyle({ numFmt: '0', h: 'center' }));
    day.formula(r, 4, `SUM(${rr(4)})`, rep.hsp, totalStyle({ numFmt: UNITS }));
    day.blank(r, 5, totalStyle());
    day.blank(r, 6, totalStyle());
    day.height(r, 22);
  }
  day.freeze = { rows: 2, cols: 0 };
  day.dataBar(range(DY.first, 2, DY.last, 2), 'FFD23F');
  day.when(range(DY.first, 5, DY.last, 5), `${ref(DY.first, 5)}>${ref(DY.first, 6)}`, dxfRedText);
  day.addChart({
    kind: 'column',
    title: t('xl.spent'),
    anchor: { c0: 8, r0: 1, c1: 19, r1: 20 },
    series: [{ name: t('xl.spent'), valuesRef: `${q(S.days)}!${range(DY.first, 2, DY.last, 2, true)}`, catsRef: `${q(S.days)}!${range(DY.first, 0, DY.last, 0, true)}`, values: dayCents, cats: dayDates, catsFormat: 'd', colors: [C.mustard], numFmt: MONEY }],
  });

  // ------------------------------------------------------------ By category
  const K = rep.byCategory.length;
  const CY = { first: 2, last: 2 + K - 1, total: 2 + K };
  band(cat, 0, 7, t('xl.sheet.cats'));
  const ch: [number, string, number][] = [
    [0, t('xl.c.cat'), 22],
    [1, t('xl.group'), 11],
    [2, t('xl.spent'), 13],
    [3, t('xl.c.count'), 8],
    [4, t('xl.share'), 9],
    [5, unitName, 9],
    [6, t('xl.c.avg'), 12],
    [7, t('xl.c.nah'), 10],
  ];
  for (const [c, text, w] of ch) {
    cat.set(1, c, text, c < 2 ? headLeft : headStyle);
    cat.width(c, w);
  }
  cat.height(1, 28);
  if (K === 0) {
    cat.set(2, 0, t('xl.noPurchases'), cell({ italic: true, color: C.dim }));
  } else {
    rep.byCategory.forEach((row, i) => {
      const r = CY.first + i;
      const a = ref(r, 0);
      const c = row.cents / 100;
      cat.set(r, 0, catName(row.category), cell({ bold: true }));
      cat.set(r, 1, groupName(row.group), cell({ color: C.dim }));
      cat.formula(r, 2, `SUMIFS(${pr(PCOL.amount)},${pr(PCOL.cat)},${a})`, c, cell({ numFmt: MONEY, bold: true }));
      cat.formula(r, 3, `COUNTIFS(${pr(PCOL.cat)},${a})`, row.count, cell({ numFmt: '0', h: 'center' }));
      cat.formula(r, 4, `IF(${ref(CY.total, 2, true)}=0,0,${ref(r, 2)}/${ref(CY.total, 2, true)})`, row.share, cell({ numFmt: '0%', h: 'center' }));
      cat.formula(r, 5, `${ref(r, 2)}/UnitPrice`, c / unitPrice, cell({ numFmt: UNITS, color: C.dim, h: 'center' }));
      cat.formula(r, 6, `IF(${ref(r, 3)}=0,0,${ref(r, 2)}/${ref(r, 3)})`, row.count ? c / row.count : 0, cell({ numFmt: MONEY }));
      cat.formula(r, 7, `COUNTIFS(${pr(PCOL.cat)},${a},${pr(PCOL.regret)},${qs(t('regret.nope'))})`, row.nah, cell({ numFmt: '0;;', h: 'center' }));
    });
    const r = CY.total;
    const rr = (c: number) => range(CY.first, c, CY.last, c);
    cat.set(r, 0, t('xl.total'), totalStyle());
    cat.blank(r, 1, totalStyle());
    cat.formula(r, 2, `SUM(${rr(2)})`, spent, totalStyle({ numFmt: MONEY }));
    cat.formula(r, 3, `SUM(${rr(3)})`, n, totalStyle({ numFmt: '0', h: 'center' }));
    cat.formula(r, 4, `SUM(${rr(4)})`, spent > 0 ? 1 : 0, totalStyle({ numFmt: '0%', h: 'center' }));
    cat.formula(r, 5, `SUM(${rr(5)})`, rep.hsp, totalStyle({ numFmt: UNITS }));
    cat.blank(r, 6, totalStyle());
    cat.formula(r, 7, `SUM(${rr(7)})`, rep.byCategory.reduce((a, b) => a + b.nah, 0), totalStyle({ numFmt: '0;;', h: 'center' }));
    cat.dataBar(range(CY.first, 2, CY.last, 2), 'FFD23F');
    const top = rep.byCategory.slice(0, 8);
    cat.addChart({
      kind: 'bar',
      title: t('xl.sheet.cats'),
      anchor: { c0: 9, r0: 1, c1: 19, r1: 20 },
      series: [
        {
          name: t('xl.spent'),
          valuesRef: `${q(S.cats)}!${range(CY.first, 2, CY.first + top.length - 1, 2, true)}`,
          catsRef: `${q(S.cats)}!${range(CY.first, 0, CY.first + top.length - 1, 0, true)}`,
          values: top.map((x) => x.cents / 100),
          cats: top.map((x) => catName(x.category)),
          colors: [C.mustard],
          numFmt: MONEY,
        },
      ],
    });
  }
  cat.freeze = { rows: 2, cols: 0 };

  // ------------------------------------------------------------ Weeks
  const W = rep.byWeek.length;
  const WK = { first: 2, last: 2 + W - 1 };
  band(wk, 0, 6, t('xl.sheet.weeks'));
  const wh: [number, string, number][] = [
    [0, t('xl.c.from'), 13],
    [1, t('xl.c.to'), 13],
    [2, t('xl.spent'), 13],
    [3, t('xl.budget'), 13],
    [4, t('xl.c.left'), 13],
    [5, t('xl.c.count'), 8],
    [6, t('xl.c.status'), 11],
  ];
  for (const [c, text, w] of wh) {
    wk.set(1, c, text, c < 2 ? headLeft : headStyle);
    wk.width(c, w);
  }
  wk.height(1, 28);
  const weekSpent: number[] = [];
  const weekBudget: number[] = [];
  const weekFrom: number[] = [];
  rep.byWeek.forEach((w, i) => {
    const r = WK.first + i;
    const fromS = serialDay(w.start);
    const toS = Math.round(fromS + (Math.round((nextStart(rep, i) - w.start) / 86400000) - 1));
    const days = toS - fromS + 1;
    const wb2 = Math.round(((budget * days) / D) * 100) / 100;
    const sp = w.cents / 100;
    weekSpent.push(sp);
    weekBudget.push(wb2);
    weekFrom.push(fromS);
    wk.set(r, 0, fromS, cell({ numFmt: DATE, h: 'left', bold: true }));
    wk.set(r, 1, toS, cell({ numFmt: DATE, h: 'left', color: C.dim }));
    wk.formula(r, 2, `SUMIFS(${pr(PCOL.amount)},${pr(PCOL.date)},">="&${ref(r, 0)},${pr(PCOL.date)},"<="&${ref(r, 1)})`, sp, cell({ numFmt: MONEY, bold: true }));
    wk.formula(r, 3, `ROUND(MonthBudget*(${ref(r, 1)}-${ref(r, 0)}+1)/DaysInMonth,2)`, wb2, cell({ numFmt: MONEY, color: C.dim }));
    wk.formula(r, 4, `${ref(r, 3)}-${ref(r, 2)}`, wb2 - sp, cell({ numFmt: MONEY }));
    wk.formula(r, 5, `COUNTIFS(${pr(PCOL.date)},">="&${ref(r, 0)},${pr(PCOL.date)},"<="&${ref(r, 1)})`, w.count, cell({ numFmt: '0', h: 'center' }));
    wk.formula(r, 6, `IF(${ref(r, 2)}>${ref(r, 3)},${qs(t('xl.wk.over'))},${qs(t('xl.wk.under'))})`, sp > wb2 ? t('xl.wk.over') : t('xl.wk.under'), cell({ h: 'center', bold: true }));
  });
  wk.when(range(WK.first, 4, WK.last, 4), `${ref(WK.first, 4)}<0`, dxfRedText);
  wk.when(range(WK.first, 6, WK.last, 6), `${ref(WK.first, 2)}>${ref(WK.first, 3)}`, dxfRedText);
  {
    const r = WK.last + 1;
    const rr = (c: number) => range(WK.first, c, WK.last, c);
    wk.set(r, 0, t('xl.total'), totalStyle());
    wk.blank(r, 1, totalStyle());
    wk.formula(r, 2, `SUM(${rr(2)})`, spent, totalStyle({ numFmt: MONEY }));
    wk.formula(r, 3, `SUM(${rr(3)})`, weekBudget.reduce((a, b) => a + b, 0), totalStyle({ numFmt: MONEY }));
    wk.formula(r, 4, `SUM(${rr(4)})`, weekBudget.reduce((a, b) => a + b, 0) - spent, totalStyle({ numFmt: MONEY }));
    wk.formula(r, 5, `SUM(${rr(5)})`, n, totalStyle({ numFmt: '0', h: 'center' }));
    wk.blank(r, 6, totalStyle());
    wk.height(r, 22);
  }
  wk.freeze = { rows: 2, cols: 0 };
  wk.addChart({
    kind: 'column',
    title: `${t('xl.spent')} / ${t('xl.budget')}`,
    legend: true,
    anchor: { c0: 8, r0: 1, c1: 18, r1: 18 },
    series: [
      { name: t('xl.spent'), valuesRef: `${q(S.weeks)}!${range(WK.first, 2, WK.last, 2, true)}`, catsRef: `${q(S.weeks)}!${range(WK.first, 0, WK.last, 0, true)}`, values: weekSpent, cats: weekFrom, catsFormat: 'd mmm', colors: [C.mustard], numFmt: MONEY },
      { name: t('xl.budget'), valuesRef: `${q(S.weeks)}!${range(WK.first, 3, WK.last, 3, true)}`, catsRef: `${q(S.weeks)}!${range(WK.first, 0, WK.last, 0, true)}`, values: weekBudget, cats: weekFrom, catsFormat: 'd mmm', colors: [C.line], numFmt: MONEY },
    ],
  });

  // ------------------------------------------------------------ Cooling off
  const WS = rep.wishes.slice().sort((a, b) => a.createdTs - b.createdTs);
  const CO = { first: 4, last: Math.max(4, 4 + WS.length - 1) };
  band(cool, 0, 6, t('xl.sheet.cool'));
  const statusText = (s: string) => (s === 'ditched' ? t('cool.ditched') : s === 'bought' ? t('cool.bought') : t('xl.cool.cooling'));
  const ditchedTotal = WS.filter((w) => w.status === 'ditched').reduce((a, w) => a + w.amountCents, 0) / 100;
  label(cool, 1, 0, 2, t('xl.cool.saved'), { ...body, bold: true, size: 11, fill: C.cream, border: { color: C.ink, style: 'medium', sides: ['t', 'b'] } });
  cool.formula(1, 3, `SUMIFS(${range(CO.first, 2, CO.last, 2)},${range(CO.first, 6, CO.last, 6)},${qs(t('cool.ditched'))})`, ditchedTotal, { ...body, bold: true, size: 12, fill: C.mustard, numFmt: MONEY, h: 'right', border: { color: C.ink, style: 'medium', sides: ['t', 'b'] } });
  cool.formula(1, 4, 'D2/UnitPrice', ditchedTotal / unitPrice, { ...body, bold: true, fill: C.mustard, numFmt: `${UNITS}" ${rep.unit.plural}"`, h: 'left', border: { color: C.ink, style: 'medium', sides: ['t', 'b'] }, indent: 1 });
  cool.blank(1, 5, { fill: C.mustard, border: { color: C.ink, style: 'medium', sides: ['t', 'b'] } });
  cool.blank(1, 6, { fill: C.mustard, border: { color: C.ink, style: 'medium', sides: ['t', 'b'] } });
  cool.height(1, 28);
  const oh: [number, string, number][] = [
    [0, t('xl.c.item'), 30],
    [1, t('xl.c.cat'), 18],
    [2, t('xl.c.price'), 13],
    [3, unitName, 9],
    [4, t('xl.c.added'), 13],
    [5, t('xl.c.decided'), 13],
    [6, t('xl.c.status'), 14],
  ];
  for (const [c, text, w] of oh) {
    cool.set(3, c, text, c === 2 || c === 3 ? headStyle : headLeft);
    cool.width(c, w);
  }
  cool.height(3, 26);
  if (WS.length === 0) cool.set(CO.first, 0, t('xl.cool.empty'), cell({ italic: true, color: C.dim }));
  WS.forEach((w, i) => {
    const r = CO.first + i;
    cool.set(r, 0, cleanKey(w.label, 120) || w.label, cell({ bold: true }));
    cool.set(r, 1, catName2(w.category), cell({ color: C.dim }));
    cool.set(r, 2, w.amountCents / 100, cell({ numFmt: MONEY, bold: true }));
    cool.formula(r, 3, `${ref(r, 2)}/UnitPrice`, w.amountCents / 100 / unitPrice, cell({ numFmt: UNITS, color: C.dim, h: 'center' }));
    cool.set(r, 4, serialDay(w.createdTs), cell({ numFmt: DATE, h: 'left' }));
    cool.set(r, 5, w.decidedTs != null ? serialDay(w.decidedTs) : null, cell({ numFmt: DATE, h: 'left' }));
    cool.set(r, 6, statusText(w.status), cell({ bold: true }));
  });
  cool.when(range(CO.first, 6, CO.last, 6), `${ref(CO.first, 6)}=${qs(t('cool.ditched'))}`, wb.styles.dxf({ color: '2E8B57', bold: true }));
  cool.freeze = { rows: 4, cols: 0 };

  function catName2(id: string): string {
    const meta = categoryMeta(id);
    const k = `cat.${id}` as Key;
    return meta.builtin && k in en ? t(k) : meta.label;
  }

  // ------------------------------------------------------------ Shame shelf
  const SH = rep.shame.slice().sort((a, b) => a.ts - b.ts);
  const SR = { first: 4, last: Math.max(4, 4 + SH.length - 1) };
  band(shm, 0, 6, t('xl.sheet.shame'));
  label(shm, 1, 0, 1, t('xl.shame.total'), { ...body, bold: true, size: 11, fill: C.cream, border: { color: C.ink, style: 'medium', sides: ['t', 'b'] } });
  shm.formula(1, 2, `SUM(${range(SR.first, 2, SR.last, 2)})`, rep.shameCents / 100, { ...body, bold: true, size: 12, fill: C.mustard, numFmt: MONEY, h: 'right', border: { color: C.ink, style: 'medium', sides: ['t', 'b'] } });
  shm.formula(1, 3, 'C2/UnitPrice', rep.shameCents / 100 / unitPrice, { ...body, bold: true, fill: C.mustard, numFmt: `${UNITS}" ${rep.unit.plural}"`, h: 'left', indent: 1, border: { color: C.ink, style: 'medium', sides: ['t', 'b'] } });
  for (let c = 4; c <= 6; c++) shm.blank(1, c, { fill: C.mustard, border: { color: C.ink, style: 'medium', sides: ['t', 'b'] } });
  shm.height(1, 28);
  const sh2: [number, string, number][] = [
    [0, t('xl.c.item'), 28],
    [1, t('xl.c.cat'), 18],
    [2, t('xl.c.cost'), 13],
    [3, unitName, 9],
    [4, t('xl.c.date'), 13],
    [5, t('xl.c.from2'), 16],
    [6, t('xl.c.story'), 52],
  ];
  for (const [c, text, w] of sh2) {
    shm.set(3, c, text, c === 2 || c === 3 ? headStyle : headLeft);
    shm.width(c, w);
  }
  shm.height(3, 26);
  if (SH.length === 0) shm.set(SR.first, 0, t('xl.shame.empty'), cell({ italic: true, color: C.dim }));
  SH.forEach((s, i) => {
    const r = SR.first + i;
    shm.set(r, 0, s.label, cell({ bold: true }));
    shm.set(r, 1, s.category ? catName2(s.category) : '', cell({ color: C.dim }));
    shm.set(r, 2, s.amountCents / 100, cell({ numFmt: MONEY, bold: true }));
    shm.formula(r, 3, `${ref(r, 2)}/UnitPrice`, s.amountCents / 100 / unitPrice, cell({ numFmt: UNITS, color: C.dim, h: 'center' }));
    shm.set(r, 4, serialDay(s.ts), cell({ numFmt: DATE, h: 'left' }));
    shm.set(r, 5, t(s.source === 'regret' ? 'xl.src.regret' : 'xl.src.manual'), cell({ color: C.dim }));
    shm.set(r, 6, s.story ?? '', cell({ italic: true, color: C.dim }));
  });
  shm.freeze = { rows: 4, cols: 0 };

  // ------------------------------------------------------------ About
  abt.width(0, 2);
  abt.width(1, 96);
  band(abt, 0, 1, t('xl.sheet.about'));
  abt.set(2, 1, t('xl.about.head'), { bold: true, size: 12, color: C.ink });
  const lines = [t('xl.about.1'), t('xl.about.2'), t('xl.about.3'), t('xl.about.4', { unit: rep.unit.singular }), t('xl.about.5', { date: longDate(now, lang) })];
  lines.forEach((l, i) => {
    abt.set(3 + i, 1, l, { size: 10, color: C.ink, wrap: true, v: 'top' });
    abt.height(3 + i, 22);
  });

  return wb.build();
}

function nextStart(rep: Report, i: number): number {
  return i + 1 < rep.byWeek.length ? rep.byWeek[i + 1].start : rep.monthEnd;
}
