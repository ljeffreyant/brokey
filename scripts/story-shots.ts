/** The shots of "The Broke Apocalypse". Each is a function of options returning a stack of parallax layers (.L data-z) at 1080x1920. */
import type { Mood } from '../src/art/mascot';
import { M, I, LOGO, WM, INK, zombie, palm, city } from './story-art';

export type ShotOpts = { mood?: Mood; fries?: number; mood2?: Mood; fries2?: number; empty?: boolean; top?: string; sub?: string; next?: string; end?: boolean; still?: boolean; cry?: boolean; smash?: boolean; tease?: string };

export const r = (x: number, y: number, w: number, h: number, fill: string, rx = 0, sw = 8) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`;
export const stripes = (c: string, op: number, n = 10, h = 1800) =>
  `<g opacity="${op}" stroke="${c}" stroke-width="4">${Array.from({ length: n }, (_, i) => `<path d="M${i * 40 + 8} 0V${h}"/>`).join('')}</g>`;
export const stars = (n: number, seed: number, w: number, h: number, ox = 0, oy = 0) => {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: n }, () => `<circle cx="${(ox + rnd() * w).toFixed(0)}" cy="${(oy + rnd() * h).toFixed(0)}" r="${(1.5 + rnd() * 2.5).toFixed(1)}" fill="#FFF6E6" opacity="${(0.5 + rnd() * 0.5).toFixed(2)}"/>`).join('');
};
/** Brokey, plus an optional second version that takes over when the fries cue fires. */
export const BK = (o: ShotOpts, style: string) => {
  const a = `<div class="ab mas" id="bk" style="${style}">${M(o.mood ?? 'ok', o.fries ?? 9)}</div>`;
  const b = o.fries2 !== undefined ? `<div class="ab mas" id="bk2" style="${style};opacity:0">${M(o.mood2 ?? o.mood ?? 'ok', o.fries2)}</div>` : '';
  return a + b;
};

export const SHOTS: Record<string, (o: ShotOpts) => string> = {};

/* ============ couch: night living room, Brokey and the telly ============ */
SHOTS.couch = (o) => `
<div class="L" data-z="0.2"><svg class="full" viewBox="0 0 1080 1920">
  <defs>
    <linearGradient id="cw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5546AE"/><stop offset="1" stop-color="#2B2368"/></linearGradient>
    <linearGradient id="cs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121B52"/><stop offset=".62" stop-color="#3B4199"/><stop offset="1" stop-color="#A560AE"/></linearGradient>
    <clipPath id="cwin"><rect x="84" y="244" width="412" height="492"/></clipPath>
  </defs>
  <rect width="1080" height="1920" fill="url(#cw)"/>${stripes('#C7CBFF', 0.13)}
  <rect x="64" y="224" width="452" height="532" rx="14" fill="#EFE3C8" stroke="${INK}" stroke-width="10"/>
  <rect x="84" y="244" width="412" height="492" fill="url(#cs)"/>
  <g clip-path="url(#cwin)">${stars(26, 3, 412, 240, 84, 244)}
    <circle cx="396" cy="352" r="50" fill="#FFF3D0" stroke="${INK}" stroke-width="6"/><circle cx="380" cy="340" r="9" fill="#EBD9A8"/><circle cx="410" cy="368" r="6" fill="#EBD9A8"/>
    <g transform="translate(84 396)">${city(412, 340, 11)}</g></g>
  <path d="M290 244 V736 M84 490 H496" stroke="${INK}" stroke-width="12"/>
  <path d="M506 214 Q570 380 540 520 Q580 640 520 780 L440 780 Q470 600 440 480 Q470 320 430 214Z" fill="#D8566E" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/>
  <path d="M470 230 Q500 400 484 520 M500 560 Q510 680 490 770" stroke="#A93550" stroke-width="7" fill="none" stroke-linecap="round"/>
  <rect x="690" y="290" width="236" height="296" rx="12" fill="#FFF6E6" stroke="${INK}" stroke-width="10"/><rect x="710" y="310" width="196" height="256" fill="#FFD23F" stroke="${INK}" stroke-width="6"/>
</svg>
<div class="ab" style="left:722px;top:350px;width:172px;transform:rotate(-3deg)">${I('hsp')}</div></div>
<div class="L" data-z="0.3"><svg class="full" viewBox="0 0 1080 1920">
  <path d="M930 700 V1380" stroke="${INK}" stroke-width="30"/><path d="M930 700 V1380" stroke="#7A5BD0" stroke-width="14"/>
  <ellipse cx="930" cy="1386" rx="110" ry="26" fill="#2A1B4A" stroke="${INK}" stroke-width="9"/>
  <path d="M846 560 H1014 L1058 706 H802Z" fill="#FFC25A" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/><path d="M846 560 H900 L870 706 H802Z" fill="#FFE29A" opacity=".85"/>
</svg>
<div class="glow" style="left:330px;top:300px;width:1200px;height:900px;background:radial-gradient(ellipse at 50% 28%,rgba(255,196,96,.75),rgba(255,150,70,.28) 40%,transparent 70%)"></div></div>
<div class="L" data-z="0.5"><svg class="full" viewBox="0 0 1080 1920">
  ${r(40, 900, 1000, 380, '#2F8C96', 74, 10)}
  ${r(100, 940, 430, 300, '#3CA6B1', 52, 9)}${r(550, 940, 430, 300, '#3CA6B1', 52, 9)}
  ${r(-30, 1070, 200, 430, '#26757F', 80, 10)}${r(910, 1070, 200, 430, '#26757F', 80, 10)}
  ${r(40, 1230, 1000, 280, '#2F8C96', 44, 10)}
  <path d="M120 970 Q300 952 500 970" stroke="#9FE3EA" stroke-width="8" fill="none" opacity=".6" stroke-linecap="round"/>
</svg></div>
<div class="L" data-z="0.9">${BK(o, 'left:260px;top:700px;width:560px;filter:drop-shadow(-10px 0 0 rgba(255,190,100,.7)) drop-shadow(0 24px 0 rgba(0,0,0,.3));transform-origin:50% 100%')}</div>
<div class="glow" id="faceglow" style="left:130px;top:700px;width:820px;height:700px;background:radial-gradient(ellipse at 50% 50%,rgba(110,225,255,.55),transparent 66%)"></div>
<div class="L" data-z="1.0"><svg class="full" viewBox="0 0 1080 1920">
  ${r(150, 1300, 780, 250, '#3CA6B1', 70, 10)}${r(120, 1490, 840, 170, '#1F5F68', 40, 10)}
  <path d="M230 1350 Q540 1328 850 1350" stroke="#9FE3EA" stroke-width="9" fill="none" opacity=".6" stroke-linecap="round"/>
