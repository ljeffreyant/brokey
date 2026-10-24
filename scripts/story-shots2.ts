/** Shots for Part 2 and Part 3 of "The Broke Apocalypse". Same rules as story-shots.ts: parallax layers at 1080x1920, ids rewritten per instance. */
import { M, I, LOGO, WM, INK, zombie, palm, city } from './story-art';
import { ShotOpts, r, stripes, stars, BK } from './story-shots';

export const SHOTS: Record<string, (o: ShotOpts) => string> = {};

/** googly eyes for objects that came alive */
const eyes = (x: number, y: number, w: number, id: string, calm = false) => `
<svg class="ab" id="${id}" style="left:${x}px;top:${y}px;width:${w}px;overflow:visible" viewBox="0 0 100 52">
  ${calm
    ? `<path d="M8 32 q17 -26 34 0 M58 32 q17 -26 34 0" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>`
    : `<g stroke="${INK}" stroke-width="4"><ellipse cx="25" cy="26" rx="20" ry="23" fill="#FFF6E6"/><ellipse cx="75" cy="26" rx="20" ry="23" fill="#FFF6E6"/></g>
  <circle cx="31" cy="30" r="9" fill="${INK}"/><circle cx="69" cy="30" r="9" fill="${INK}"/><circle cx="34" cy="26" r="3" fill="#fff"/><circle cx="72" cy="26" r="3" fill="#fff"/>
  <path d="M2 -2 L46 10 M98 -2 L54 10" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`}</svg>`;

const bubble = (id: string, x: number, y: number, w: number, text: string, size = 56, tail: 'l' | 'r' | 'b' = 'b') => `
<div class="ab" id="${id}" style="left:${x}px;top:${y}px;width:${w}px;opacity:0;transform-origin:50% 100%">
  <div style="background:#FFFDF6;border:8px solid ${INK};border-radius:44px;padding:22px 30px 26px;box-shadow:10px 12px 0 ${INK};font:800 ${size}px/1.05 'Bricolage';letter-spacing:-.03em;color:${INK};text-align:center">${text}</div>
  <svg viewBox="0 0 100 70" style="position:absolute;${tail === 'r' ? 'right:50px' : 'left:' + (tail === 'l' ? '50' : '40') + 'px'};bottom:-58px;width:84px"><path d="M8 0 L92 0 L36 62Z" fill="#FFFDF6" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/><path d="M4 0 H96" stroke="#FFFDF6" stroke-width="16"/></svg></div>`;

const whisper = (id: string, x: number, y: number, text: string) => `<div class="ab" id="${id}" style="left:${x}px;top:${y}px;opacity:0;font:italic 800 54px/1 'Fraunces',serif;color:#FFE3E8;text-shadow:0 0 20px rgba(255,90,130,.95),0 4px 0 rgba(36,18,10,.9);letter-spacing:.02em;white-space:nowrap">${text}</div>`;

