/**
 * "Coming soon" teaser posts for the Brokey app (static, 1080x1440 = 3:4, the profile-grid shape; key content stays in the 4:5 centre).
 *   npx tsx scripts/make-teasers.ts           -> social/teasers/posts.html + posts.json
 *   python3 scripts/render-teasers.py all     -> social/teasers/<id>.png ; `sheet` for a contact sheet
 * 1 announcement, 2 snack-pack price list, 3 the roast, 4 the fridge, 5 fries by mood, 6 HSP receipt, 7 the app (real screens).
 * Copy comes from the app itself: store listing (docs/APP_STORE.md), roast banks (src/core/roasts-*.ts), mascot quips (src/i18n/en.ts).
 */
import fs from 'node:fs';
import path from 'node:path';
import { I, M, WM, INK, root } from './story-art';
import { W, H, CSS, foot, mas, Post } from './teasers-common';

const RED = '#EF3B2D';
const YEL = '#FFD23F';
const CREAM = '#FFF6E6';
export const posts: Post[] = [];

const rays = (cx: number, cy: number, n: number, r: number, fill: string) =>
  Array.from({ length: n }, (_, i) => {
    const a0 = ((i * 2) / (2 * n)) * Math.PI * 2, a1 = a0 + Math.PI / n;
    return `<path d="M${cx} ${cy} L${(cx + Math.cos(a0) * r).toFixed(1)} ${(cy + Math.sin(a0) * r).toFixed(1)} L${(cx + Math.cos(a1) * r).toFixed(1)} ${(cy + Math.sin(a1) * r).toFixed(1)}Z" fill="${fill}"/>`;
  }).join('');
const spark = (x: number, y: number, s: number, c = YEL) =>
  `<path d="M${x} ${y - s} Q${x + s * 0.15} ${y - s * 0.15} ${x + s} ${y} Q${x + s * 0.15} ${y + s * 0.15} ${x} ${y + s} Q${x - s * 0.15} ${y + s * 0.15} ${x - s} ${y} Q${x - s * 0.15} ${y - s * 0.15} ${x} ${y - s}Z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
const dots = (x: number, y: number, cols: number, rows: number, gap: number, r: number, fill: string, op = 0.5) =>
  Array.from({ length: rows }, (_, j) => Array.from({ length: cols }, (_, i) => `<circle cx="${x + i * gap}" cy="${y + j * gap}" r="${(r * (1 - (i / cols) * 0.7)).toFixed(1)}" fill="${fill}" opacity="${op}"/>`).join('')).join('');
const meter = (n: number, total = 9, w = 20, h = 56) =>
  Array.from({ length: total }, (_, i) => `<i style="display:inline-block;width:${w}px;height:${h}px;border-radius:8px;border:4px solid ${INK};margin-right:6px;background:${i < n ? YEL : 'transparent'};opacity:${i < n ? 1 : 0.35}"></i>`).join('');
const title = (t: string, top: number, size: number, color = INK, shadow = CREAM) =>
  `<div class="ab" style="left:50px;right:50px;top:${top}px;text-align:center;font:900 ${size}px/.98 'Fraunces',serif;color:${color};text-shadow:0 ${Math.round(size / 14)}px 0 ${shadow}">${t}</div>`;

/* ========================================= 1 ANNOUNCEMENT ========================================= */
const ring = 'A HALAL SNACK PACK WITH OPINIONS ABOUT YOUR MONEY • ';
posts.push({
  id: 't1-announce',
  html: `<section class="post" id="t1-announce">
<svg class="full" viewBox="0 0 ${W} ${H}"><defs><radialGradient id="t1g" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="#FF6A52"/><stop offset="1" stop-color="#B8221A"/></radialGradient>
  <path id="t1ring" d="M540 160 a400 400 0 1 1 -0.1 0"/></defs>
  <rect width="${W}" height="${H}" fill="url(#t1g)"/>
  ${rays(540, 560, 18, 1400, 'rgba(255,255,255,.07)')}
  ${dots(30, 1180, 9, 6, 34, 9, '#FFD23F', 0.35)}
  ${dots(1050, 70, 9, 6, -34, 9, '#FFD23F', 0.35)}
  <circle cx="540" cy="560" r="438" fill="${YEL}" stroke="${INK}" stroke-width="10"/>
  <circle cx="540" cy="560" r="400" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="2 14" stroke-linecap="round"/>
  <text font-family="Bricolage" font-weight="800" font-size="46" fill="${INK}"><textPath href="#t1ring" textLength="2440" lengthAdjust="spacing">${ring}</textPath></text>
  ${spark(170, 310, 44)}${spark(930, 840, 36, CREAM)}${spark(900, 240, 26, CREAM)}