</svg></div>
<div class="L" data-z="1.35"><svg class="full" viewBox="0 0 1080 1920" style="filter:blur(5px)">
  <path d="M-40 1920 Q40 1560 140 1500 Q120 1640 240 1560 Q170 1720 300 1700 Q200 1800 280 1920Z" fill="#1A1244" stroke="${INK}" stroke-width="8"/>
  <path d="M1120 1920 Q1040 1640 900 1600 Q960 1700 840 1700 Q930 1780 880 1920Z" fill="#1A1244" stroke="${INK}" stroke-width="8"/></svg></div>
<div class="L" data-z="1.0"><div class="ab" id="adtag" style="left:560px;top:430px;width:430px;opacity:0;transform-origin:50% 0">
  <div style="background:#FFFDF6;border:8px solid ${INK};border-radius:26px;padding:24px 28px 22px;box-shadow:12px 14px 0 ${INK}">
    <div style="font:800 96px/.9 'Bricolage';letter-spacing:-.04em;color:${INK}">7 DAYS<br>FREE*</div>
    <div style="margin-top:12px;font:700 24px/1.2 'Liberation Mono',monospace;color:${INK}">*then $15.99 a month. forever.</div></div></div></div>`;

/* ============ phone: the free trial, close up ============ */
SHOTS.phone = () => `
<div class="L" data-z="0.2"><svg class="full" viewBox="0 0 1080 1920">
  <defs><linearGradient id="pbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3A2A8C"/><stop offset="1" stop-color="#1B1346"/></linearGradient></defs>
  <rect width="1080" height="1920" fill="url(#pbg)"/>
  <g>${[[120, 360, 120, '#FFB05A'], [900, 480, 90, '#6EE1FF'], [220, 1500, 150, '#FF6E8A'], [940, 1380, 110, '#FFD23F'], [820, 320, 70, '#FF6E8A'], [90, 960, 80, '#6EE1FF']]
    .map(([x, y, rr, c]) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="${c}" opacity=".55"/>`).join('')}</g>
</svg></div>
<div class="L" data-z="0.8">
  <div class="ab" id="ph" style="left:190px;top:330px;width:700px;height:1260px;border:20px solid ${INK};border-radius:100px;background:#1B1346;overflow:hidden;box-shadow:24px 30px 0 rgba(0,0,0,.35);transform:rotate(-4deg)">
    <div style="position:absolute;inset:0;background:linear-gradient(160deg,#6B2FD6,#2B1370 70%);"></div>
    <div style="position:absolute;left:50%;top:18px;width:190px;height:44px;margin-left:-95px;border-radius:30px;background:${INK}"></div>
    <div style="position:absolute;left:40px;top:96px;font:800 50px/1 'Bricolage';letter-spacing:-.02em;color:#FFF6E6">STREAMIN<span style="color:#FFD23F">+</span></div>
    <div style="position:absolute;left:40px;top:180px;width:580px;height:300px;border-radius:34px;border:6px solid ${INK};background:linear-gradient(135deg,#FF6E8A,#FFB05A);overflow:hidden">
      <svg viewBox="0 0 580 300" style="position:absolute;inset:0"><circle cx="420" cy="100" r="90" fill="#FFF3D0" opacity=".85"/><path d="M0 300 L110 190 L220 250 L350 150 L580 280 V300Z" fill="#6B2FD6" opacity=".85"/></svg></div>
    <div style="position:absolute;left:40px;top:510px;width:580px;font:800 124px/.9 'Bricolage';letter-spacing:-.05em;color:#FFD23F;text-shadow:6px 7px 0 ${INK}">7 DAYS<br>FREE*</div>
    <div style="position:absolute;left:40px;top:770px;width:580px;font:700 26px/1.3 'Liberation Mono',monospace;color:#E7DDFF">*then $15.99 a month.<br>Cancel anytime. (you won't)</div>
    <div id="btn" style="position:absolute;left:40px;top:900px;width:580px;height:122px;border-radius:70px;border:7px solid ${INK};background:#FFD23F;box-shadow:0 12px 0 ${INK};font:800 48px/108px 'Bricolage';text-align:center;color:${INK};letter-spacing:-.01em">START FREE TRIAL</div>
    <div id="okmsg" style="position:absolute;left:40px;top:900px;width:580px;height:122px;border-radius:70px;border:7px solid ${INK};background:#7CE08A;font:800 48px/108px 'Bricolage';text-align:center;color:${INK};opacity:0">You're in!</div>
    <div id="notif" style="position:absolute;left:24px;top:-170px;width:612px;border-radius:32px;border:6px solid ${INK};background:#FFFDF6;padding:20px 26px;font:700 27px/1.25 'DM',sans-serif;color:${INK};opacity:0"><b style="font:800 29px 'Bricolage'">STREAMIN+</b><br>Receipt: $0.00 today. See you in 7 days.</div>
  </div>
</div>
<div class="L" data-z="1.1"><div class="ab" id="mitt" style="left:560px;top:1180px;width:290px;opacity:0;transform-origin:30% 20%">
  <svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg"><g stroke="${INK}" stroke-width="9" stroke-linejoin="round" stroke-linecap="round" fill="#FFFDF6"><path d="M70 260 Q60 150 84 100 Q90 70 100 40 Q108 14 126 22 Q142 30 134 60 L130 96 Q160 90 168 120 Q176 160 156 260Z"/><path d="M92 120 q18 10 34 0" fill="none"/></g></svg></div></div>
<div class="glow" style="left:0;top:480px;width:1080px;height:1100px;background:radial-gradient(ellipse at 50% 50%,rgba(140,110,255,.5),transparent 60%)"></div>
<div class="glow" id="redtint" style="left:0;top:0;width:1080px;height:1920px;background:radial-gradient(ellipse at 50% 50%,rgba(255,60,50,.0),rgba(255,40,40,.9));opacity:0"></div>`;

/* ============ cups: five bubble teas ============ */
const cup = (i: number) => `<div class="ab cup" id="cup${i}" style="left:${58 + i * 198}px;top:908px;width:200px;transform-origin:50% 100%;opacity:0;filter:drop-shadow(0 12px 0 rgba(36,18,10,.28))">${I('boba')}</div>`;
SHOTS.cups = (o) => `
<div class="L" data-z="0.2"><svg class="full" viewBox="0 0 1080 1920">
  <defs><clipPath id="kwin"><rect x="590" y="310" width="400" height="500"/></clipPath></defs>
  <rect width="1080" height="1920" fill="#FFE8B8"/>
  <g stroke="#EBCB88" stroke-width="5">${Array.from({ length: 13 }, (_, i) => `<path d="M${i * 90} 0V1300"/>`).join('')}${Array.from({ length: 15 }, (_, i) => `<path d="M0 ${i * 90}H1080"/>`).join('')}</g>
  ${r(570, 290, 440, 540, '#FFF6E6', 14, 10)}<rect x="590" y="310" width="400" height="500" fill="#FFF0B0"/>
  <g clip-path="url(#kwin)"><circle cx="880" cy="420" r="120" fill="#FFFBE0"/>${Array.from({ length: 9 }, (_, i) => `<rect x="580" y="${330 + i * 56}" width="420" height="30" fill="#FFF6E6" stroke="${INK}" stroke-width="6"/>`).join('')}</g>
  ${r(80, 350, 330, 400, '#FFFDF6', 16, 10)}<rect x="80" y="350" width="330" height="86" fill="#FF5A47" stroke="${INK}" stroke-width="10"/>
  <text x="245" y="412" text-anchor="middle" font-family="Bricolage" font-weight="800" font-size="46" fill="#FFF6E6">THIS WEEK</text>
  <g id="tally" stroke="${INK}" stroke-width="12" stroke-linecap="round">${[0, 1, 2, 3].map((i) => `<path class="tl" d="M${130 + i * 42} 480 V660"/>`).join('')}<path class="tl" d="M110 620 L300 520"/></g>
  <text x="245" y="725" text-anchor="middle" font-family="Bricolage" font-weight="800" font-size="38" fill="${INK}">BOBA</text>
</svg></div>
<div class="L" data-z="0.5"><svg class="full" viewBox="0 0 1080 1920">
  ${r(-30, 1100, 1140, 150, '#E3A15A', 18, 10)}${r(-30, 1240, 1140, 700, '#9B6240', 0, 10)}
  <g stroke="${INK}" stroke-width="8" fill="#B3714C"><rect x="20" y="1300" width="480" height="440" rx="18"/><rect x="580" y="1300" width="480" height="440" rx="18"/></g>
  <rect x="236" y="1400" width="48" height="110" rx="20" fill="#E3A15A" stroke="${INK}" stroke-width="7"/><rect x="796" y="1400" width="48" height="110" rx="20" fill="#E3A15A" stroke="${INK}" stroke-width="7"/>
</svg></div>
<div class="L" data-z="0.85">${BK(o, 'left:230px;top:500px;width:620px;filter:drop-shadow(-8px 0 0 rgba(255,240,170,.9)) drop-shadow(0 22px 0 rgba(36,18,10,.25));transform-origin:50% 100%')}</div>
<div class="L" data-z="1.0">${[0, 1, 2, 3, 4].map(cup).join('')}</div>
<div class="glow" style="left:0;top:0;width:1080px;height:1400px;background:linear-gradient(115deg,transparent 30%,rgba(255,255,230,.35) 34%,transparent 40%,rgba(255,255,230,.28) 46%,transparent 52%,rgba(255,255,230,.22) 58%,transparent 64%)"></div>`;

/* ============ door: zombie subscription at the glass ============ */
SHOTS.door = (o) => `
<div class="L" data-z="0.2"><svg class="full" viewBox="0 0 1080 1920">
  <defs>
    <linearGradient id="dwl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5A5CB8"/><stop offset="1" stop-color="#2B2F78"/></linearGradient>
    <radialGradient id="ddl" cx="68%" cy="30%" r="80%"><stop offset="0" stop-color="${o.empty ? '#C9C8F0' : '#FFF0BE'}"/><stop offset=".28" stop-color="${o.empty ? '#8E86D6' : '#FFC15E'}"/><stop offset=".6" stop-color="${o.empty ? '#5B4CA8' : '#E5718A'}"/><stop offset="1" stop-color="#3B2D7C"/></radialGradient>
    <clipPath id="dgc"><rect x="360" y="180" width="740" height="1460"/></clipPath>
  </defs>
  <rect width="1080" height="1920" fill="url(#dwl)"/>${stripes('#C7CBFF', 0.16, 10, 1760)}
  <g transform="translate(150 480)"><circle r="96" fill="#FFF6E6" stroke="${INK}" stroke-width="10"/><path d="M0 0 L3 -52" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M0 0 L-3 -66" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><circle r="9" fill="#E7261B"/>
    ${Array.from({ length: 12 }, (_, i) => `<path d="M${(Math.sin((i * Math.PI) / 6) * 70).toFixed(1)} ${(-Math.cos((i * Math.PI) / 6) * 70).toFixed(1)} L${(Math.sin((i * Math.PI) / 6) * 82).toFixed(1)} ${(-Math.cos((i * Math.PI) / 6) * 82).toFixed(1)}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`).join('')}</g>
  <rect x="70" y="900" width="64" height="100" rx="10" fill="#EFE7D2" stroke="${INK}" stroke-width="7"/><rect x="91" y="930" width="22" height="42" rx="5" fill="#C9BFA4" stroke="${INK}" stroke-width="4"/>
</svg></div>
<div class="L" data-z="0.45"><svg class="full" viewBox="0 0 1080 1920">
  <rect x="360" y="180" width="740" height="1460" fill="url(#ddl)"/>
  <g clip-path="url(#dgc)"><circle cx="850" cy="420" r="230" fill="#FFF3C8" opacity="${o.empty ? 0.25 : 0.55}"/><g transform="translate(360 760) scale(1 .95)" opacity=".92">${city(740, 640, 5)}</g><rect x="360" y="1180" width="740" height="470" fill="#2B2150"/></g>
  <circle cx="850" cy="420" r="64" fill="#FFFBEA" stroke="${INK}" stroke-width="8"/><path d="M850 484 V1180" stroke="#2B2150" stroke-width="24"/>
  <g fill="#2B2150" stroke="${INK}" stroke-width="6"><rect x="360" y="1190" width="740" height="26"/>${Array.from({ length: 13 }, (_, i) => `<rect x="${380 + i * 58}" y="1216" width="18" height="424"/>`).join('')}</g>
  <g stroke="${INK}" stroke-width="10" stroke-linejoin="round"><rect x="296" y="116" width="810" height="70" fill="#6C7798"/><rect x="296" y="116" width="66" height="1590" fill="#6C7798"/><rect x="684" y="180" width="38" height="1460" fill="#6C7798"/><rect x="360" y="1060" width="740" height="34" fill="#6C7798"/><rect x="296" y="1636" width="810" height="170" fill="#59638A"/></g>
  <g fill="#C8D0EA" opacity=".85"><rect x="304" y="126" width="12" height="1570"/><rect x="304" y="124" width="790" height="10"/><rect x="690" y="190" width="9" height="1440"/></g>
  <rect x="318" y="740" width="30" height="340" rx="15" fill="#E4E9F5" stroke="${INK}" stroke-width="9"/><rect x="326" y="772" width="8" height="260" rx="4" fill="#fff"/>
  <path d="M360 560 q70 60 150 12" stroke="#B8C0D6" stroke-width="10" fill="none" stroke-dasharray="15 8" stroke-linecap="round"/><rect x="344" y="540" width="44" height="38" rx="9" fill="#E4E9F5" stroke="${INK}" stroke-width="7"/>
</svg></div>
${o.empty
  ? `<div class="L" data-z="0.7"><div class="ab" style="left:430px;top:640px;width:260px;transform:rotate(-14deg);opacity:.38;filter:blur(1.5px)">${palm()}</div><div class="ab" style="left:560px;top:860px;width:220px;transform:rotate(8deg);opacity:.3;filter:blur(1.5px)">${palm()}</div></div>`
  : `<div class="L" data-z="0.7"><div class="ab zz" style="left:700px;top:330px;width:420px;transform:rotate(9deg);filter:blur(6px) brightness(.92)">${zombie('CLOUD 50GB', '$1.49/mo', { tone: '#86B27A' })}</div>
  <div class="ab zz" style="left:350px;top:260px;width:360px;transform:rotate(-10deg);filter:blur(8px) brightness(.85)">${zombie('APP I FORGOT', '$9.99/mo', { tone: '#86B27A' })}</div></div>
<div class="L" data-z="0.9"><div class="ab zz" id="zm" style="left:250px;top:530px;width:980px;transform-origin:50% 60%">${zombie('STREAMING', '$15.99/mo')}</div></div>`}
<div class="L" data-z="0.95" style="mix-blend-mode:screen;opacity:.9"><svg class="full" viewBox="0 0 1080 1920"><path d="M360 180 L640 180 L360 700Z" fill="#fff" opacity=".18"/><path d="M700 180 L830 180 L360 1120 L360 880Z" fill="#fff" opacity=".1"/><path d="M1000 180 L1100 180 L1100 330Z" fill="#fff" opacity=".12"/></svg></div>
<div class="L" data-z="1.3"><svg class="full" viewBox="0 0 1080 1920"><defs><linearGradient id="dfl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4A3466"/><stop offset="1" stop-color="#241A3C"/></linearGradient></defs>
  <path d="M0 1690 L1080 1690 L1080 1920 L0 1920Z" fill="url(#dfl)" stroke="${INK}" stroke-width="8"/>
  <g stroke="#7A5C9E" stroke-width="5" opacity=".6">${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 135 - 20} 1920 L${540 + (i - 4) * 44} 1690"/>`).join('')}<path d="M0 1790 H1080 M0 1860 H1080"/></g>
  <ellipse cx="660" cy="1750" rx="460" ry="64" fill="#FFB35C" opacity=".38"/></svg>
  ${BK(o, 'left:-30px;top:650px;width:520px;filter:drop-shadow(12px 0 0 rgba(255,184,100,.8)) drop-shadow(0 26px 0 rgba(0,0,0,.35));transform-origin:50% 90%')}</div>
<div class="glow" id="flick" style="left:0;top:0;width:1080px;height:1920px;background:#fff;opacity:0"></div>`;

/* ============ doorclose: extreme close-up ============ */
SHOTS.doorclose = () => `
<div class="L" data-z="0.3"><svg class="full" viewBox="0 0 1080 1920">
  <defs><radialGradient id="dcg" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="#FFE9A8"/><stop offset=".4" stop-color="#FFA257"/><stop offset=".8" stop-color="#C4527E"/><stop offset="1" stop-color="#4C3590"/></radialGradient></defs>
  <rect width="1080" height="1920" fill="url(#dcg)"/><circle cx="540" cy="620" r="360" fill="#FFF6D0" opacity=".5"/></svg></div>
<div class="L" data-z="0.9"><div class="ab zz" id="zc" style="left:-330px;top:330px;width:1760px;transform-origin:50% 40%">${zombie('STREAMING', '$15.99/mo')}</div></div>
<div class="L" data-z="1.0"><div class="glow" id="breath" style="left:200px;top:660px;width:700px;height:420px;background:radial-gradient(ellipse,rgba(255,255,255,.7),transparent 70%);opacity:0;filter:blur(14px)"></div></div>
<div class="L" data-z="1.1" style="mix-blend-mode:screen"><svg class="full" viewBox="0 0 1080 1920"><path d="M0 0 L520 0 L0 900Z" fill="#fff" opacity=".2"/><path d="M640 0 L800 0 L0 1500 L0 1180Z" fill="#fff" opacity=".1"/><path d="M1080 0 V380 L760 0Z" fill="#fff" opacity=".14"/></svg></div>
<div class="L" data-z="1.2"><svg class="full" viewBox="0 0 1080 1920"><path d="M-20 1920 V1700 Q540 1640 1100 1700 V1920Z" fill="#2A1B3A" stroke="${INK}" stroke-width="10"/></svg></div>`;

/* ============ list: the bank app, every forgotten charge turns ============ */
const bankRow = (i: number, name: string, price: string, sub: string, y: number, tone: string, icon: string) => `
<div class="ab" id="row${i}" style="left:36px;top:${y}px;width:588px;height:128px;border-radius:26px;border:6px solid ${INK};background:#FFFDF6;opacity:0;box-shadow:0 8px 0 rgba(36,18,10,.25)">
  <div style="position:absolute;left:14px;top:14px;width:90px;height:90px;border-radius:22px;border:5px solid ${INK};background:${tone};overflow:hidden"><div style="position:absolute;inset:6px">${icon}</div>
    <svg id="zface${i}" viewBox="0 0 90 90" style="position:absolute;inset:0;opacity:0"><rect width="90" height="90" fill="#8DBF7E"/><path d="M20 28 l20 20 M40 28 l-20 20" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><circle cx="64" cy="38" r="14" fill="#FFF6E6" stroke="${INK}" stroke-width="4"/><circle cx="68" cy="42" r="5" fill="${INK}"/><path d="M18 66 q12 -10 24 0 t24 0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/></svg></div>
  <div style="position:absolute;left:122px;top:18px;font:800 33px/1 'Bricolage';letter-spacing:-.01em;color:${INK}">${name}</div>
  <div style="position:absolute;left:122px;top:66px;font:700 22px/1.2 'Liberation Mono',monospace;color:#7A5A44">${sub}</div>
  <div style="position:absolute;right:22px;top:36px;font:800 38px/1 'Bricolage';color:#E7261B">${price}</div></div>`;
SHOTS.list = () => `
<div class="L" data-z="0.2"><svg class="full" viewBox="0 0 1080 1920">
  <defs><linearGradient id="lbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A1B5E"/><stop offset="1" stop-color="#120B2E"/></linearGradient></defs>
  <rect width="1080" height="1920" fill="url(#lbg)"/>
  <g>${[[100, 420, 110, '#FF6E8A'], [960, 560, 90, '#6EE1FF'], [880, 1480, 130, '#FFB05A'], [140, 1400, 100, '#6EE1FF']].map(([x, y, rr, c]) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="${c}" opacity=".35"/>`).join('')}</g>
</svg></div>
<div class="L" data-z="0.8">
  <div class="ab" id="lph" style="left:190px;top:380px;width:700px;height:1220px;border:20px solid ${INK};border-radius:100px;background:#FFF1D6;overflow:hidden;box-shadow:24px 30px 0 rgba(0,0,0,.4);transform:rotate(2.5deg)">
    <div style="position:absolute;left:50%;top:18px;width:190px;height:44px;margin-left:-95px;border-radius:30px;background:${INK}"></div>
    <div style="position:absolute;left:40px;top:92px;font:800 46px/1 'Bricolage';letter-spacing:-.02em;color:${INK}">Spending</div>
    <div style="position:absolute;left:40px;top:150px;font:700 24px/1 'Liberation Mono',monospace;color:#7A5A44">THIS MONTH, AUTOMATIC</div>
    ${bankRow(0, 'STREAMIN+', '$0.00', 'trial, 7 days left', 220, '#FFD23F', '')}
    ${bankRow(1, 'GYM', '$19.99', 'last visit: March', 370, '#FF8A5C', I('dumbbell'))}
    ${bankRow(2, 'CLOUD 50GB', '$1.49', 'photos? what photos', 520, '#6EE1FF', '')}
    ${bankRow(3, 'APP I FORGOT', '$9.99', 'unknown. renews monthly', 670, '#C8A6FF', '')}
    <div id="row4" class="ab" style="left:36px;top:845px;width:588px;opacity:0">
      <div style="font:800 44px/1 'Bricolage';color:#E7261B;letter-spacing:-.02em">$47.46 a month</div>
      <div style="margin-top:10px;font:700 24px/1.3 'Liberation Mono',monospace;color:${INK}">= 2.6 HSPs. every month. for nothing.</div></div>
    <div id="greentint" class="ab" style="inset:0;background:linear-gradient(180deg,rgba(120,200,110,.0),rgba(90,170,90,.55));opacity:0;mix-blend-mode:multiply"></div>
  </div>
</div>
<div class="L" data-z="1.15"><svg class="full" viewBox="0 0 1080 1920">
  <g stroke="${INK}" stroke-width="9" stroke-linejoin="round" stroke-linecap="round" fill="#FFFDF6">
    <path d="M-40 1540 Q60 1380 150 1330 Q190 1320 200 1360 Q196 1420 260 1520 L300 1920 L-40 1920Z"/>
    <path d="M1120 1500 Q1010 1360 930 1330 Q890 1324 884 1362 Q890 1420 830 1520 L800 1920 L1120 1920Z"/></g></svg></div>`;

/* ============ street: they started walking ============ */
const walker = (label: string, price: string, x: number, y: number, w: number, sp: number, dx: number, tone: string) =>
  `<div class="ab zw zz" data-x="${x}" data-y="${y}" data-s="1" data-sp="${sp}" data-dx="${dx}" style="left:0;top:0;width:${w}px;transform-origin:50% 100%;filter:brightness(.92)">${zombie(label, price, { tone })}</div>`;
SHOTS.street = (o) => `
<div class="L" data-z="0.2"><svg class="full" viewBox="0 0 1080 1920">
  <defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#191452"/><stop offset=".55" stop-color="#5B3A9A"/><stop offset="1" stop-color="#F29A6A"/></linearGradient></defs>
  <rect width="1080" height="1920" fill="url(#sk)"/>${stars(40, 9, 1080, 520, 0, 120)}
  <circle cx="830" cy="470" r="104" fill="#FFF3D0" stroke="${INK}" stroke-width="8"/><circle cx="800" cy="446" r="16" fill="#EBD9A8"/><circle cx="860" cy="500" r="11" fill="#EBD9A8"/><circle cx="830" cy="420" r="8" fill="#EBD9A8"/>
  <g transform="translate(0 600)">${city(1080, 360, 31)}</g>
</svg></div>
<div class="L" data-z="0.5"><svg class="full" viewBox="0 0 1080 1920">
  <path d="M0 960 H1080 V1920 H0Z" fill="#2B2150"/>
  <path d="M490 960 L590 960 L1500 1920 L-420 1920Z" fill="#3A2C6E" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
  <path d="M520 960 L-60 1920 M560 960 L1140 1920" stroke="#8C7DC4" stroke-width="10" fill="none"/>
  <path d="M538 1000 L536 1080 M540 1130 L536 1260 M542 1330 L534 1560 M544 1640 L532 1920" stroke="#FFE9A8" stroke-width="12" stroke-linecap="round"/>
  <path d="M0 960 L490 960 L-420 1920 L-1080 1920Z" fill="#24193F"/><path d="M590 960 L1080 960 L2000 1920 L1500 1920Z" fill="#24193F"/>
  <g transform="translate(120 700)"><rect x="-8" y="0" width="22" height="300" fill="#C8D0EA" stroke="${INK}" stroke-width="7"/><rect x="-64" y="-10" width="130" height="86" rx="12" fill="#FFC25A" stroke="${INK}" stroke-width="8"/><text x="1" y="48" text-anchor="middle" font-family="Bricolage" font-weight="800" font-size="30" fill="${INK}">TRAM</text><text x="1" y="68" text-anchor="middle" font-family="Bricolage" font-weight="800" font-size="20" fill="${INK}">STOP 19</text></g>
</svg></div>
<div class="L" data-z="0.75" id="walkers" data-still="${o.still ? 1 : 0}">
  ${walker('CLOUD 50GB', '$1.49/mo', 700, 760, 230, 0.8, 1.2, '#86B27A')}
  ${walker('APP I FORGOT', '$9.99/mo', 330, 770, 250, 0.9, -1.1, '#86B27A')}
  ${walker('MEAL KIT', '$64/wk', 860, 790, 270, 0.85, 1.7, '#86B27A')}
  ${walker('GYM', '$19.99/mo', 140, 800, 290, 1.0, -1.5, '#8FBE80')}
  ${walker('STREAMING', '$15.99/mo', 470, 810, 340, 1.1, 0.1, '#9CC98A')}
</div>
<div class="L" data-z="1.0"><svg class="full" viewBox="0 0 1080 1920">
  <g transform="translate(960 560)"><rect x="-8" y="0" width="26" height="520" fill="#6C7798" stroke="${INK}" stroke-width="8"/><path d="M-84 -10 H100 L60 70 H-44Z" fill="#FFC25A" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/></g></svg>
  <div class="glow" id="lamp" style="left:660px;top:500px;width:700px;height:760px;background:radial-gradient(ellipse at 50% 12%,rgba(255,200,110,.7),transparent 66%)"></div></div>
<div class="L" data-z="1.25"><svg class="full" viewBox="0 0 1080 1920">
  <g stroke="${INK}" stroke-width="12" stroke-linejoin="round"><rect x="-20" y="190" width="1120" height="110" fill="#4A3C86"/><rect x="-20" y="190" width="96" height="1200" fill="#4A3C86"/><rect x="1004" y="190" width="96" height="1200" fill="#4A3C86"/><rect x="-20" y="1330" width="1120" height="610" fill="#3A2C6E"/></g>
  <rect x="-20" y="1310" width="1120" height="36" fill="#7A6CC0" stroke="${INK}" stroke-width="8"/>
  <g stroke="#B0A6F0" stroke-width="6" opacity=".6"><path d="M60 215 V1660 M1020 215 V1660"/></g></svg>
  ${BK(o, 'left:90px;top:930px;width:380px;filter:drop-shadow(10px 0 0 rgba(255,184,100,.65)) drop-shadow(0 18px 0 rgba(0,0,0,.35));transform-origin:50% 100%')}</div>`;

/* ============ fridge: the "bunker" ============ */
const tagCard = (x: number, y: number, a: string, b: string) =>
  `<div class="ab" style="left:${x}px;top:${y}px;background:#FFFDF6;border:6px solid ${INK};border-radius:18px;padding:12px 18px;box-shadow:7px 8px 0 rgba(36,18,10,.25);font:800 36px/1.05 'Bricolage';letter-spacing:-.02em;color:${INK}">${a}<div style="font:700 24px/1.3 'Liberation Mono',monospace;color:#2B7BB0;letter-spacing:0">${b}</div></div>`;
SHOTS.fridge = (o) => `
<div class="L" data-z="0.2"><svg class="full" viewBox="0 0 1080 1920">
  <rect width="1080" height="1920" fill="#A9DDF2"/>
  <g stroke="#8CC6E0" stroke-width="10" opacity=".7">${Array.from({ length: 7 }, (_, i) => `<path d="M${90 + i * 150} 130V1900"/>`).join('')}</g>
  ${r(-20, 440, 1120, 28, '#BFE3F5', 0, 9)}${r(-20, 840, 1120, 28, '#BFE3F5', 0, 9)}${r(-20, 1400, 1120, 28, '#BFE3F5', 0, 9)}
  <path d="M50 450 H420" stroke="#fff" stroke-width="8" opacity=".8" stroke-linecap="round"/><path d="M50 850 H420" stroke="#fff" stroke-width="8" opacity=".8" stroke-linecap="round"/>
  ${r(-20, 1460, 1120, 460, '#9FD0E8', 0, 10)}<path d="M-20 1580 H1100" stroke="${INK}" stroke-width="9"/>
</svg></div>
<div class="L" data-z="0.5" id="items">
  <div class="ab" style="left:60px;top:1130px;width:190px;transform:rotate(-6deg)">${I('pizza')}</div><div class="ab" style="left:800px;top:1150px;width:190px;transform:rotate(7deg)">${I('taco')}</div>
  <div class="ab" style="left:90px;top:380px;width:230px">${I('sneaker')}</div>${tagCard(320, 440, '9.9 HSPs', '18h left')}
  <div class="ab" style="left:560px;top:380px;width:230px">${I('headphones')}</div>${tagCard(760, 440, '14 HSPs', '38h left')}
</div>
<div class="L" data-z="0.9">${BK(o, 'left:230px;top:820px;width:620px;filter:drop-shadow(0 22px 0 rgba(36,18,10,.2));transform-origin:50% 100%')}</div>
<div class="L" data-z="1.0"><div class="ab" style="left:310px;top:540px;width:460px;background:${INK};border:6px solid #090403;border-radius:22px;padding:12px 0 8px;text-align:center;box-shadow:0 0 0 4px rgba(255,255,255,.15)">
  <div style="font:700 22px/1 'Liberation Mono',monospace;letter-spacing:.2em;color:#FF9C90">COOLING OFF</div>
  <div id="lcd" style="font:700 90px/1.05 'Liberation Mono',monospace;letter-spacing:.03em;color:#FF4B3A;text-shadow:0 0 22px rgba(255,75,58,.8)">23:59:59</div></div></div>
<div class="L" data-z="1.15" id="doorwrap"><svg class="full" viewBox="0 0 1080 1920">
  <path d="M1080 0 V1920 H980 Q1000 1000 960 0Z" fill="#F3F8FB" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/><path d="M1000 100 Q1010 1000 990 1800" stroke="#CFE2EC" stroke-width="12" fill="none"/>
  <path d="M0 0 V1920 H70 Q50 1000 90 0Z" fill="#F3F8FB" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/></svg></div>
<div class="glow" id="fog" style="left:-100px;top:1250px;width:1300px;height:700px;background:radial-gradient(ellipse at 50% 100%,rgba(255,255,255,.9),transparent 70%);opacity:.5"></div>
<div class="glow" id="flick" style="left:0;top:0;width:1080px;height:1920px;background:#fff;opacity:0"></div>`;

/* ============ fridgedoor: knocking from the inside ============ */
SHOTS.fridgedoor = (o) => `
<div class="L" data-z="0.2"><svg class="full" viewBox="0 0 1080 1920">
  <defs><linearGradient id="kw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34437F"/><stop offset="1" stop-color="#1B2250"/></linearGradient></defs>
  <rect width="1080" height="1920" fill="url(#kw)"/>${stripes('#8EA0FF', 0.1, 10, 1480)}
  <rect x="-20" y="1470" width="1120" height="470" fill="#1D1A3F" stroke="${INK}" stroke-width="8"/>
  <g stroke="#3E3A78" stroke-width="5">${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 150 - 20} 1920 L${540 + (i - 4) * 70} 1470"/>`).join('')}<path d="M0 1590 H1080 M0 1700 H1080 M0 1820 H1080"/></g>
  <rect x="640" y="720" width="360" height="440" rx="12" fill="#2A3470" stroke="${INK}" stroke-width="9"/><rect x="670" y="750" width="300" height="380" fill="#3F5AB8" opacity=".55"/><path d="M820 750 V1130 M670 940 H970" stroke="${INK}" stroke-width="9"/>
</svg></div>
<div class="L" data-z="0.6"><svg class="full" viewBox="0 0 1080 1920">
  <ellipse cx="540" cy="1590" rx="420" ry="46" fill="#000" opacity=".35"/>
  <path d="M240 390 Q240 346 284 346 H796 Q840 346 840 390 V1560 H240Z" fill="#EFE8D4" stroke="${INK}" stroke-width="12" stroke-linejoin="round"/>
  <path d="M240 700 H840" stroke="${INK}" stroke-width="12"/>
  <path d="M262 392 V1540" stroke="#FFFFFF" stroke-width="16" opacity=".7" stroke-linecap="round"/>
  <path d="M800 392 V690" stroke="#CFC6AC" stroke-width="12" opacity=".8" stroke-linecap="round"/>
  <rect x="772" y="470" width="26" height="190" rx="13" fill="#C9CFD8" stroke="${INK}" stroke-width="8"/>
  <rect x="316" y="410" width="400" height="140" rx="16" fill="${INK}" stroke="#090403" stroke-width="6"/>
  <text x="516" y="452" text-anchor="middle" font-family="Liberation Mono" font-weight="700" font-size="24" letter-spacing="5" fill="#FF9C90">COOLING OFF</text>
  <g id="lcdbox"></g>
  <rect x="520" y="1538" width="40" height="30" fill="${INK}"/>
</svg>
<div class="ab" style="left:316px;top:456px;width:400px;text-align:center"><div id="lcd" style="font:700 82px/1.05 'Liberation Mono',monospace;letter-spacing:.03em;color:#FF4B3A;text-shadow:0 0 22px rgba(255,75,58,.85)">00:00:03</div></div>
<div class="ab" style="left:300px;top:590px;width:150px;transform:rotate(-8deg)">${I('hsp')}</div>
<div class="ab" style="left:520px;top:570px;background:#FFF08A;border:5px solid ${INK};padding:12px 16px;transform:rotate(3deg);font:800 28px/1.1 'Bricolage';color:${INK};box-shadow:5px 6px 0 rgba(36,18,10,.25)">WAIT<br>24H.<br><span style="font:700 20px 'Liberation Mono',monospace">still want it?</span></div></div>
<div class="L" data-z="0.65"><div class="ab" id="fdr" style="left:0;top:0;width:1080px;height:1920px;transform-origin:540px 1130px"><svg class="full" viewBox="0 0 1080 1920">
  <path d="M240 700 H840 V1560 H240Z" fill="#F4EEDC" stroke="${INK}" stroke-width="12" stroke-linejoin="round"/>
  <path d="M262 712 V1544" stroke="#FFFFFF" stroke-width="16" opacity=".75" stroke-linecap="round"/>
  <rect x="772" y="760" width="26" height="260" rx="13" fill="#C9CFD8" stroke="${INK}" stroke-width="8"/>
  <g id="dents" style="opacity:0"><g fill="#E6DEC5" stroke="${INK}" stroke-width="6" stroke-linejoin="round"><ellipse cx="520" cy="1140" rx="92" ry="120" transform="rotate(-8 520 1140)"/><ellipse cx="450" cy="1008" rx="26" ry="50" transform="rotate(-18 450 1008)"/><ellipse cx="506" cy="990" rx="26" ry="56" transform="rotate(-4 506 990)"/><ellipse cx="566" cy="996" rx="26" ry="54" transform="rotate(10 566 996)"/><ellipse cx="612" cy="1030" rx="24" ry="44" transform="rotate(26 612 1030)"/></g>
  <path d="M440 1200 Q520 1270 612 1190" stroke="#B9AE8E" stroke-width="10" fill="none" stroke-linecap="round"/></g>
</svg></div></div>
<div class="L" data-z="0.62" style="filter:drop-shadow(0 0 22px #FF4B3A)"><svg id="glowline" class="full" viewBox="0 0 1080 1920" style="opacity:.25"><path d="M246 1562 H834 M238 704 H842 M838 706 V1560 M242 706 V1560" stroke="#FF5A3A" stroke-width="10" stroke-linecap="round" fill="none"/></svg></div>
<div class="L" data-z="1.2">${BK(o, 'left:-40px;top:820px;width:430px;filter:drop-shadow(10px 0 0 rgba(120,150,255,.5)) drop-shadow(0 20px 0 rgba(0,0,0,.35));transform-origin:50% 100%')}</div>
<div class="shade" id="kitchen" style="left:0;top:0;width:1080px;height:1920px;background:radial-gradient(ellipse at 50% 48%,rgba(255,255,255,1) 0,rgba(150,150,190,1) 55%,rgba(60,58,110,1) 100%)"></div>`;

/* ============ table: out of fries ============ */
SHOTS.table = (o) => `
<div class="L" data-z="0.2"><svg class="full" viewBox="0 0 1080 1920">
  <defs><linearGradient id="tw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34306E"/><stop offset="1" stop-color="#171436"/></linearGradient><clipPath id="twc"><rect x="650" y="350" width="360" height="520"/></clipPath></defs>
  <rect width="1080" height="1920" fill="url(#tw)"/>${stripes('#8E96E8', 0.09, 10, 1800)}
  ${r(630, 330, 400, 560, '#DCCFB0', 12, 10)}<rect x="650" y="350" width="360" height="520" fill="#2D4C8C"/>
  <g clip-path="url(#twc)">${Array.from({ length: 8 }, (_, i) => `<rect x="640" y="${362 + i * 66}" width="380" height="30" fill="#BFD2FF" opacity=".55" stroke="${INK}" stroke-width="5"/>`).join('')}</g>
  <path d="M300 0 V560" stroke="${INK}" stroke-width="8"/>
</svg>
<div class="ab zz" style="left:640px;top:460px;width:300px;filter:blur(5px) brightness(.55) saturate(.8);transform:rotate(8deg)">${zombie('GYM', '$19.99/mo', { tone: '#6E9A68' })}</div>
<div class="ab zz" style="left:760px;top:620px;width:250px;filter:blur(6px) brightness(.5) saturate(.8);transform:rotate(-6deg)">${zombie('CLOUD', '$1.49/mo', { tone: '#6E9A68' })}</div></div>
<div class="L" data-z="0.4"><svg class="full" viewBox="0 0 1080 1920">
  <path d="M300 0 V560" stroke="${INK}" stroke-width="10"/>
  <path d="M236 560 H364 L420 690 H180Z" fill="#E7A93A" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/><circle cx="300" cy="696" r="26" fill="#FFF3C0" stroke="${INK}" stroke-width="7"/></svg></div>
<div class="glow" style="left:-60px;top:690px;width:720px;height:620px;background:linear-gradient(180deg,rgba(255,238,170,.7),rgba(255,238,170,.12));clip-path:polygon(38% 0,62% 0,100% 100%,0 100%)"></div>
<div class="L" data-z="0.55" id="lampL"><svg class="full" viewBox="0 0 1080 1920">
  ${r(-30, 1100, 1140, 70, '#C98C4E', 14, 10)}${r(60, 1170, 90, 750, '#7A4A2C', 8, 10)}${r(930, 1170, 90, 750, '#7A4A2C', 8, 10)}<rect x="-30" y="1230" width="1140" height="690" fill="#0F0C22" opacity=".82"/>
</svg></div>
<div class="L" data-z="0.9">${BK(o, 'left:50px;top:600px;width:640px;filter:brightness(.85) drop-shadow(8px 0 0 rgba(255,214,120,.6)) drop-shadow(0 22px 0 rgba(0,0,0,.35));transform-origin:50% 100%')}</div>
<div class="L" data-z="1.0">
  <div class="ab" id="wal" style="left:660px;top:880px;width:290px;filter:drop-shadow(0 10px 0 rgba(0,0,0,.4))">${I('wallet')}</div>
  <svg class="ab" id="moth" style="left:760px;top:800px;width:90px" viewBox="0 0 90 60"><g stroke="${INK}" stroke-width="4" stroke-linejoin="round" fill="#E9DDC4"><path d="M45 30 Q20 -4 4 20 Q14 48 45 34Z"/><path d="M45 30 Q70 -4 86 20 Q76 48 45 34Z"/></g><rect x="42" y="22" width="6" height="26" rx="3" fill="${INK}"/></svg>
  <div class="ab" style="left:60px;top:1010px;width:360px;height:200px;border:12px solid ${INK};border-radius:34px;background:#101830;box-shadow:0 0 38px rgba(255,75,58,.55);transform:rotate(-7deg);text-align:center;padding-top:22px">
    <div style="font:700 24px/1 'Liberation Mono',monospace;color:#9CC3FF;letter-spacing:.14em">BALANCE</div><div style="font:800 88px/1.1 'Bricolage';color:#FF5A47;letter-spacing:-.03em">$0.00</div></div>
</div>
<div class="L" data-z="1.35"><svg class="full" viewBox="0 0 1080 1920" style="filter:blur(6px)"><path d="M-40 1920 V1500 Q60 1440 160 1520 V1920Z" fill="#0C0820"/><path d="M1120 1920 V1560 Q1000 1500 920 1580 V1920Z" fill="#0C0820"/></svg></div>
<div class="shade" id="lampshade" style="left:0;top:0;width:1080px;height:1920px;background:radial-gradient(ellipse at 28% 48%,rgba(255,255,255,1) 0,rgba(120,110,150,1) 62%,rgba(40,34,70,1) 100%)"></div>`;

/* ============ title card ============ */
SHOTS.title = (o) => `
<div class="L" data-z="0.2"><svg class="full" viewBox="0 0 1080 1920">
  <defs><radialGradient id="tbg" cx="50%" cy="50%" r="72%"><stop offset="0" stop-color="#8C2335"/><stop offset=".5" stop-color="#2E1033"/><stop offset="1" stop-color="#090514"/></radialGradient>
  <linearGradient id="thz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF8A5C" stop-opacity="0"/><stop offset=".7" stop-color="#FF8A5C" stop-opacity=".75"/><stop offset="1" stop-color="#FFD27A" stop-opacity=".9"/></linearGradient></defs>
  <rect width="1080" height="1920" fill="url(#tbg)"/>${stars(36, 17, 1080, 700, 0, 100)}
  <circle cx="540" cy="880" r="320" fill="#FF5A47" opacity=".55"/><circle cx="540" cy="880" r="262" fill="#FF8A5C" opacity=".4"/>
  <rect y="1180" width="1080" height="420" fill="url(#thz)"/>
  <g transform="translate(0 1130)">${city(1080, 560, 77, true).replace(/#141935/g, '#0A0616')}</g>
  <rect y="1640" width="1080" height="280" fill="#0A0616"/></svg></div>
<div class="L" data-z="0.55"><div class="ab" style="left:0;top:1280px;width:1080px;height:420px">
  <div class="ab zz" style="left:30px;top:150px;width:330px;filter:brightness(0);transform:rotate(-6deg)">${zombie('GYM', '$19.99/mo')}</div>
  <div class="ab zz" style="left:340px;top:100px;width:430px;filter:brightness(0)">${zombie('STREAMING', '$15.99/mo')}</div>
  <div class="ab zz" style="left:740px;top:160px;width:320px;filter:brightness(0);transform:rotate(7deg)">${zombie('CLOUD', '$1.49/mo')}</div></div></div>
<div class="L" data-z="0.9">
  <div class="glow" id="tglow" style="left:40px;top:640px;width:1000px;height:640px;background:radial-gradient(ellipse,rgba(255,90,70,.55),transparent 68%)"></div>
  <div class="ab" id="tt" style="left:0;right:0;top:700px;text-align:center;font:800 164px/.88 'Bricolage';letter-spacing:-.045em;color:#FFF6E6;-webkit-text-stroke:18px ${INK};paint-order:stroke fill;text-shadow:14px 16px 0 #FF5A47;white-space:pre-line">${(o.top ?? '').replace(/\n/g, '<br>')}</div>
  <div class="ab" id="ts" style="left:0;right:0;top:1030px;text-align:center;font:700 italic 46px/1 'Fraunces',serif;letter-spacing:.14em;color:#F6D88C;text-shadow:0 3px 0 rgba(0,0,0,.8)">${o.sub ?? ''}</div></div>`;

/* ============ tag: the end card ============ */
SHOTS.tag = (o) => `
<div class="L" data-z="0.1"><svg class="full" viewBox="0 0 1080 1920"><rect width="1080" height="1920" fill="#24120A"/>
  <defs><radialGradient id="tgr" cx="50%" cy="44%" r="62%"><stop offset="0" stop-color="#FF5A47"/><stop offset="1" stop-color="#7A1E18"/></radialGradient></defs><rect width="1080" height="1920" fill="url(#tgr)"/></svg></div>
<div class="L" data-z="0.5"><div class="ab" id="tmas" style="left:330px;top:330px;width:420px;filter:drop-shadow(0 18px 0 rgba(36,18,10,.3));transform-origin:50% 100%">${M('ok', 9)}</div>
  <div class="ab" id="twm" style="left:290px;top:820px;width:500px">${WM()}</div>
  <div class="ab" id="tcta" style="left:0;right:0;top:1040px;text-align:center"><span style="display:inline-block;background:#FFD23F;color:${INK};border:7px solid ${INK};border-radius:999px;padding:18px 40px;font:800 40px/1 'Bricolage';box-shadow:8px 9px 0 ${INK}">COMING SOON TO IPHONE</span></div>
  <div class="ab" id="tlk" style="left:0;right:0;top:1160px;text-align:center;font:800 48px/1 'Bricolage';color:#FFF6E6;letter-spacing:-.02em">Link in bio</div>
  <div class="ab" id="tnx" style="left:0;right:0;top:1270px;text-align:center;font:700 italic 44px/1.2 'Fraunces',serif;letter-spacing:.1em;color:#F6D88C">${o.next ?? ''}</div></div>`;