/* ============ fridgeopen: the door swings open on its own ============ */
SHOTS.fridgeopen = (o) => `
<div class="L" data-z="0.2"><svg class="full" viewBox="0 0 1080 1920">
  <defs><linearGradient id="fo-w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2B3470"/><stop offset="1" stop-color="#171A44"/></linearGradient></defs>
  <rect width="1080" height="1920" fill="url(#fo-w)"/>${stripes('#8EA0FF', 0.09, 10, 1500)}
  <rect x="-20" y="1500" width="1120" height="440" fill="#1A1838" stroke="${INK}" stroke-width="8"/></svg></div>
<div class="L" data-z="0.5"><svg class="full" viewBox="0 0 1080 1920">
  <defs>
    <radialGradient id="fo-g" cx="50%" cy="46%" r="70%"><stop offset="0" stop-color="#FFF6F2"/><stop offset=".45" stop-color="#FF9AA8"/><stop offset="1" stop-color="#D6334E"/></radialGradient>
  </defs>
  <path d="M110 350 Q110 306 154 306 H926 Q970 306 970 350 V1530 H110Z" fill="#EFE8D4" stroke="${INK}" stroke-width="12" stroke-linejoin="round"/>
  <rect x="164" y="372" width="752" height="1086" rx="14" fill="url(#fo-g)" stroke="${INK}" stroke-width="10"/>
  <g stroke="${INK}" stroke-width="10"><rect x="164" y="690" width="752" height="26" fill="#FFD9DE" opacity=".9"/><rect x="164" y="1010" width="752" height="26" fill="#FFD9DE" opacity=".9"/><rect x="164" y="1300" width="752" height="26" fill="#FFD9DE" opacity=".9"/></g>
  <path d="M190 700 H890 M190 1020 H890" stroke="#fff" stroke-width="8" opacity=".7" stroke-linecap="round"/>
</svg></div>
<div class="glow" id="fglow" style="left:80px;top:300px;width:920px;height:1200px;background:radial-gradient(ellipse at 50% 50%,rgba(255,120,150,.6),transparent 70%)"></div>
<div class="L" data-z="0.7" id="things">
  <div class="ab" id="snk" style="left:210px;top:476px;width:290px;transform-origin:50% 100%">${I('sneaker')}${eyes(85, 60, 124, 'snkeyes')}</div>
  <div class="ab" id="hph" style="left:580px;top:466px;width:290px;transform-origin:50% 100%">${I('headphones')}${eyes(83, 104, 126, 'hpheyes')}</div>
  <div class="ab" style="left:200px;top:790px;width:200px;transform:rotate(-6deg);opacity:.95">${I('pizza')}</div>
  <div class="ab" style="left:700px;top:810px;width:200px;transform:rotate(6deg);opacity:.95">${I('taco')}</div>
  <div class="ab" style="left:440px;top:1060px;width:210px;opacity:.95">${I('beer')}</div>
  ${whisper('w1', 190, 414, 'buy us.')}
  ${whisper('w2', 500, 414, 'you deserve us.')}
</div>
<div class="L" data-z="1.05" id="fdoorpanel"><svg class="full" viewBox="0 0 1080 1920">
  <path d="M970 306 L1120 250 V1640 L970 1530Z" fill="#F4EEDC" stroke="${INK}" stroke-width="12" stroke-linejoin="round"/>
  <path d="M990 380 L1090 340 V1500 L990 1440Z" fill="#FFFDF6" opacity=".7"/>
  <g stroke="${INK}" stroke-width="7" fill="#FF9AA8"><rect x="1000" y="520" width="80" height="22" transform="skewY(-10)"/><rect x="1000" y="800" width="80" height="22" transform="skewY(-10)"/></g></svg></div>
<div class="L" data-z="1.2">${BK(o, 'left:350px;top:1130px;width:400px;filter:drop-shadow(0 0 28px rgba(255,120,150,.8)) drop-shadow(0 18px 0 rgba(0,0,0,.35));transform-origin:50% 100%')}</div>
<div class="shade" id="dark" style="left:0;top:0;width:1080px;height:1920px;background:radial-gradient(ellipse at 50% 42%,rgba(255,255,255,1) 0,rgba(170,160,200,1) 60%,rgba(70,60,120,1) 100%)"></div>`;

/* ============ lifecycle: how a want becomes a zombie ============ */
const panel = (id: string, y: number, word: string, sub: string, art: string, tone: string) => `
<div class="ab" id="${id}" style="left:70px;top:${y}px;width:940px;height:204px;border:8px solid ${INK};border-radius:34px;background:${tone};box-shadow:12px 14px 0 ${INK};opacity:0;overflow:hidden">
  <div style="position:absolute;left:34px;top:26px;font:800 88px/.9 'Bricolage';letter-spacing:-.04em;color:${INK}">${word}</div>
  <div style="position:absolute;left:38px;top:128px;font:700 26px/1.2 'Liberation Mono',monospace;color:${INK};opacity:.8">${sub}</div>
  <div style="position:absolute;right:20px;top:4px;width:360px;height:184px">${art}</div></div>`;
