/* usage: npx tsx scripts/make-sample-pdf.ts OUT.html [lang] [month 2026-09] [empty] */
import { writeFileSync } from 'fs';
import { DEFAULT_UNIT, Purchase, ShameItem, Wallet, WishItem } from '../src/core';
import { buildReport } from '../src/export/report';
import { buildReportHtml } from '../src/export/pdf';
import { makeT } from '../src/i18n/translate';

const out = process.argv[2] ?? 'report.html';
const lang = (process.argv[3] ?? 'en') as 'en' | 'zh' | 'id' | 'es';
const [y, m] = (process.argv[4] ?? '2026-09').split('-').map(Number);
const empty = process.argv[5] === 'empty';
const scale = Number(process.argv[6] ?? 0.45);
let seed = 7;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];
const CATS: [string, number, number, string[]][] = [
  ['coffee', 450, 700, ['Corner Cafe', 'Brunetti']], ['takeaway', 1400, 2400, ['Halal Bros', 'Nando']], ['groceries', 1800, 7200, ['Woolies', 'Aldi']],
  ['bubbletea', 700, 950, ['Gong Cha']], ['transport', 300, 1200, ['Myki']], ['nightout', 2500, 9000, ['']], ['streaming', 1199, 2999, ['Streamflix']],
  ['clothes', 3500, 12900, ['Thrift Haul']], ['tech', 2900, 24900, ['Gadget Hut']], ['snacks', 300, 900, ['7-Eleven']],
];
const purchases: Purchase[] = [];
const days = new Date(y, m, 0).getDate();
if (!empty) for (let d = 1; d <= days; d++) for (let i = 0, k = Math.floor(rnd() * 4); i < k; i++) {
  const [cat, lo, hi, ms] = pick(CATS);
  const p: Purchase = { id: `p${purchases.length}`, walletId: 'main', ts: new Date(y, m - 1, d, 7 + Math.floor(rnd() * 15), Math.floor(rnd() * 60)).getTime(), amountCents: Math.round((lo + rnd() * (hi - lo) * scale) / 5) * 5, category: cat, method: 'tap', roast: '', source: 'manual' };
  const mer = pick(ms); if (mer) p.merchant = mer; if (rnd() > 0.5) p.regret = pick(['worth', 'meh', 'nah'] as const);
  purchases.push(p);
}
const wallet: Wallet = { id: 'main', name: 'Main', icon: 'hsp', color: '#FFD23F', income: [], recurring: [], savingsWeeklyCents: 0, budgetMode: 'manual', manualWeeklyCents: 15000, createdTs: 0 };
const mid = new Date(y, m - 1, 10).getTime();
const wishes: WishItem[] = empty ? [] : [{ id: 'w1', walletId: 'main', label: 'Headphones', amountCents: 24900, category: 'tech', createdTs: mid, unlockTs: mid, status: 'ditched', decidedTs: mid }];
const shame: ShameItem[] = empty ? [] : [{ id: 's1', ts: mid, label: 'Air fryer', amountCents: 12900, source: 'manual' }];
const rep = buildReport({ purchases, wishes, shame, wallets: [wallet], walletId: 'main', settings: { unit: DEFAULT_UNIT, hourlyCents: 2800, weekStartsOn: 1, currency: 'AUD', language: lang }, month: new Date(y, m - 1, 5).getTime(), now: new Date(2026, 9, 20, 11).getTime() });
writeFileSync(out, buildReportHtml(rep, { t: makeT(lang), now: new Date(2026, 9, 20, 11).getTime() }));
console.log('ok', rep.count, rep.spentCents / 100, rep.budgetCents / 100);