</svg>
${mas('ok', 9, 'left:225px;top:262px;width:630px;filter:drop-shadow(0 22px 0 rgba(36,18,10,.25))')}
<div class="kick" style="top:46px;font-size:28px;color:${CREAM}">INTRODUCING</div>
<div class="ab" style="left:300px;top:1010px;width:480px;filter:drop-shadow(0 8px 0 ${INK})">${WM()}</div>
<div class="ab" style="left:0;right:0;top:1192px;text-align:center"><span class="pill">COMING SOON TO iPHONE</span></div>
<div class="ab" style="left:0;right:0;top:1300px;text-align:center;font:800 34px/1 'Bricolage';letter-spacing:.04em;color:${CREAM}">Free. No bank login. No ads.</div>
</section>`,
});

/* ========================================= 2 PRICE LIST ========================================= */
const row = (name: string, price: string, hsp: string) => `
<div style="display:flex;align-items:flex-end;gap:16px;height:106px;border-bottom:0">
  <div style="flex:none"><div style="font:800 46px/1 'Bricolage';color:${CREAM}">${name}</div><div style="margin-top:8px;font:700 30px/1 'DM',sans-serif;color:#C9B8A6">${price}</div></div>
  <div style="flex:1;border-bottom:6px dotted rgba(255,246,230,.35);margin-bottom:14px"></div>
  <div style="flex:none;text-align:right;display:flex;align-items:flex-end;gap:10px"><span style="font:900 84px/.8 'Bricolage';letter-spacing:-.03em;color:${YEL};text-shadow:0 0 22px rgba(255,210,63,.55)">${hsp}</span><span style="font:800 30px/1 'Bricolage';color:${YEL};margin-bottom:6px">HSP</span></div>
</div>`;
const bulbs = Array.from({ length: 28 }, (_, i) => {
  const t = i / 28;
  const [x, y] = t < 0.25 ? [60 + t * 4 * 960, 60] : t < 0.5 ? [1020, 60 + (t - 0.25) * 4 * 1180] : t < 0.75 ? [1020 - (t - 0.5) * 4 * 960, 1240] : [60, 1240 - (t - 0.75) * 4 * 1180];
  return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="13" fill="${i % 2 ? '#FFF1B0' : YEL}" stroke="${INK}" stroke-width="5"/><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="34" fill="${YEL}" opacity=".18"/>`;
}).join('');
posts.push({
  id: 't2-pricelist',
  html: `<section class="post" id="t2-pricelist">
<svg class="full" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="t2w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7A4A2B"/><stop offset="1" stop-color="#4A2A17"/></linearGradient>
  <radialGradient id="t2b" cx="50%" cy="30%" r="80%"><stop offset="0" stop-color="#2D211B"/><stop offset="1" stop-color="#140D0A"/></radialGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#t2w)"/>
  <g stroke="#3B2112" stroke-width="3" opacity=".6">${Array.from({ length: 24 }, (_, i) => `<path d="M0 ${i * 62 + 10}H${W}"/>`).join('')}</g>
  <rect x="40" y="40" width="1000" height="1220" rx="34" fill="url(#t2b)" stroke="${INK}" stroke-width="12"/>
  ${bulbs}
</svg>
<div class="ab" style="left:0;right:0;top:112px;text-align:center;font:800 28px/1 'Bricolage';letter-spacing:.34em;color:${YEL}">THE PRICE LIST</div>
<div class="ab" style="left:60px;right:60px;top:156px;text-align:center;font:900 100px/.98 'Fraunces',serif;color:${CREAM};text-shadow:0 0 28px rgba(255,246,230,.4)">Everything costs <span style="color:${YEL};font-style:italic;text-shadow:0 0 30px rgba(255,210,63,.6)">snack packs.</span></div>
<div class="ab" style="left:92px;right:92px;top:416px">
${row('Sneakers', '$179', '9.9')}${row('Headphones', '$249', '14')}${row('Ride across town', '$38', '2.1')}${row('Myki top up', '$22', '1.2')}${row('Streaming sub', '$15.99 a month', '0.9')}${row('Boba', '$9', '0.5')}
</div>
<div class="ab" style="right:64px;top:1138px;transform:rotate(-5deg);background:${CREAM};border:6px solid ${INK};border-radius:18px;padding:12px 24px;font:900 44px/1 'Bricolage';color:${INK};box-shadow:6px 7px 0 ${INK}">1 HSP = $18</div>
<div class="ab ic" style="left:70px;top:1100px;width:130px;transform:rotate(-8deg);filter:drop-shadow(0 8px 0 rgba(0,0,0,.4))">${I('hsp')}</div>
${foot(1306)}
</section>`,
});

