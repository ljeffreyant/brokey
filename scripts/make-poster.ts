/**
 * Campus poster: A3 and A4 print PDFs + a PNG preview, all from one HTML file.
 *
 *   npx tsx scripts/make-poster.ts                      -> placeholder QR box (do NOT print like this)
 *   npx tsx scripts/make-poster.ts https://apps.apple.com/...      -> real QR, "Free on iPhone"
 *   npx tsx scripts/make-poster.ts https://testflight.apple.com/join/XXXX --soon   -> "Coming soon", scan to test
 *
 * Output goes to poster/ . Needs Python Playwright for the PDF step (scripts/html-to-pdf.py style).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import QRCode from 'qrcode';
import { mascot } from '../src/art/mascot';
import { sceneToSvg } from '../src/art/scene';
import { wordmark } from './render-logo';

const root = path.join(__dirname, '..');
const out = path.join(root, 'poster');
fs.mkdirSync(out, { recursive: true });

const args = process.argv.slice(2);
const soon = args.includes('--soon');
const url = args.find((a) => a.startsWith('http'));

const font = (family: string, weight: number, file: string) =>
  `@font-face{font-family:"${family}";font-weight:${weight};src:url("file://${root}/node_modules/@expo-google-fonts/${file}.ttf")}`;

async function main() {
  const qr = url
    ? (await QRCode.toString(url, { type: 'svg', margin: 0, color: { dark: '#2A1B14', light: '#FFFDF6' } })).replace('<svg', '<svg class="qrsvg"')
    : '';
  const wm = wordmark();
  const wmSvg = `<svg viewBox="0 0 ${wm.w.toFixed(0)} ${wm.h.toFixed(0)}" xmlns="http://www.w3.org/2000/svg">${wm.svg}</svg>`;
  const sad = sceneToSvg(mascot('broke', 4), { size: 640 });
  const prices = sceneToSvg(mascot('tempted', 9), { size: 300 });

  const cta = soon ? 'Coming soon to iPhone' : 'Free on iPhone';
  const qrLabel = url ? (soon ? 'Scan to test it first' : 'Scan. Get roasted.') : 'QR goes here';

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Brokey poster</title><style>
${font('Bricolage', 800, 'bricolage-grotesque/800ExtraBold/BricolageGrotesque_800ExtraBold')}
${font('DM', 700, 'dm-sans/700Bold/DMSans_700Bold')}
${font('DM', 500, 'dm-sans/500Medium/DMSans_500Medium')}
@page{size:1123px 1587px;margin:0}
*{box-sizing:border-box;margin:0}
html,body{width:1123px;height:1587px;background:#FF5A47;overflow:hidden}
:root{--ink:#2A1B14;--cream:#FFF6E6;--card:#FFFDF6;--yellow:#FFD23F;--red:#FF5A47;--blue:#3FC1F0}
.p{position:relative;width:1123px;height:1587px;overflow:hidden;font-family:"DM",system-ui,sans-serif;color:var(--ink);
  background:radial-gradient(circle at 50% 38%,#FF7765 0,#FF5A47 62%)}
.dots{position:absolute;inset:0;background-image:radial-gradient(#C93A2A 5px,transparent 5.5px);background-size:46px 46px;opacity:.22}
.tag{position:absolute;left:70px;top:70px;background:var(--yellow);border:5px solid var(--ink);border-radius:999px;padding:12px 28px;font:800 30px/1 "Bricolage";letter-spacing:.02em;transform:rotate(-3deg);box-shadow:7px 7px 0 var(--ink)}
h1{position:absolute;left:62px;top:150px;width:1000px;font:800 176px/.88 "Bricolage";letter-spacing:-.045em;color:var(--cream);transform:rotate(-2.2deg);transform-origin:left top;
  text-shadow:-3px -3px 0 var(--ink),3px -3px 0 var(--ink),-3px 3px 0 var(--ink),3px 3px 0 var(--ink),9px 11px 0 var(--ink)}
h1 span{color:var(--yellow);position:relative;display:inline-block}
.squig{position:absolute;left:-6px;right:-6px;bottom:-18px;height:26px}
.mascot{position:absolute;left:130px;top:480px;width:570px;transform:rotate(2deg)}
.mascot svg{width:100%;height:auto;display:block;filter:drop-shadow(0 18px 0 rgba(42,27,20,.18))}
.bubble{position:absolute;right:50px;top:560px;width:330px;background:var(--card);border:6px solid var(--ink);border-radius:36px 36px 36px 8px;padding:24px 28px;font:800 40px/1.05 "Bricolage";letter-spacing:-.02em;transform:rotate(3deg);box-shadow:9px 9px 0 var(--ink)}
.bubble small{display:block;margin-top:10px;font:500 22px/1.2 "DM";opacity:.75;letter-spacing:0}
.cards{position:absolute;left:0;right:0;top:1010px}
.card{position:absolute;background:var(--card);border:6px solid var(--ink);border-radius:30px;padding:20px 24px;box-shadow:9px 9px 0 var(--ink);width:330px}
.card b{display:block;font:800 36px/1 "Bricolage";letter-spacing:-.02em;margin-bottom:8px}
.card span{font:500 23px/1.25 "DM"}
.c1{left:56px;top:0;transform:rotate(-3deg);background:var(--yellow)}
.c2{left:396px;top:26px;transform:rotate(2deg)}
.c3{left:736px;top:-4px;transform:rotate(-1.5deg);background:var(--blue)}
.foot{position:absolute;left:0;right:0;bottom:0;height:300px;background:var(--ink)}
.wm{position:absolute;left:62px;bottom:112px;width:400px}
.wm svg{width:100%;height:auto;display:block}
.line{position:absolute;left:68px;bottom:56px;width:560px;color:var(--cream);font:700 30px/1.2 "DM"}
.line em{color:var(--yellow);font-style:normal}
.qr{position:absolute;right:56px;bottom:50px;width:292px;background:var(--card);border:6px solid var(--yellow);border-radius:28px;padding:20px 20px 14px;text-align:center;box-shadow:-8px 8px 0 #000}
.qr .box{width:210px;height:210px;margin:0 auto 10px;display:flex;align-items:center;justify-content:center;border:4px dashed #BBA793;border-radius:12px;font:700 24px/1.2 "DM";color:#8a7766;padding:14px}
.qr .box .qrsvg{width:100%;height:100%}
.qr .box.on{border:none;padding:0}
.qr div.l{font:800 24px/1.1 "Bricolage"}
.fine{position:absolute;left:70px;right:70px;bottom:18px;font:500 15px/1.2 "DM";color:#BBA793}
.spark{position:absolute;font-size:64px;color:var(--yellow);text-shadow:3px 3px 0 var(--ink)}
</style></head><body><div class="p">
<div class="dots"></div>
<div class="tag">FOR MELBOURNE'S BROKE</div>
<h1>Your wallet is <span>crying.<svg class="squig" viewBox="0 0 500 26" preserveAspectRatio="none"><path d="M2 14 C 30 0, 50 28, 80 14 S 130 2, 160 14 S 210 28, 240 12 S 290 0, 320 14 S 370 28, 400 12 S 460 4, 498 14" fill="none" stroke="#2A1B14" stroke-width="9" stroke-linecap="round"/></svg></span></h1>
<div class="spark" style="left:900px;top:480px">✦</div><div class="spark" style="left:120px;top:900px;font-size:46px">✦</div>
<div class="mascot">${sad}</div>
<div class="bubble">That jacket? Ten HSPs. Ten.<small>Brokey turns every price into halal snack packs, then roasts you for it.</small></div>
<div class="cards">
  <div class="card c1"><b>Safe to spend today</b><span>One number. If it is red, step away from the checkout.</span></div>
  <div class="card c2"><b>The 24 hour fridge</b><span>Tap "I want this". Wait. See if you still do.</span></div>
  <div class="card c3"><b>1 HSP = $18</b><span>Your coffee habit, in units you can feel.</span></div>
</div>
<div class="foot">
  <div class="wm">${wmSvg}</div>
  <div class="line">Roasts your spending.<br><em>${cta}.</em></div>
  <div class="qr"><div class="box ${url ? 'on' : ''}">${url ? qr : 'Paste App Store link, rerun'}</div><div class="l">${qrLabel}</div></div>
  <div class="fine">Brokey is not a bank and not financial advice. Your data stays on your phone.</div>
</div>
</div></body></html>`;

  const htmlPath = path.join(out, 'poster.html');
  fs.writeFileSync(htmlPath, html);
  execFileSync('python3', [path.join(__dirname, 'poster-render.py'), htmlPath, out], { stdio: 'inherit' });
  console.log(url ? `poster built with QR for ${url}` : 'poster built with a PLACEHOLDER QR box. Re-run with the App Store (or TestFlight) link before printing.');
}

main();