SHOTS.lifecycle = () => `
<div class="L" data-z="0.2"><svg class="full" viewBox="0 0 1080 1920">
  <defs><linearGradient id="lc-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A2A8C"/><stop offset="1" stop-color="#150E3A"/></linearGradient></defs>
  <rect width="1080" height="1920" fill="url(#lc-b)"/>
  <g>${[[90, 520, 110, '#FF6E8A'], [980, 760, 90, '#6EE1FF'], [60, 1180, 90, '#FFB05A'], [1000, 1280, 120, '#FFD23F']].map(([x, y, rr, c]) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="${c}" opacity=".4"/>`).join('')}</g></svg></div>
<div class="L" data-z="0.8">
  ${panel('p0', 372, 'WANT', '3 a.m. "i need these"', `<div class="ab" style="left:60px;top:20px;width:190px">${I('sneaker')}</div><svg class="ab" style="left:250px;top:30px;width:90px" viewBox="0 0 90 90"><path d="M45 80 C5 50 6 18 28 14 C38 12 45 20 45 26 C45 20 52 12 62 14 C84 18 85 50 45 80Z" fill="#FF5A47" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/></svg>`, '#FFE79A')}
  ${panel('p1', 600, 'BUY', 'tap. paid. gone.', `<div class="ab" style="left:20px;top:34px;width:320px;height:128px;border:7px solid ${INK};border-radius:20px;background:#FFFDF6;text-align:center"><div style="font:800 62px/1.35 'Bricolage';color:${INK}">$129.00</div></div><div class="ab" style="left:190px;top:100px;border:7px solid #E7261B;color:#E7261B;border-radius:12px;padding:2px 16px;font:800 44px/1.1 'Bricolage';transform:rotate(-12deg);background:rgba(255,253,246,.85)">PAID</div>`, '#BFE9FF')}
  ${panel('p2', 828, 'FORGET', '3 months later. still in the box.', `<svg class="ab" style="left:20px;top:20px;width:320px" viewBox="0 0 320 170"><rect x="30" y="50" width="260" height="110" rx="10" fill="#D2A878" stroke="${INK}" stroke-width="8"/><rect x="20" y="30" width="280" height="40" rx="8" fill="#E3BD8E" stroke="${INK}" stroke-width="8"/><path d="M30 50 L100 6 M100 6 L60 50 M100 6 L130 50 M100 6 L90 50" stroke="#fff" stroke-width="4" opacity=".8" fill="none"/><text x="160" y="120" text-anchor="middle" font-family="Liberation Mono" font-weight="700" font-size="26" fill="${INK}">JULY</text></svg>`, '#D9D3FF')}
  ${panel('p3', 1056, 'ZOMBIE', 'it never forgets you.', `<div class="ab zz" style="left:-20px;top:30px;width:400px">${zombie('THE SNEAKER CLUB', '$9.99/mo')}</div>`, '#C9F0B0')}
</div>
<div class="L" data-z="0.85"><svg class="full" viewBox="0 0 1080 1920" id="arrows">
  ${[0, 1, 2].map((i) => `<g class="ar" style="opacity:0"><path d="M${540} ${566 + i * 228} V${606 + i * 228} M514 ${590 + i * 228} L540 ${618 + i * 228} L566 ${590 + i * 228}" stroke="${INK}" stroke-width="22" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M${540} ${566 + i * 228} V${606 + i * 228} M514 ${590 + i * 228} L540 ${618 + i * 228} L566 ${590 + i * 228}" stroke="#FF5A47" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`).join('')}</svg></div>`;

/* ============ choice: do I still want it? ============ */
const confetti = (n: number) => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * Math.PI * 2, c = ['#FF5A47', '#FFD23F', '#6EE1FF', '#FF6E8A', '#7CE08A'][i % 5];
  return `<i class="cf" data-a="${a.toFixed(3)}" data-s="${(0.6 + ((i * 37) % 10) / 12).toFixed(2)}" style="position:absolute;left:150px;top:150px;width:18px;height:26px;background:${c};border:4px solid ${INK};border-radius:5px;opacity:0"></i>`;
}).join('');
SHOTS.choice = (o) => `
<div class="L" data-z="0.2"><svg class="full" viewBox="0 0 1080 1920">
  <defs><radialGradient id="ch-g" cx="22%" cy="40%" r="80%"><stop offset="0" stop-color="#FFB5C2"/><stop offset=".4" stop-color="#7E5AB8"/><stop offset="1" stop-color="#1B1646"/></radialGradient></defs>
  <rect width="1080" height="1920" fill="url(#ch-g)"/>${stripes('#C7CBFF', 0.1, 10, 1500)}
  <path d="M-20 1380 H1100 V1920 H-20Z" fill="#2A2056" stroke="${INK}" stroke-width="8"/>
  <path d="M-20 360 L260 330 V1380 H-20Z" fill="#F4EEDC" stroke="${INK}" stroke-width="10"/><path d="M60 420 L220 400 V1300 L60 1320Z" fill="#FF9AA8" opacity=".9"/></svg></div>