/* ========================================= 3 THE ROAST ========================================= */
const roast = (chip: string, line: string, top: number, side: 'l' | 'r', rot: number) => `
<div class="ab" style="${side === 'l' ? 'left:56px' : 'right:56px'};top:${top}px;width:720px;transform:rotate(${rot}deg)">
  <div style="position:absolute;${side === 'l' ? 'left:24px' : 'right:24px'};top:-34px;z-index:2;display:inline-block;background:${INK};color:${CREAM};border-radius:999px;padding:10px 26px;font:800 36px/1 'Bricolage';white-space:nowrap">${chip}</div>
  <div style="background:#FFFDF6;border:7px solid ${INK};border-radius:44px;padding:44px 40px 30px;font:800 40px/1.2 'Bricolage';color:${INK};box-shadow:10px 12px 0 ${INK}">${line}</div>
  <svg style="position:absolute;${side === 'l' ? 'right:70px' : 'left:70px'};bottom:-38px" width="60" height="44" viewBox="0 0 60 44"><path d="M4 2 L30 40 L56 2" fill="#FFFDF6" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/><path d="M0 0 H60" stroke="#FFFDF6" stroke-width="14"/></svg>
</div>`;
posts.push({
  id: 't3-roast',
  html: `<section class="post" id="t3-roast">
<svg class="full" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${YEL}"/>${rays(540, 1380, 16, 1800, 'rgba(255,255,255,.22)')}${dots(36, 1170, 8, 6, 34, 9, INK, 0.12)}${dots(1050, 400, 7, 6, -34, 9, INK, 0.1)}${spark(960, 120, 34, CREAM)}${spark(100, 360, 26, CREAM)}</svg>
${title('Log a buy.<br><span style="color:' + RED + ';font-style:italic">Get roasted.</span>', 62, 112)}
${roast('-0.4 HSP &nbsp;$6.50', 'Melbourne runs on coffee and tram delays, and you are paying for both.', 400, 'l', -2)}
${roast('-2.1 HSP &nbsp;$38', 'There is a tram. It goes there. It costs $2.', 668, 'r', 2)}
${roast('-1.8 HSP &nbsp;$32', 'Delivery fee, service fee, small order fee, and it is 14 degrees. Lazy tax, collected.', 900, 'l', -1.5)}
${mas('sideeye', 6, 'left:720px;top:1006px;width:330px;transform:scaleX(-1);filter:drop-shadow(0 14px 0 rgba(36,18,10,.28))')}
<div class="ab" style="left:56px;top:1296px;display:flex;align-items:center;gap:22px"><div style="width:180px;filter:drop-shadow(0 4px 0 ${INK})">${WM()}</div><span class="pill" style="font-size:28px;padding:12px 24px">COMING SOON TO iPHONE</span></div>
</section>`,
});

