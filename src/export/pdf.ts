import { POSE_THUMB } from '../art/poseThumbs';
import { CurrencyCode, GROUPS, GroupId, categoryMeta, formatMoney, formatUnits } from '../core';
import { en } from '../i18n/en';
import type { Key } from '../i18n/en';
import type { T } from '../i18n/translate';
import { Report } from './report';

/**
 * The monthly PDF is plain HTML with inline SVG, printed by the system print engine.
 * It is laid out on a fixed 595 x 842 page (A4 in points) and paginated by hand, so every
 * page looks the same on every device and nothing depends on web fonts or the network.
 */

const PAGE_W = 595;
const PAGE_H = 842;
const PAD = 34;
const INNER = PAGE_W - PAD * 2;
const ROWS_PER_PAGE = 31;

const K = {
  ink: '#24120A',
  mustard: '#FFD23F',
  cream: '#FFF4D6',
  paper: '#FFFDF6',
  line: '#E6D5B5',
  dim: '#7A6650',
  red: '#D8321F',
  redSoft: '#FDE3DE',
  green: '#2E8B57',
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

function localeOf(lang: string): string {
  return lang === 'zh' ? 'zh-CN' : lang;
}
function safeDate(ts: number, lang: string, o: Intl.DateTimeFormatOptions, fallback: string): string {
  try {
    return new Date(ts).toLocaleDateString(localeOf(lang), o);
  } catch {
    return fallback;
  }
}
function safeTime(ts: number, lang: string): string {
  try {
    return new Date(ts).toLocaleTimeString(localeOf(lang), { hour: 'numeric', minute: '2-digit' });
  } catch {
    const d = new Date(ts);
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
}

function arc(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const x0 = cx + r * Math.sin(a0);
  const y0 = cy - r * Math.cos(a0);
  const x1 = cx + r * Math.sin(a1);
  const y1 = cy - r * Math.cos(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${cx},${cy} L${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)} Z`;
}

export interface PdfOptions {
  t: T;
  now: number;
}

type Mood = 'happy' | 'ok' | 'sideeye' | 'sad' | 'broke' | 'proud' | 'shock' | 'tempted';

export function reportVerdict(rep: Report): { key: 'great' | 'ok' | 'over' | 'broke' | 'empty'; mood: Mood; ratio: number } {
  if (rep.count === 0) return { key: 'empty', mood: 'happy', ratio: 0 };
  const ratio = rep.budgetCents > 0 ? rep.spentCents / rep.budgetCents : rep.spentCents > 0 ? 2 : 0;
  if (ratio <= 0.8) return { key: 'great', mood: 'proud', ratio };
  if (ratio <= 1) return { key: 'ok', mood: 'ok', ratio };
  if (ratio <= 1.3) return { key: 'over', mood: 'sideeye', ratio };
  return { key: 'broke', mood: 'broke', ratio };
}

export function buildReportHtml(rep: Report, opt: PdfOptions): string {
  const { t, now } = opt;
  const lang = t.lang;
  const money = (c: number, always = false) => esc(formatMoney(c, { fmt: { currency: rep.currency as CurrencyCode, locale: lang, decimals: always ? 'always' : 'auto' } }));
  const units = (c: number) => esc(formatUnits(c, rep.unit, lang));
  const catName = (id: string) => {
    const meta = categoryMeta(id);
    const k = `cat.${id}` as Key;
    return esc(meta.builtin && k in en ? t(k) : meta.label);
  };
  const groupName = (g: GroupId) => esc(t(`group.${g}` as Key));
  const monthName = esc(safeDate(rep.monthStart, lang, { month: 'long', year: 'numeric' }, `${new Date(rep.monthStart).getFullYear()}-${new Date(rep.monthStart).getMonth() + 1}`));
  const walletName = esc(rep.walletName ?? t('wallet.all'));
  const v = reportVerdict(rep);
  const left = rep.budgetCents - rep.spentCents;
  const face = `<img alt="" src="${POSE_THUMB[v.mood]}" />`;

  const css = `
    @page { size: ${PAGE_W}px ${PAGE_H}px; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body { background: #fff; }
    body { font-family: -apple-system, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif; color: ${K.ink}; font-size: 10px; line-height: 1.35; width: ${PAGE_W}px; }
    .page { width: ${PAGE_W}px; height: ${PAGE_H - 1}px; padding: ${PAD}px; position: relative; overflow: hidden; page-break-after: always; break-after: page; background: ${K.paper}; }
    .page:last-child { page-break-after: auto; break-after: auto; }
    .band { background: ${K.ink}; color: ${K.mustard}; border-radius: 14px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-family: "Arial Rounded MT Bold", "Avenir Next", "Helvetica Neue", Arial, sans-serif; font-weight: 900; font-size: 16px; letter-spacing: 1.5px; }
    .kicker { font-size: 9px; letter-spacing: 1.4px; text-transform: uppercase; color: ${K.cream}; opacity: .85; }
    h1 { font-family: "Arial Rounded MT Bold", "Avenir Next", "Helvetica Neue", Arial, sans-serif; font-weight: 900; font-size: 34px; line-height: 1.05; margin-top: 16px; letter-spacing: -.5px; }
    .sub { color: ${K.dim}; font-size: 11px; margin-top: 4px; }
    h2 { font-family: "Arial Rounded MT Bold", "Avenir Next", "Helvetica Neue", Arial, sans-serif; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1.2px; border-bottom: 2.5px solid ${K.ink}; padding-bottom: 5px; margin: 20px 0 10px; }
    .hero { display: flex; align-items: center; gap: 14px; margin-top: 14px; background: ${K.cream}; border: 2.5px solid ${K.ink}; border-radius: 20px; padding: 10px 18px 10px 10px; box-shadow: 4px 4px 0 ${K.ink}; }
    .hero img { flex: none; width: 112px; height: auto; }
    .say { font-family: "Arial Rounded MT Bold", "Avenir Next", "Helvetica Neue", Arial, sans-serif; font-size: 17px; font-weight: 900; line-height: 1.2; }
    .say small { display: block; margin-top: 6px; font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; font-weight: 500; font-size: 10.5px; color: ${K.dim}; }
    .tiles { display: flex; gap: 8px; margin-top: 16px; }
    .tile { flex: 1; border: 2.5px solid ${K.ink}; border-radius: 14px; background: #fff; padding: 8px 6px 7px; text-align: center; min-width: 0; }
    .tile .l { font-size: 7.5px; font-weight: 800; letter-spacing: 1.1px; text-transform: uppercase; }
    .tile .n { font-family: "Arial Rounded MT Bold", "Avenir Next", "Helvetica Neue", Arial, sans-serif; font-weight: 900; font-size: 17px; margin: 4px 0 2px; white-space: nowrap; }
    .tile .s { font-size: 8px; color: ${K.dim}; white-space: nowrap; }
    .tile.hot { background: ${K.mustard}; }
    .tile.neg { background: ${K.redSoft}; }
    .tile.neg .n { color: ${K.red}; }
    .tile.soft { background: ${K.cream}; }
    .row { display: flex; gap: 18px; align-items: center; }
    .legend { flex: 1; }
    .lg { display: flex; align-items: center; gap: 8px; padding: 5px 0; border-bottom: 1px solid ${K.line}; }
    .sw { width: 12px; height: 12px; border: 1.5px solid ${K.ink}; border-radius: 3px; flex: none; }
    .lg b { flex: 1; font-size: 10.5px; }
    .lg span { color: ${K.dim}; width: 38px; text-align: right; }
    .lg i { font-style: normal; font-weight: 800; width: 62px; text-align: right; }
    .bars .b { display: flex; align-items: center; gap: 8px; padding: 4px 0; }
    .bars .nm { width: 110px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .bars .tr { flex: 1; height: 11px; background: ${K.cream}; border: 1.5px solid ${K.ink}; border-radius: 6px; overflow: hidden; }
    .bars .fl { height: 100%; background: ${K.mustard}; border-right: 1.5px solid ${K.ink}; }
    .bars .am { width: 64px; text-align: right; font-weight: 800; }
    .bars .ct { width: 28px; text-align: right; color: ${K.dim}; }
    .two { display: flex; gap: 20px; }
    .two > div { flex: 1; min-width: 0; }
    .kv { display: flex; justify-content: space-between; gap: 10px; padding: 5px 0; border-bottom: 1px solid ${K.line}; }
    .kv span { color: ${K.dim}; }
    .kv b { font-weight: 800; text-align: right; }
    .note { color: ${K.dim}; font-size: 9px; margin: -4px 0 8px; }
    .card { border: 2.5px solid ${K.ink}; border-radius: 16px; background: #fff; padding: 10px 10px 4px; }
    .chip { display: inline-block; line-height: 1; padding: 2px 7px; vertical-align: middle; border: 1.5px solid ${K.ink}; border-radius: 99px; font-weight: 800; font-size: 8.5px; }
    .chip.ok { background: #D9F2E3; } .chip.no { background: ${K.redSoft}; } .chip.mid { background: ${K.cream}; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    th { background: ${K.ink}; color: ${K.mustard}; font-size: 7.5px; text-transform: uppercase; letter-spacing: .9px; text-align: left; padding: 6px 5px; }
    th.r, td.r { text-align: right; }
    td { padding: 0 5px; height: 20px; border-bottom: 1px solid ${K.line}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 9px; }
    td.dim { color: ${K.dim}; }
    td.am { font-weight: 800; }
    .foot { position: absolute; left: ${PAD}px; right: ${PAD}px; bottom: 18px; display: flex; justify-content: space-between; color: ${K.dim}; font-size: 8px; }
    .empty { color: ${K.dim}; font-style: italic; padding: 8px 0; }
  `;

  const footer = (page: number) => `<div class="foot"><span>${esc(t('pdf.made', { date: safeDate(now, lang, { day: 'numeric', month: 'long', year: 'numeric' }, new Date(now).toISOString().slice(0, 10)) }))}</span><span>${esc(t('pdf.page', { n: page }))}</span></div>`;
  const band = `<div class="band"><span class="brand">BROKEY</span><span class="kicker">${esc(t('pdf.kicker'))}</span></div>`;

  // ---- tiles
  const tile = (cls: string, label: string, value: string, sub: string) => `<div class="tile ${cls}"><div class="l">${esc(label)}</div><div class="n">${value}</div><div class="s">${sub}</div></div>`;
  const tiles = [
    tile('hot', t('xl.spent'), money(rep.spentCents), units(rep.spentCents)),
    tile('', t('xl.budget'), money(rep.budgetCents), rep.budgetCents > 0 ? esc(t('pdf.of', { pct: `${Math.round(v.ratio * 100)}%` })) : '&nbsp;'),
    tile(left < 0 ? 'neg' : '', t('xl.left'), money(left), esc(left < 0 ? t('pdf.over', { amount: money(-left) }) : t('pdf.under', { amount: money(left) }))),
    tile('', t('xl.buys'), String(rep.count), rep.count ? `${money(rep.avgCents)} ${esc(t('xl.each'))}` : '&nbsp;'),
    tile('soft', cap(rep.unit.plural), esc(String(Math.round(rep.hsp * 10) / 10)), rep.workHours != null ? `${Math.round(rep.workHours * 10) / 10} ${esc(t('xl.hoursSuffix'))}` : '&nbsp;'),
  ].join('');

  // ---- pie
  const R = 62;
  let pie = `<svg width="170" height="170" viewBox="0 0 170 170"><circle cx="85" cy="85" r="${R + 2}" fill="${K.cream}" stroke="${K.ink}" stroke-width="2.5"/>`;
  if (rep.spentCents > 0) {
    let a = 0;
    const live = rep.byGroup.filter((g) => g.cents > 0);
    for (const g of live) {
      const span = (g.cents / rep.spentCents) * Math.PI * 2;
      const color = GROUPS.find((x) => x.id === g.group)?.color ?? K.mustard;
      pie += live.length === 1 ? `<circle cx="85" cy="85" r="${R}" fill="${color}" stroke="${K.ink}" stroke-width="2.5"/>` : `<path d="${arc(85, 85, R, a, a + span)}" fill="${color}" stroke="${K.ink}" stroke-width="2.5" stroke-linejoin="round"/>`;
      a += span;
    }
  }
  pie += '</svg>';
  const legend = GROUPS.map((g) => {
    const row = rep.byGroup.find((x) => x.group === g.id);
    return `<div class="lg"><span class="sw" style="background:${g.color}"></span><b>${groupName(g.id)}</b><span>${Math.round((row?.share ?? 0) * 100)}%</span><i>${money(row?.cents ?? 0)}</i></div>`;
  }).join('');

  // ---- day chart
  const CW = INNER - 32;
  const CH = 140;
  const dayMax = Math.max(1, ...rep.byDay.map((d) => d.cents), rep.budgetCents / rep.daysInMonth) * 1.12;
  const bw = CW / rep.daysInMonth;
  const dailyBudget = rep.budgetCents / rep.daysInMonth;
  let dayChart = `<svg style="display:block;width:100%;height:auto" viewBox="0 0 ${CW} ${CH + 18}">`;
  dayChart += `<line x1="0" y1="${CH}" x2="${CW}" y2="${CH}" stroke="${K.ink}" stroke-width="2"/>`;
  rep.byDay.forEach((d, i) => {
    const h = (d.cents / dayMax) * CH;
    const over = dailyBudget > 0 && d.cents > dailyBudget;
    if (d.cents > 0) dayChart += `<rect x="${(i * bw + 1.5).toFixed(2)}" y="${(CH - h).toFixed(2)}" width="${Math.max(2, bw - 3).toFixed(2)}" height="${h.toFixed(2)}" rx="2" fill="${over ? K.red : K.mustard}" stroke="${K.ink}" stroke-width="1.2"/>`;
    const label = i === 0 || (i + 1) % 5 === 0;
    if (label) dayChart += `<text x="${(i * bw + bw / 2).toFixed(2)}" y="${CH + 13}" font-size="8" text-anchor="middle" fill="${K.dim}">${i + 1}</text>`;
  });
  if (dailyBudget > 0) {
    const y = CH - (dailyBudget / dayMax) * CH;
    dayChart += `<line x1="0" y1="${y.toFixed(2)}" x2="${CW}" y2="${y.toFixed(2)}" stroke="${K.ink}" stroke-width="1.5" stroke-dasharray="5 4"/>`;
  }
  dayChart += '</svg>';

  // ---- week chart
  const WH = 110;
  const weekMax = Math.max(1, ...rep.byWeek.map((w) => Math.max(w.cents, w.budgetCents))) * 1.12;
  const slot = CW / Math.max(1, rep.byWeek.length);
  let weekChart = `<svg style="display:block;width:100%;height:auto" viewBox="0 0 ${CW} ${WH + 30}"><line x1="0" y1="${WH}" x2="${CW}" y2="${WH}" stroke="${K.ink}" stroke-width="2"/>`;
  rep.byWeek.forEach((w, i) => {
    const x = i * slot + slot * 0.18;
    const width = slot * 0.64;
    const h = (w.cents / weekMax) * WH;
    const over = w.cents > w.budgetCents && w.budgetCents > 0;
    if (w.cents > 0) weekChart += `<rect x="${x.toFixed(2)}" y="${(WH - h).toFixed(2)}" width="${width.toFixed(2)}" height="${h.toFixed(2)}" rx="4" fill="${over ? K.red : K.mustard}" stroke="${K.ink}" stroke-width="1.6"/>`;
    const by = WH - (w.budgetCents / weekMax) * WH;
    weekChart += `<line x1="${(x - 4).toFixed(2)}" y1="${by.toFixed(2)}" x2="${(x + width + 4).toFixed(2)}" y2="${by.toFixed(2)}" stroke="${K.ink}" stroke-width="1.5" stroke-dasharray="4 3"/>`;
    const lbl = safeDate(w.start, lang, { day: 'numeric', month: 'short' }, '');
    weekChart += `<text x="${(x + width / 2).toFixed(2)}" y="${WH + 12}" font-size="8.5" text-anchor="middle" fill="${K.dim}">${esc(lbl)}</text>`;
    weekChart += `<text x="${(x + width / 2).toFixed(2)}" y="${WH + 24}" font-size="8.5" font-weight="700" text-anchor="middle" fill="${K.ink}">${esc(formatMoney(w.cents, { fmt: { currency: rep.currency as CurrencyCode, locale: lang, decimals: 'none' } }))}</text>`;
  });
  weekChart += '</svg>';

  // ---- categories
  const topMax = Math.max(1, ...rep.byCategory.map((c) => c.cents));
  const cats = rep.byCategory.slice(0, 8);
  const catBars = cats.length
    ? cats.map((c) => `<div class="b"><span class="nm">${catName(c.category)}</span><div class="tr"><div class="fl" style="width:${Math.max(3, Math.round((c.cents / topMax) * 100))}%"></div></div><span class="am">${money(c.cents)}</span><span class="ct">${c.count}</span></div>`).join('')
    : `<div class="empty">${esc(t('pdf.empty'))}</div>`;

  // ---- side facts
  const rg = rep.regret;
  const kv = (k: string, val: string) => `<div class="kv"><span>${esc(k)}</span><b>${val}</b></div>`;
  const highlights = [
    kv(t('xl.biggest'), rep.biggest ? `${money(rep.biggest.amountCents)} <span style="font-weight:500">${catName(rep.biggest.category)}</span>` : '-'),
    kv(t('xl.busiest'), rep.busiestDay ? `${money(rep.busiestDay.cents)} <span style="font-weight:500">${esc(safeDate(rep.busiestDay.ts, lang, { day: 'numeric', month: 'short' }, ''))}</span>` : '-'),
    kv(t('pdf.noSpendDays'), String(rep.zeroDays)),
    kv(t('xl.avg'), rep.count ? money(rep.avgCents) : '-'),
  ].join('');
  const regretBlock = [
    kv(t('regret.worth'), String(rg.worth)),
    kv(t('regret.meh'), String(rg.meh)),
    kv(t('regret.nope'), `${rg.nah} <span style="font-weight:500">${rg.nah ? `(${money(rg.regretCents)})` : ''}</span>`),
  ].join('');
  const places = rep.topMerchants.length ? rep.topMerchants.map((m) => kv(m.name, `${money(m.cents)} <span style="font-weight:500">x${m.count}</span>`)).join('') : `<div class="empty">-</div>`;
  const statusChip = (s: string) => `<span class="chip ${s === 'ditched' ? 'ok' : s === 'bought' ? 'no' : 'mid'}">${esc(s === 'ditched' ? t('cool.ditched') : s === 'bought' ? t('cool.bought') : t('xl.cool.cooling'))}</span>`;
  const wishRows = rep.wishes
    .slice(0, 8)
    .map((w) => `<div class="kv"><span style="color:${K.ink};font-weight:700;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(w.label)}</span>${statusChip(w.status)}<b style="width:64px">${money(w.amountCents)}</b></div>`)
    .join('');
  const shameRows = rep.shame
    .slice(0, 8)
    .map((x) => `<div class="kv"><span style="color:${K.ink};font-weight:700;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(x.label)}${x.story ? ` <i style="font-weight:400;color:${K.dim}">${esc(x.story)}</i>` : ''}</span><b style="width:64px">${money(x.amountCents)}</b></div>`)
    .join('');
  const coolBlock = [kv(t('xl.cool.saved'), money(rep.ditchedCents)), kv(t('cool.ditched'), String(rep.ditchedCount))].join('');
  const hasDetails = rep.topMerchants.length > 0 || rep.wishes.length > 0 || rep.shame.length > 0;

  // ---- pages
  let pageNo = 0;
  const pages: string[] = [];
  const add = (inner: string) => {
    pageNo += 1;
    pages.push(`<section class="page">${band}${inner}${footer(pageNo)}</section>`);
  };

  add(`<h1>${monthName}</h1><div class="sub">${walletName} · ${esc(rep.currency)}</div>
    <div class="hero">${face}<div class="say">${esc(t(`pdf.v.${v.key}` as Key))}<small>${esc(t('xl.spent'))} ${money(rep.spentCents)} · ${units(rep.spentCents)}</small></div></div>
    <div class="tiles">${tiles}</div>
    <h2>${esc(t('xl.where'))}</h2>
    <div class="row"><div>${pie}</div><div class="legend">${legend}</div></div>
    <div class="two"><div><h2>${esc(t('xl.highlights'))}</h2>${highlights}</div><div><h2>${esc(t('xl.regretTitle'))}</h2>${regretBlock}</div></div>`);

  add(`<h2 style="margin-top:18px">${esc(t('pdf.daily'))}</h2><div class="note">${esc(t('pdf.dailySub'))}</div>
    <div class="card">${dayChart}</div>
    <h2>${esc(t('pdf.weekly'))}</h2><div class="card">${weekChart}</div>
    <h2>${esc(t('pdf.topCats'))}</h2><div class="bars">${catBars}</div>`);

  if (hasDetails) {
    add(`<div class="two" style="margin-top:2px"><div><h2>${esc(t('xl.topPlaces'))}</h2>${places}</div><div><h2>${esc(t('xl.sheet.cool'))}</h2>${coolBlock}</div></div>
      <h2>${esc(t('pdf.wishes'))}</h2>${wishRows || `<div class="empty">${esc(t('xl.cool.empty'))}</div>`}
      <h2>${esc(t('xl.sheet.shame'))}</h2>${rep.shame.length ? kv(t('xl.shame.total'), money(rep.shameCents)) : ''}${shameRows || `<div class="empty">${esc(t('xl.shame.empty'))}</div>`}`);
  }

  // ---- ledger, paginated by hand
  const rows = rep.purchases.slice().reverse();
  const chunks: (typeof rows)[] = [];
  for (let i = 0; i < rows.length; i += ROWS_PER_PAGE) chunks.push(rows.slice(i, i + ROWS_PER_PAGE));
  chunks.forEach((chunk, ci) => {
    const trs = chunk
      .map((p) => {
        const reg = p.regret ? `<span class="chip ${p.regret === 'worth' ? 'ok' : p.regret === 'nah' ? 'no' : 'mid'}">${esc(t(p.regret === 'worth' ? 'regret.worth' : p.regret === 'meh' ? 'regret.meh' : 'regret.nope'))}</span>` : '';
        return `<tr><td class="dim">${esc(safeDate(p.ts, lang, { day: 'numeric', month: 'short' }, ''))} ${esc(safeTime(p.ts, lang))}</td><td>${catName(p.category)}</td><td class="dim">${esc(p.merchant ?? '')}</td><td class="r am">${money(p.amountCents, true)}</td><td class="r dim">${units(p.amountCents)}</td><td>${reg}</td></tr>`;
      })
      .join('');
    add(`
      <h2 style="margin-top:18px">${esc(t('pdf.ledger'))}${chunks.length > 1 ? ` (${ci + 1}/${chunks.length})` : ''}</h2>
      <table><colgroup><col style="width:92px"/><col style="width:100px"/><col style="width:104px"/><col style="width:68px"/><col style="width:64px"/><col style="width:99px"/></colgroup>
      <thead><tr><th>${esc(t('xl.c.date'))}</th><th>${esc(t('xl.c.cat'))}</th><th>${esc(t('xl.c.where'))}</th><th class="r">${esc(t('xl.c.amount'))}</th><th class="r">${esc(cap(rep.unit.plural))}</th><th>${esc(t('xl.c.regret'))}</th></tr></thead>
      <tbody>${trs}</tbody></table>`);
  });

  return `<!doctype html><html lang="${esc(lang)}"><head><meta charset="utf-8"/><meta name="viewport" content="width=${PAGE_W}"/><title>Brokey ${monthName}</title><style>${css}</style></head><body>${pages.join('')}</body></html>`;
}

export const PDF_PAGE = { width: PAGE_W, height: PAGE_H };