<div class="L" data-z="0.7">
  ${o.empty ? '' : `<div class="ab" id="snk" style="left:80px;top:830px;width:360px;transform-origin:50% 100%">${I('sneaker')}${eyes(110, 70, 150, 'snkeyes')}
    <div class="ab" id="cfwrap" style="left:0;top:0;width:360px;height:300px;pointer-events:none">${confetti(24)}</div></div>`}
  <div class="ab" id="hph" style="left:660px;top:820px;width:340px;transform-origin:50% 100%">${I('headphones')}<span id="hpe1">${eyes(100, 112, 140, 'hpheyes')}</span><span id="hpe2" style="opacity:0">${eyes(100, 112, 140, 'hpheyes2', true)}</span></div>
</div>
<div class="L" data-z="0.95">${BK(o, 'left:320px;top:700px;width:440px;filter:drop-shadow(0 20px 0 rgba(0,0,0,.35)) drop-shadow(-8px 0 0 rgba(255,170,190,.5));transform-origin:50% 100%')}</div>
<div class="L" data-z="1.0">
  ${bubble('sayno', 120, 420, 300, 'No.', 90, 'l')}
  ${bubble('sayyes', 640, 420, 360, '...yes.', 84, 'r')}
  <div class="ab" id="lcdc" style="left:300px;top:392px;width:480px;background:${INK};border:6px solid #090403;border-radius:22px;padding:10px 0 6px;text-align:center"><div style="font:700 20px/1 'Liberation Mono',monospace;letter-spacing:.2em;color:#FF9C90">COOLING OFF</div><div style="font:700 74px/1.05 'Liberation Mono',monospace;color:#7CE08A;text-shadow:0 0 20px rgba(124,224,138,.7)">00:00:00</div></div>
</div>`;

/* ============ notif: the phone lights up ============ */
SHOTS.notif = (o) => `
<div class="L" data-z="0.2"><svg class="full" viewBox="0 0 1080 1920">
  <defs><radialGradient id="nf-g" cx="50%" cy="78%" r="75%"><stop offset="0" stop-color="#6EA8FF"/><stop offset=".35" stop-color="#2D3A92"/><stop offset="1" stop-color="#080616"/></radialGradient></defs>
  <rect width="1080" height="1920" fill="url(#nf-g)"/></svg></div>
<div class="L" data-z="0.9">${BK(o, 'left:290px;top:830px;width:500px;filter:drop-shadow(0 -10px 0 rgba(120,180,255,.6)) drop-shadow(0 20px 0 rgba(0,0,0,.4));transform-origin:50% 100%')}</div>
<div class="L" data-z="1.0"><div class="ab" id="ncard" style="left:70px;top:372px;width:940px;opacity:0;transform-origin:50% 0">
  <div style="background:#FFFDF6;border:9px solid ${INK};border-radius:48px;padding:34px 40px 36px;box-shadow:14px 16px 0 ${INK}">
    <div style="font:800 44px/1 'Bricolage';color:#6B2FD6;letter-spacing:-.02em">STREAMIN+ <span style="font:700 26px 'Liberation Mono',monospace;color:#7A5A44">now</span></div>
    <div style="margin-top:14px;font:800 62px/1.02 'Bricolage';letter-spacing:-.035em;color:${INK}">Your free trial has been upgraded!</div>
    <div style="margin-top:18px;font:800 96px/1 'Bricolage';letter-spacing:-.05em;color:#E7261B">$189.99 <span style="font:800 44px 'Bricolage';color:${INK}">/ year</span></div>
    <div style="margin-top:12px;font:700 30px/1.2 'Liberation Mono',monospace;color:${INK}">Billing starts in <b id="ncount" style="color:#E7261B">24:00:00</b></div></div></div></div>