/* ========================================= 4 THE FRIDGE ========================================= */
posts.push({
  id: 't4-fridge',
  html: `<section class="post" id="t4-fridge">
<svg class="full" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="t4w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6FB9EC"/><stop offset="1" stop-color="#2F7FC8"/></linearGradient>
  <radialGradient id="t4g" cx="68%" cy="62%" r="50%"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".55"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#t4w)"/><rect width="${W}" height="${H}" fill="url(#t4g)"/>
  ${dots(30, 520, 8, 8, 34, 9, '#FFFFFF', 0.3)}
  ${spark(120, 380, 34, CREAM)}${spark(980, 520, 26, CREAM)}
  <rect x="-20" y="1190" width="1120" height="260" fill="#1F5E9C" stroke="${INK}" stroke-width="8"/>
  <ellipse cx="800" cy="1196" rx="250" ry="26" fill="#000" opacity=".25"/>
  <g transform="translate(90 192) scale(.85)">
    <path d="M600 420 Q600 380 640 380 H960 Q1000 380 1000 420 V1190 H600Z" fill="#F7F1DE" stroke="${INK}" stroke-width="14" stroke-linejoin="round"/>
    <path d="M600 700 H1000" stroke="${INK}" stroke-width="14"/>
    <path d="M622 432 V1170" stroke="#fff" stroke-width="16" opacity=".8" stroke-linecap="round"/>
    <rect x="948" y="440" width="24" height="200" rx="12" fill="#C9CFD8" stroke="${INK}" stroke-width="8"/><rect x="948" y="750" width="24" height="240" rx="12" fill="#C9CFD8" stroke="${INK}" stroke-width="8"/>
    <rect x="650" y="430" width="270" height="130" rx="14" fill="${INK}"/>
    <text x="785" y="468" text-anchor="middle" font-family="Liberation Mono" font-weight="700" font-size="21" letter-spacing="5" fill="#FF9C90">COOLING OFF</text>
    <text x="785" y="534" text-anchor="middle" font-family="Liberation Mono" font-weight="700" font-size="52" fill="#FF4B3A" style="filter:drop-shadow(0 0 12px #FF4B3A)">23:59:59</text>
  </g>
</svg>
<div class="ab ic" style="left:640px;top:690px;width:112px;transform:rotate(-8deg)">${I('hsp')}</div>
<div class="ab" style="left:766px;top:712px;background:#FFF08A;border:5px solid ${INK};padding:10px 14px;transform:rotate(4deg);font:800 27px/1.1 'Bricolage';color:${INK};box-shadow:5px 6px 0 rgba(36,18,10,.3)">WAIT<br>24H.<br><span class="mono" style="font:700 17px 'Liberation Mono',monospace">still want it?</span></div>
<div class="ab ic" style="left:60px;top:640px;width:240px;transform:rotate(-10deg);filter:drop-shadow(0 12px 0 rgba(0,0,0,.25))">${I('sneaker')}</div>
<div class="ab" style="left:60px;top:604px;background:#fff;border:5px solid ${INK};border-radius:14px;padding:6px 14px;transform:rotate(-6deg);font:800 34px/1 'Bricolage';color:${INK}">$179 &middot; 9.9 HSP</div>
<div class="ab ic" style="left:318px;top:610px;width:220px;transform:rotate(8deg);filter:drop-shadow(0 12px 0 rgba(0,0,0,.25))">${I('headphones')}</div>
${mas('tempted', 6, 'left:100px;top:820px;width:400px;filter:drop-shadow(8px 0 0 rgba(255,255,255,.4)) drop-shadow(0 18px 0 rgba(0,0,0,.25))')}
<div class="kick" style="top:60px;font-size:26px;color:${INK};text-shadow:none">THE COOLING-OFF FRIDGE</div>
<div class="ab" style="left:0;right:0;top:110px;text-align:center;font:900 124px/.98 'Fraunces',serif;color:${CREAM};-webkit-text-stroke:7px ${INK};paint-order:stroke fill;text-shadow:0 9px 0 ${INK}">Put it in<br><span style="color:${YEL}">the fridge.</span></div>
<div class="ab" style="left:60px;right:60px;top:392px;text-align:center;font:italic 800 42px/1.12 'Fraunces',serif;color:${INK}">Big wants cool off for 24 hours.<br>Still want it? Then it's yours.</div>
<div class="ab" style="left:56px;top:1226px;display:flex;gap:20px"><div style="background:${YEL};border:7px solid ${INK};border-radius:40px;padding:14px 38px;font:800 38px/1 'Bricolage';color:${INK};box-shadow:0 8px 0 ${INK}">Ditch it</div><div style="background:#FFFDF6;border:7px solid ${INK};border-radius:40px;padding:14px 38px;font:800 38px/1 'Bricolage';color:${INK};box-shadow:0 8px 0 ${INK}">Cave in</div></div>
<div class="ab" style="right:56px;top:1232px"><span class="pill" style="font-size:28px;padding:12px 24px">COMING SOON TO iPHONE</span></div>
</section>`,
});

