/* usage: npx tsx scripts/make-sample-xlsx.ts OUTDIR [lang] [month: 2026-09] */
import { writeFileSync } from 'fs';
import { DEFAULT_UNIT, Purchase, ShameItem, Wallet, WishItem } from '../src/core';
import { buildWorkbook } from '../src/export/xlsx/build';
import { buildReport } from '../src/export/report';
import { makeT } from '../src/i18n/translate';

const out = process.argv[2] ?? '.';
const lang = (process.argv[3] ?? 'en') as 'en' | 'zh' | 'id' | 'es';
const [y, m] = (process.argv[4] ?? '2026-09').split('-').map(Number);
const empty = process.argv[5] === 'empty';

let seed = 7;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];

const CATS: [string, number, number, string[]][] = [
  ['coffee', 450, 700, ['Corner Cafe', 'Brunetti', 'Seven Seeds']],
  ['takeaway', 1400, 2400, ['Halal Bros', 'Dumpling House', 'Nando']],
  ['groceries', 1800, 7200, ['Woolies', 'Coles', 'Aldi']],
  ['bubbletea', 700, 950, ['Gong Cha', 'Chatime']],
  ['transport', 300, 1200, ['Myki']],
  ['nightout', 2500, 9000, ['']],
  ['streaming', 1199, 2999, ['Streamflix']],
  ['clothes', 3500, 12900, ['Thrift Haul', 'Uniqlo']],
  ['tech', 2900, 24900, ['Gadget Hut']],
  ['snacks', 300, 900, ['7-Eleven']],
];

const NOW = new Date(2026, 9, 20, 11, 0).getTime();
const purchases: Purchase[] = [];
const days = new Date(y, m, 0).getDate();
if (!empty)
  for (let d = 1; d <= days; d++) {
    const k = Math.floor(rnd() * 4);
    for (let i = 0; i < k; i++) {
      const [cat, lo, hi, ms] = pick(CATS);
      const cents = Math.round((lo + rnd() * (hi - lo)) / 5) * 5;
      const ts = new Date(y, m - 1, d, 7 + Math.floor(rnd() * 15), Math.floor(rnd() * 60)).getTime();
      const p: Purchase = { id: `p${purchases.length}`, walletId: 'main', ts, amountCents: cents, category: cat, method: pick(['tap', 'card', 'cash', 'bnpl'] as const), roast: rnd() > 0.5 ? 'Bold of you to call that a personality.' : '', source: pick(['manual', 'shortcut', 'cooling'] as const) };
      const mer = pick(ms);
      if (mer) p.merchant = mer;
      if (rnd() > 0.5) p.regret = pick(['worth', 'meh', 'nah'] as const);
      if (rnd() > 0.85) p.note = 'for the group chat';
      purchases.push(p);
    }
  }
const wallet: Wallet = { id: 'main', name: 'Main', icon: 'hsp', color: '#FFD23F', income: [], recurring: [], savingsWeeklyCents: 0, budgetMode: 'manual', manualWeeklyCents: 15000, createdTs: 0 };
const mid = new Date(y, m - 1, 10).getTime();
const wishes: WishItem[] = empty
  ? []
  : [
      { id: 'w1', walletId: 'main', label: 'Noise-cancelling headphones', amountCents: 24900, category: 'tech', createdTs: mid, unlockTs: mid + 86400000, status: 'ditched', decidedTs: mid + 2 * 86400000 },
      { id: 'w2', walletId: 'main', label: 'Air fryer', amountCents: 12900, category: 'homewares', createdTs: mid + 86400000, unlockTs: mid + 3 * 86400000, status: 'bought', decidedTs: mid + 4 * 86400000 },
      { id: 'w3', walletId: 'main', label: 'Retro console', amountCents: 39900, category: 'tech', createdTs: mid + 5 * 86400000, unlockTs: mid + 7 * 86400000, status: 'cooling' },
    ];
const shame: ShameItem[] = empty ? [] : [{ id: 's1', ts: mid, label: 'Air fryer', amountCents: 12900, category: 'homewares', story: 'Used it twice.', source: 'manual' }, { id: 's2', ts: mid + 86400000, label: 'Gym membership', amountCents: 4900, story: 'Went in January.', source: 'regret' }];

const rep = buildReport({ purchases, wishes, shame, wallets: [wallet], walletId: 'main', settings: { unit: DEFAULT_UNIT, hourlyCents: process.argv[6] === 'nohourly' ? null : 2800, weekStartsOn: 1, currency: 'AUD', language: lang }, month: new Date(y, m - 1, 5).getTime(), now: NOW });
const t = makeT(lang);
writeFileSync(`${out}/cached.xlsx`, buildWorkbook(rep, { t, now: NOW }));
writeFileSync(`${out}/nocache.xlsx`, buildWorkbook(rep, { t, now: NOW, cache: false }));
console.log(JSON.stringify({ n: rep.count, spent: rep.spentCents / 100, budget: rep.budgetCents / 100, cats: rep.byCategory.length, weeks: rep.byWeek.length }));