<div class="glow" id="nflash" style="left:0;top:0;width:1080px;height:1920px;background:radial-gradient(ellipse at 50% 80%,rgba(255,60,50,.0),rgba(255,40,40,.8));opacity:0"></div>`;

/* ============ boss: the annual plan ============ */
SHOTS.boss = (o) => `
<div class="L" data-z="0.2"><svg class="full" viewBox="0 0 1080 1920">
  <defs><linearGradient id="bs-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#150F42"/><stop offset=".6" stop-color="#4B2A86"/><stop offset="1" stop-color="#E26C7C"/></linearGradient></defs>
  <rect width="1080" height="1920" fill="url(#bs-s)"/>${stars(40, 21, 1080, 800, 0, 100)}
  <circle cx="860" cy="560" r="120" fill="#FFF3D0" stroke="${INK}" stroke-width="8"/><circle cx="830" cy="530" r="18" fill="#EBD9A8"/><circle cx="890" cy="600" r="12" fill="#EBD9A8"/>
  <g transform="translate(0 980)">${city(1080, 440, 41, true)}</g></svg></div>
<div class="L" data-z="0.55"><div class="ab zz" id="bossbody" style="left:-210px;top:300px;width:1500px;transform-origin:50% 90%;filter:brightness(.78) saturate(.9)">${zombie('ANNUAL PLAN', '$189.99/yr', { tone: '#7FA874' })}</div>
  ${o.cry ? `<div class="ab zz" id="bossbodyc" style="left:-210px;top:300px;width:1500px;opacity:0;transform-origin:50% 90%;filter:brightness(.78) saturate(.9)">${zombie('ANNUAL PLAN', '$189.99/yr', { tone: '#8DB583', cry: true })}</div>` : ''}</div>
<div class="L" data-z="0.75" id="minions">
  ${[0, 1, 2, 3, 4, 5].map((i) => `<div class="ab zz" style="left:${-30 + i * 190}px;top:${1230 + (i % 2) * 40}px;width:240px;filter:brightness(0) opacity(.95) drop-shadow(0 -5px 0 #E26C7C);transform:rotate(${(i % 3) * 4 - 4}deg)">${zombie('X', '$')}</div>`).join('')}
</div>
<div class="L" data-z="1.0"><svg class="full" viewBox="0 0 1080 1920">
  <path d="M-20 1480 H1100 V1920 H-20Z" fill="#0C0820" stroke="${INK}" stroke-width="8"/></svg>
  <div class="ab" id="tears" style="left:0;top:0;width:1080px;height:1920px;pointer-events:none"></div>
  <svg class="ab" id="cracks" style="left:0;top:0;width:1080px;height:1920px;opacity:0" viewBox="0 0 1080 1920"><g stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".95"><path d="M540 700 L420 520 L360 300 M540 700 L700 540 L820 360 M540 700 L470 900 L380 1180 M540 700 L650 920 L760 1250 M420 520 L300 560 M700 540 L790 640 M470 900 L560 1010"/></g></svg></div>