/* ========================================= 5 FRIES BY MOOD ========================================= */
const cell = (n: number, mood: string, bg: string, quip: string, x: number, y: number, rot: number) => `
<div class="ab" style="left:${x}px;top:${y}px;width:480px;height:420px;background:${bg};border:7px solid ${INK};border-radius:40px;box-shadow:10px 12px 0 ${INK};transform:rotate(${rot}deg);overflow:hidden">
  <div class="mas" style="position:absolute;left:14px;top:20px;width:250px;filter:drop-shadow(0 12px 0 rgba(36,18,10,.2))">${M(mood as any, n)}</div>
  <div style="position:absolute;right:26px;top:26px;text-align:right"><div style="font:900 190px/.8 'Bricolage';letter-spacing:-.05em;color:${INK}">${n}</div><div style="margin-top:10px;font:800 24px/1 'Bricolage';letter-spacing:.18em;color:rgba(36,18,10,.65)">FRIES LEFT</div></div>
  <div style="position:absolute;left:24px;top:272px;white-space:nowrap">${meter(n, 9, 17, 40)}</div>
  <div style="position:absolute;left:22px;right:22px;bottom:18px;font:italic 800 31px/1.15 'Fraunces',serif;color:${INK}">${quip}</div>
</div>`;
posts.push({
  id: 't5-fries',
  html: `<section class="post" id="t5-fries">
<svg class="full" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#FFF3DC"/>${dots(30, 80, 9, 6, 34, 9, YEL, 0.5)}${dots(1050, 1180, 9, 5, -34, 9, YEL, 0.5)}</svg>
<div class="kick" style="top:56px;font-size:26px;color:#B3261E;text-shadow:none">BROKEY'S MOOD IS YOUR BUDGET</div>
${title('9 fries a week.<br><span style="color:' + RED + ';font-style:italic">Make them last.</span>', 108, 108, INK, '#FFE7A8')}
${cell(9, 'happy', '#CFEFD0', 'Crispy fries, healthy wallet. Love that for us.', 40, 380, -1.5)}
${cell(6, 'ok', '#FFFFFF', 'Mid week, mid budget, mid energy.', 560, 396, 1.5)}
${cell(3, 'sad', '#FFD3BF', 'Fries are getting scarce, bestie.', 40, 830, 1.2)}
${cell(0, 'broke', '#E4DACB', 'Congrats, you ate the whole HSP.', 560, 846, -1.2)}
${foot(1316)}
</section>`,
});

/* ========================================= 6 HSP RECEIPT ========================================= */
const zig = (w: number, h: number, step = 24, depth = 16) => {
  const pts = [`0,0`, `${w},0`];
  for (let x = w; x >= 0; x -= step) { pts.push(`${x},${h}`, `${x - step / 2},${h - depth}`); }
  return `polygon(${pts.map((p) => p.split(',').map((v, i) => (i === 0 ? `${v}px` : `${v}px`)).join(' ')).join(',')})`;
};
const rl = (l: string, r: string, bold = false) => `<div style="display:flex;justify-content:space-between;font:${bold ? 700 : 400} 29px/1.5 'Liberation Mono',monospace;color:${INK}"><span>${l}</span><span>${r}</span></div>`;
const barcode = Array.from({ length: 46 }, (_, i) => `<i style="display:inline-block;height:70px;width:${[3, 6, 4, 8, 3, 5][i % 6]}px;margin-right:${[4, 3, 5, 3, 6, 4][(i * 7) % 6]}px;background:${INK}"></i>`).join('');
posts.push({
  id: 't6-receipt',
  html: `<section class="post" id="t6-receipt">
<svg class="full" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#F7A5B8"/>${rays(540, 900, 18, 1500, 'rgba(255,255,255,.14)')}${dots(30, 1190, 9, 6, 34, 9, INK, 0.1)}${spark(120, 330, 34, YEL)}${spark(960, 1090, 30, CREAM)}</svg>
${title('Your month,<br><span style="color:' + RED + ';font-style:italic">on a receipt.</span>', 56, 108, INK, '#FFD3DD')}
<div class="ab" style="left:210px;top:340px;width:660px;transform:rotate(3deg);filter:drop-shadow(14px 16px 0 rgba(36,18,10,.35))">
  <div style="background:#FFFDF6;padding:34px 44px 56px;clip-path:${zig(660, 916)};height:916px;border-top:0">
    <div style="text-align:center"><div class="mas" style="width:150px;margin:0 auto">${M('happy', 9)}</div>
      <div style="margin-top:6px;font:700 52px/1 'Liberation Mono',monospace;letter-spacing:.22em;color:${INK}">BROKEY</div>
      <div style="margin-top:8px;font:700 26px/1 'Liberation Mono',monospace;letter-spacing:.2em;color:${INK}">HSP RECEIPT</div>
      <div style="margin-top:6px;font:400 22px/1 'Liberation Mono',monospace;letter-spacing:.14em;color:#7A6552">ORDER OF ONE MONTH</div></div>
    <div style="margin-top:22px;border-top:3px dashed ${INK};padding-top:14px">${rl('FOOD  x2', '$32.50')}${rl('BASICS  x1', '$22.00')}${rl('TREATS  x1', '$6.50')}</div>
    <div style="margin-top:8px;border-top:3px dashed ${INK};padding-top:10px">${rl('SUBTOTAL', '$61.00', true)}${rl('1 HSP = $18.00', '')}${rl('HSPS EATEN', '3.4', true)}${rl('HOURS OF WORK', '2.2 h')}${rl('NO-SPEND DAYS', '18')}${rl('REGRETTED', '0 of 1')}</div>
    <div style="position:relative;height:96px"><div style="position:absolute;left:150px;top:12px;transform:rotate(-5deg);border:6px solid #2E9E5B;border-radius:12px;padding:6px 18px;font:700 36px/1 'Liberation Mono',monospace;letter-spacing:.14em;color:#2E9E5B">ON BUDGET</div></div>
    <div style="text-align:center;white-space:nowrap;overflow:hidden">${barcode}</div>
    <div style="margin-top:10px;text-align:center;font:400 22px/1 'Liberation Mono',monospace;letter-spacing:.12em;color:#7A6552">YOUR FRIES SAY HI.</div>
  </div>
</div>
${foot(1318)}
</section>`,
});

