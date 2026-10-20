/**
 * Builds the tiny static site App Store Connect needs links for: home, privacy, terms, support.
 *   npx tsx scripts/build-site.ts     ->  site/
 * Deploy the site/ folder anywhere (Vercel, Cloudflare Pages, GitHub Pages) then paste the URLs into src/config.ts.
 * The privacy and terms text come from src/legal so the app and the website can never disagree.
 */
import fs from 'node:fs';
import path from 'node:path';
import { mascot } from '../src/art/mascot';
import { sceneToSvg } from '../src/art/scene';
import { APP_STORE_ID, APP_STORE_PROVIDER_TOKEN, GO_CHANNELS, SUPPORT_EMAIL, TESTFLIGHT_URL } from '../src/config';
import { goTarget } from '../src/core/golink';
import { LegalDoc, PRIVACY, TERMS } from '../src/legal';

const out = path.join(__dirname, '..', 'site');
fs.mkdirSync(out, { recursive: true });

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const hero = sceneToSvg(mascot('happy'), { size: 300 });
const proud = sceneToSvg(mascot('proud', 11), { size: 220 });
const sad = sceneToSvg(mascot('sad', 3), { size: 220 });
const tempted = sceneToSvg(mascot('tempted', 5), { size: 220 });

const CSS = `
:root{--bg:#FFF6E6;--card:#FFFDF6;--ink:#2A1B14;--dim:#6E5A4C;--red:#FF5A47;--yellow:#FFD23F}
@media (prefers-color-scheme: dark){:root{--bg:#16110E;--card:#241B16;--ink:#FFF1DA;--dim:#BBA793}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.6 "DM Sans",system-ui,-apple-system,sans-serif}
h1,h2,h3{font-family:"Bricolage Grotesque","DM Sans",system-ui,sans-serif;line-height:1.05;letter-spacing:-.02em;margin:0 0 .4em}
h1{font-size:clamp(40px,8vw,72px)}h2{font-size:26px;margin-top:1.6em}
a{color:var(--red)}
.wrap{max-width:720px;margin:0 auto;padding:28px 20px 64px}
nav{display:flex;gap:18px;flex-wrap:wrap;font-weight:600;margin-bottom:24px}nav a{color:var(--ink);text-decoration:none}
nav a:first-child{color:var(--red);font-family:"Bricolage Grotesque",sans-serif;font-size:22px;margin-right:auto}
.card{background:var(--card);border:3px solid var(--ink);border-radius:22px;box-shadow:5px 5px 0 var(--ink);padding:18px 20px;margin:18px 0}
.hero{display:flex;flex-wrap:wrap;gap:20px;align-items:center;justify-content:center;text-align:left}
.hero>div{flex:1 1 300px}
.btn{display:inline-block;background:var(--red);color:#fff;font-weight:700;text-decoration:none;border:3px solid var(--ink);border-radius:16px;padding:12px 20px;box-shadow:4px 4px 0 var(--ink)}
.row{display:flex;gap:6px;justify-content:center}.row svg{width:31%;height:auto;min-width:0}.hero svg{max-width:100%;height:auto}
small,.dim{color:var(--dim)}
footer{margin-top:48px;color:var(--dim);font-size:14px}
`;

const page = (title: string, body: string, desc = '') => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc || 'Brokey is a halal snack pack that roasts your spending.')}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<style>${CSS}</style></head><body><div class="wrap">
<nav><a href="index.html">Brokey</a><a href="support.html">Support</a><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a></nav>
${body}
<footer>Brokey is not a bank, not financial advice and not affiliated with any bank or card. Made in Melbourne.</footer>
</div></body></html>`;

const doc = (d: LegalDoc) =>
  page(
    `${d.title} - Brokey`,
    `<h1>${esc(d.title)}</h1><p class="dim">Last updated ${esc(d.updated)}</p><p>${esc(d.intro)}</p>` +
      d.sections.map((s) => `<h2>${esc(s.heading)}</h2>${s.body.map((p) => `<p>${esc(p)}</p>`).join('')}`).join(''),
  );

const home = page(
  'Brokey - a halal snack pack that roasts your spending',
  `<div class="hero"><div><h1>Spend less.<br>Get roasted.</h1>
<p>Brokey is a halal snack pack with opinions about your money. Every price is in HSPs, every buy gets a roast, and big wants cool off before they cost you.</p>
<p><a class="btn" href="support.html">Say hi</a></p></div><div style="text-align:center">${hero}</div></div>
<div class="row">${proud}${sad}${tempted}</div>
<div class="card"><h3>Safe to spend today</h3><p>One number. If it is red, step away from the checkout.</p></div>
<div class="card"><h3>The cooling-off fridge</h3><p>Tap "I want this", wait 24 hours, and see if you still do. Most of the time you will not.</p></div>
<div class="card"><h3>Your data stays on your phone</h3><p>No bank login, no ads, no trackers. Read the <a href="privacy.html">privacy policy</a>.</p></div>`,
  'Brokey turns every purchase into HSPs, roasts you for it, and makes you wait before big buys.',
);

const support = page(
  'Support - Brokey',
  `<h1>Support</h1><p>Email <a href="mailto:${esc(SUPPORT_EMAIL)}">${esc(SUPPORT_EMAIL)}</a>. A human (one student) replies, usually within two days.</p>
<h2>Common questions</h2>
<div class="card"><h3>Where is my data?</h3><p>On your phone only. Deleting the app, or Settings, Reset everything, erases it.</p></div>
<div class="card"><h3>How do I change what an HSP costs?</h3><p>Settings, Money and units. The default is $18, which is a fair Melbourne price for a large with the lot.</p></div>
<div class="card"><h3>Can I turn the roasts down?</h3><p>Yes. Settings, Roast level: Mild, Medium, or Unhinged (adults only).</p></div>
<div class="card"><h3>How do I export a month?</h3><p>Settings, Export. You get a spreadsheet, a PDF report, or a shareable HSP receipt.</p></div>
<div class="card"><h3>How do I log Apple Pay buys automatically?</h3><p>Settings, Apple Pay shortcut walks you through a two minute Shortcuts automation.</p></div>`,
);

fs.writeFileSync(path.join(out, 'index.html'), home);
fs.writeFileSync(path.join(out, 'privacy.html'), doc(PRIVACY));
fs.writeFileSync(path.join(out, 'terms.html'), doc(TERMS));
fs.writeFileSync(path.join(out, 'support.html'), support);

// Short links: site/go/<channel>/index.html forwards to the App Store (tagged with the channel), TestFlight, or the site home.
const goPage = (channel: string, target: string) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${esc(target)}">
<title>Brokey</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#FFF6E6;color:#2A1B14;font:18px/1.5 system-ui,sans-serif;text-align:center}a{color:#FF5A47;font-weight:700}</style>
</head><body><p>Taking you to Brokey...<br><a href="${esc(target)}">Tap here if nothing happens</a></p>
<script>location.replace(${JSON.stringify(target)})</script></body></html>`;
const goCfg = { appStoreId: APP_STORE_ID, providerToken: APP_STORE_PROVIDER_TOKEN, testflightUrl: TESTFLIGHT_URL };
for (const ch of GO_CHANNELS) {
  const dir = path.join(out, 'go', ch);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), goPage(ch, goTarget(ch, { ...goCfg, fallback: '../../index.html' })));
}

console.log('site built:', fs.readdirSync(out).join(', '), `+ ${GO_CHANNELS.length} go-links`);