<div class="glow" id="bflash" style="left:0;top:0;width:1080px;height:1920px;background:#fff;opacity:0"></div>`;

/* ============ stamps: cancelled ============ */
const stampCard = (i: number, x: number, y: number, label: string, price: string, line: string) => `
<div class="ab" id="sc${i}" style="left:${x}px;top:${y}px;width:470px;height:420px;transform-origin:50% 50%">
  <div class="ab zz" id="sz${i}" style="left:-10px;top:30px;width:490px">${zombie(label, price)}</div>
  <div class="ab zz" id="sy${i}" style="left:-10px;top:30px;width:490px;opacity:0">${zombie(label, price, { cry: true, tone: '#B8D8AC' })}</div>
  <div class="ab" id="st${i}" style="left:30px;top:150px;border:12px solid #E7261B;color:#E7261B;border-radius:18px;padding:2px 20px;font:800 78px/1.05 'Bricolage';letter-spacing:-.02em;transform:rotate(-14deg) scale(2.4);opacity:0;background:rgba(255,246,230,.82)">CANCELLED</div>
  <div class="ab" style="left:20px;top:372px;width:440px;font:700 26px/1.2 'Liberation Mono',monospace;color:#FFF6E6;text-align:center">${line}</div></div>`;
SHOTS.stamps = () => `
<div class="L" data-z="0.2"><svg class="full" viewBox="0 0 1080 1920">
  <defs><linearGradient id="sp-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2D1B66"/><stop offset="1" stop-color="#12092F"/></linearGradient></defs>
  <rect width="1080" height="1920" fill="url(#sp-b)"/>${stripes('#8E96E8', 0.08, 10, 1700)}</svg></div>
<div class="L" data-z="0.8">
  ${stampCard(0, 60, 350, 'GYM', '$19.99/mo', 'visits this year: 2')}
  ${stampCard(1, 560, 380, 'CLOUD 50GB', '$1.49/mo', 'opened: never')}
  ${stampCard(2, 60, 790, 'MEAL KIT', '$64/wk', 'meals cooked: 1 (badly)')}
  ${stampCard(3, 560, 820, 'STREAMING', '$15.99/mo', 'shows watched: 1 (twice)')}