/* ========================================= 7 THE APP ========================================= */
const phone = (img: string, left: number, top: number, w: number, rot: number, z = 1) =>
  `<div class="ab" style="left:${left}px;top:${top}px;width:${w}px;height:${Math.round(w * 2.173)}px;border:11px solid #FFF6E6;outline:4px solid ${INK};border-radius:${Math.round(w * 0.16)}px;overflow:hidden;background:${INK};transform:rotate(${rot}deg);z-index:${z};box-shadow:14px 18px 0 rgba(0,0,0,.45)"><img src="file://${root}/store/raw/${img}" style="width:100%;height:100%;object-fit:cover;display:block"></div>`;
posts.push({
  id: 't7-app',
  html: `<section class="post" id="t7-app">
<svg class="full" viewBox="0 0 ${W} ${H}"><defs><radialGradient id="t7g" cx="50%" cy="58%" r="70%"><stop offset="0" stop-color="#FFB400" stop-opacity=".9"/><stop offset=".5" stop-color="#C2410C" stop-opacity=".45"/><stop offset="1" stop-color="#2A1A12" stop-opacity="0"/></radialGradient></defs>
  <rect width="${W}" height="${H}" fill="#2A1A12"/><rect width="${W}" height="${H}" fill="url(#t7g)"/>${rays(540, 800, 20, 1400, 'rgba(255,210,63,.07)')}${dots(30, 1200, 9, 5, 34, 9, YEL, 0.3)}${spark(90, 400, 30, YEL)}${spark(990, 330, 26, CREAM)}</svg>
<div class="ab" style="left:330px;top:56px;width:420px">${WM()}</div>
<div class="ab" style="left:0;right:0;top:206px;text-align:center;font:900 76px/1 'Fraunces',serif;color:${CREAM};text-shadow:0 6px 0 rgba(0,0,0,.5)">Coming soon to <span style="color:${YEL};font-style:italic">iPhone.</span></div>
${phone('2-roast.png', 30, 520, 330, -8, 1)}
${phone('3-chill.png', 720, 520, 330, 8, 1)}
${phone('1-home.png', 336, 380, 408, 0, 3)}
<div class="ab" style="left:0;right:0;top:1272px;text-align:center"><span class="pill">Prices in snack packs</span></div>
<div class="ab" style="left:0;right:0;top:1360px;text-align:center;font:800 28px/1 'Bricolage';letter-spacing:.16em;color:${CREAM};opacity:.85">FREE &middot; NO BANK LOGIN &middot; NO ADS</div>
</section>`,
});

/* ---- write ---- */
const out = path.join(root, 'social', 'teasers');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'posts.html'), `<!doctype html><html><head><meta charset="utf-8"><title>Brokey teasers</title><style>${CSS}</style></head><body>${posts.map((p) => p.html).join('\n')}</body></html>`);
fs.writeFileSync(path.join(out, 'posts.json'), JSON.stringify(posts.map((p) => ({ id: p.id, cel: p.cel ?? {} })), null, 1));
console.log(`${posts.length} posts -> social/teasers/posts.html`);