</div>
<div class="glow" id="sflash" style="left:0;top:0;width:1080px;height:1920px;background:#fff;opacity:0"></div>`;

/* ============ dawn: it resets on monday ============ */
SHOTS.dawn = (o) => `
<div class="L" data-z="0.2"><svg class="full" viewBox="0 0 1080 1920">
  <defs><linearGradient id="dw-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A4FB8"/><stop offset=".4" stop-color="#F18BA5"/><stop offset=".72" stop-color="#FFC768"/><stop offset="1" stop-color="#FFE9A8"/></linearGradient></defs>
  <rect width="1080" height="1920" fill="url(#dw-s)"/>
  <circle id="sunc" cx="540" cy="980" r="250" fill="#FFF3C8" opacity=".6"/><circle cx="540" cy="980" r="170" fill="#FFFBE6" stroke="${INK}" stroke-width="8"/>
  <g transform="translate(0 860)">${city(1080, 520, 61, true).replace(/#141935/g, '#4B2F7A')}</g></svg></div>
<div class="L" data-z="0.5" id="stampsky">
  ${[[120, 480, -12, 0.7], [700, 430, 9, 0.6], [390, 600, -5, 0.5], [880, 640, 14, 0.5]].map(([x, y, rot, sc]) => `<div class="ab" style="left:${x}px;top:${y}px;border:8px solid #E7261B;color:#E7261B;border-radius:14px;padding:0 14px;font:800 ${Math.round(60 * (sc as number))}px/1.1 'Bricolage';transform:rotate(${rot}deg);opacity:.5">CANCELLED</div>`).join('')}
</div>
<div class="L" data-z="0.9"><svg class="full" viewBox="0 0 1080 1920"><path d="M-20 1360 H1100 V1920 H-20Z" fill="#5C3E86" stroke="${INK}" stroke-width="10"/><path d="M-20 1360 H1100" stroke="#8C6CC0" stroke-width="12"/>
  <g stroke="#3F2A66" stroke-width="6">${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 150} 1360 V1920"/>`).join('')}</g></svg>
  ${BK(o, 'left:290px;top:830px;width:500px;filter:drop-shadow(-10px 0 0 rgba(255,235,170,.9)) drop-shadow(0 22px 0 rgba(36,18,10,.28));transform-origin:50% 100%')}</div>
<div class="glow" id="sparks" style="left:240px;top:760px;width:600px;height:600px;background:radial-gradient(circle,rgba(255,240,170,.9),transparent 65%);opacity:0"></div>
<div class="glow" style="left:0;top:700px;width:1080px;height:900px;background:radial-gradient(ellipse at 50% 30%,rgba(255,230,150,.5),transparent 70%)"></div>`;

/* ============ appshow: it's real ============ */
SHOTS.appshow = () => `
<div class="L" data-z="0.1" style="background:#FFF1CF"><div class="ab" style="left:50%;top:44%;width:3000px;height:3000px;margin:-1500px 0 0 -1500px;background:repeating-conic-gradient(from 0deg,#FFD23F 0 7.5deg,#FFE79A 7.5deg 15deg);-webkit-mask-image:radial-gradient(circle,#000 0,rgba(0,0,0,.6) 22%,transparent 44%);mask-image:radial-gradient(circle,#000 0,rgba(0,0,0,.6) 22%,transparent 44%)"></div></div>
<div class="L" data-z="0.8">
  ${[['ph0', 20, 480, -9, '1-home'], ['ph2', 560, 480, 9, '3-chill'], ['ph1', 290, 420, 0, '2-roast']].map(([id, x, y, rot, f]) => `<div class="ab" id="${id}" style="left:${x}px;top:${y}px;width:500px;height:1030px;border:14px solid ${INK};border-radius:78px;overflow:hidden;background:#000;box-shadow:16px 20px 0 rgba(36,18,10,.3);transform:rotate(${rot}deg);opacity:0"><img src="shots/${f}.png" style="width:100%;height:100%;object-fit:cover;display:block"></div>`).join('')}
</div>`;

/* ============ bnpl: the tease ============ */
SHOTS.bnpl = (o) => `
<div class="L" data-z="0.2"><svg class="full" viewBox="0 0 1080 1920">
  <defs><radialGradient id="bn-g" cx="50%" cy="56%" r="70%"><stop offset="0" stop-color="#5B2FD6"/><stop offset=".5" stop-color="#1D1247"/><stop offset="1" stop-color="#06040F"/></radialGradient></defs>
  <rect width="1080" height="1920" fill="url(#bn-g)"/>
  <path d="M-20 1380 H1100 V1920 H-20Z" fill="#14102E" stroke="${INK}" stroke-width="8"/></svg></div>
<div class="L" data-z="0.5">
  ${[0, 1, 2, 3].map((i) => `<div class="ab zz" style="left:${90 + i * 230}px;top:${760 + (i % 2) * 40}px;width:240px;filter:brightness(0) opacity(.9)">${zombie('?', '$')}</div>`).join('')}
</div>
<div class="L" data-z="0.9">
  <div class="ab" id="bph" style="left:280px;top:520px;width:520px;height:960px;border:18px solid ${INK};border-radius:90px;background:linear-gradient(160deg,#B4FFD6,#58E0A8);overflow:hidden;box-shadow:0 0 120px rgba(124,224,170,.5);transform:rotate(-3deg)">
    <div style="position:absolute;left:50%;top:16px;width:170px;height:38px;margin-left:-85px;border-radius:30px;background:${INK}"></div>
    <div style="position:absolute;left:30px;top:100px;width:460px;font:800 70px/.92 'Bricolage';letter-spacing:-.045em;color:${INK}">PAY IN 4.</div>
    <div style="position:absolute;left:30px;top:204px;width:460px;font:700 28px/1.3 'Liberation Mono',monospace;color:${INK}">Hi. We've been in your pocket the whole time.</div>
    <div style="position:absolute;left:30px;top:370px;width:460px;display:flex;gap:16px">${[1, 2, 3, 4].map((n) => `<div class="pp" style="width:96px;height:96px;border-radius:50%;border:7px solid ${INK};background:#FFFDF6;font:800 54px/82px 'Bricolage';text-align:center;color:${INK};opacity:.4">${n}</div>`).join('')}</div>
    <div style="position:absolute;left:30px;top:510px;width:460px;font:800 100px/.9 'Bricolage';letter-spacing:-.05em;color:${INK}">$19.99</div>
    <div style="position:absolute;left:30px;top:620px;width:460px;font:700 28px/1.3 'Liberation Mono',monospace;color:${INK}">x4. no interest. (yet)</div>
  </div>
  <div class="ab" id="bhand" style="left:520px;top:540px;width:300px;opacity:0;transform-origin:50% 100%">${palm()}</div>
</div>
<div class="glow" id="bglow" style="left:0;top:300px;width:1080px;height:1200px;background:radial-gradient(ellipse,rgba(124,224,170,.55),transparent 62%);opacity:.7"></div>`;

/* ============ rescue: reading the roast out loud ============ */
SHOTS.rescue = (o) => `
<div class="L" data-z="0.2"><svg class="full" viewBox="0 0 1080 1920">
  <defs><linearGradient id="rs-w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC27A"/><stop offset="1" stop-color="#FF8F6B"/></linearGradient>
  <linearGradient id="rs-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF8A5C"/><stop offset=".7" stop-color="#FFC768"/><stop offset="1" stop-color="#FFE7A1"/></linearGradient><clipPath id="rs-c"><rect x="84" y="344" width="412" height="492"/></clipPath></defs>
  <rect width="1080" height="1920" fill="url(#rs-w)"/>${stripes('#FFE7B8', 0.2)}
  <rect x="64" y="324" width="452" height="532" rx="14" fill="#FFF6E6" stroke="${INK}" stroke-width="10"/><rect x="84" y="344" width="412" height="492" fill="url(#rs-s)"/>
  <g clip-path="url(#rs-c)"><circle cx="290" cy="740" r="150" fill="#FFF6D0"/><g transform="translate(84 510)" opacity=".92">${city(412, 330, 21, true).replace(/#141935/g, '#8A3F73')}</g></g>
  <path d="M290 344 V836 M84 590 H496" stroke="${INK}" stroke-width="12"/>
</svg></div>
<div class="L" data-z="0.5"><svg class="full" viewBox="0 0 1080 1920">
  <rect x="640" y="300" width="460" height="1400" fill="#1C1538" stroke="${INK}" stroke-width="12"/><rect x="620" y="270" width="500" height="60" fill="#8A5A3A" stroke="${INK}" stroke-width="10"/>
</svg>
<div class="ab zz" id="rz1" style="left:620px;top:560px;width:520px;transform-origin:50% 90%">${zombie('STREAMING', '$15.99/mo')}</div>
<div class="ab zz" id="rz2" style="left:700px;top:900px;width:420px;transform-origin:50% 90%;filter:brightness(.9)">${zombie('GYM', '$19.99/mo', { tone: '#86B27A' })}</div>
<div class="ab zz" id="rz1c" style="left:620px;top:560px;width:520px;opacity:0;transform-origin:50% 90%">${zombie('STREAMING', '$15.99/mo', { cry: true })}</div>
<div class="ab zz" id="rz2c" style="left:700px;top:900px;width:420px;opacity:0;transform-origin:50% 90%;filter:brightness(.9)">${zombie('GYM', '$19.99/mo', { tone: '#86B27A', cry: true })}</div></div>
<div class="L" data-z="0.9">${BK(o, 'left:-10px;top:650px;width:600px;filter:drop-shadow(-8px 0 0 rgba(255,246,200,.9)) drop-shadow(0 24px 0 rgba(36,18,10,.28));transform-origin:50% 100%')}
  <div class="ab" id="rph" style="left:390px;top:880px;width:240px;height:450px;border:12px solid ${INK};border-radius:54px;overflow:hidden;background:#000;transform:rotate(14deg);box-shadow:10px 12px 0 rgba(36,18,10,.3)"><img src="shots/2-roast.png" style="width:100%;display:block"></div></div>
<div class="L" data-z="1.0">${bubble('rb', 60, 390, 700, 'You are paying monthly for things you <span style="color:#E7261B">forgot you had.</span>', 56, 'l')}</div>
<div class="glow" style="left:-200px;top:-100px;width:1000px;height:1400px;background:linear-gradient(112deg,rgba(255,244,200,.55) 8%,transparent 20%,rgba(255,244,200,.4) 28%,transparent 40%)"></div>`;
