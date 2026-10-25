/**
 * Inside panorama of the Brokey kebab shop (3240x1440), cut into three posts:
 *   x 0-1080     t6-app     neon COMING SOON, Brokey proud, the real app on a propped phone
 *   x 1080-2160  t5-fries   doner spit, a tray with 3 fries, Thursday whiteboard, Brokey sad
 *   x 2160-3240  t4-fridge  the glass fridge (24h timer, headphones), Brokey tempted
 * Continuous across seams: ceiling tubes, the red tile band, the steel counter, the floor.
 * Elevation view, flat fills + ink outlines (same hand as the mascot), light painted on top.
 */
import { INK, root } from './story-art';
import { MW, MH, R, P, L, T, glow, neon, mas, standing, wrap } from './teasers-scene';

const FL = 1190; // floor line
const CT = 880; // counter top

const DEFS2 = `<defs>
<pattern id="ptile" width="90" height="90" patternUnits="userSpaceOnUse"><rect width="90" height="90" fill="#2B1D57"/><path d="M0 0H90V90H0Z" stroke="#1C1240" stroke-width="3" fill="none"/><rect x="5" y="5" width="80" height="26" fill="#3A2A72" opacity=".5"/></pattern>
<pattern id="ltile" width="70" height="70" patternUnits="userSpaceOnUse"><rect width="70" height="70" fill="#2F7482"/><path d="M0 0H70V70H0Z" stroke="#1B4150" stroke-width="3" fill="none"/><rect x="4" y="4" width="62" height="20" fill="#4A93A0" opacity=".45"/></pattern>
<pattern id="chk" width="180" height="120" patternUnits="userSpaceOnUse"><rect width="180" height="120" fill="#2A2058"/><rect width="90" height="60" fill="#3A2E78"/><rect x="90" y="60" width="90" height="60" fill="#3A2E78"/><path d="M0 0H180M0 60H180M90 0V120" stroke="#1B1443" stroke-width="3"/></pattern>
<linearGradient id="steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D3D6F2"/><stop offset=".55" stop-color="#A3A8D6"/><stop offset="1" stop-color="#737AB4"/></linearGradient>
<linearGradient id="cone" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7A421F"/><stop offset=".5" stop-color="#C98040"/><stop offset="1" stop-color="#8A4E26"/></linearGradient>
<clipPath id="scr"><rect x="700" y="244" width="280" height="608" rx="36"/></clipPath>
<clipPath id="ico"><rect x="106" y="962" width="150" height="150" rx="34"/></clipPath>
</defs>`;

/* ---------- room shell ---------- */
function room() {
  let w = '';
  w += `<rect width="${MW}" height="${MH}" fill="#1A1240"/>`;
  w += `<rect x="0" y="100" width="${MW}" height="${730 - 100}" fill="url(#ptile)"/>`;
  w += `<rect x="0" y="776" width="${MW}" height="${FL - 776}" fill="url(#ltile)"/>`;
  // red tile band
  w += `<rect x="-10" y="730" width="${MW + 20}" height="46" fill="#B3262F" stroke="${INK}" stroke-width="7"/>`;
  w += L(`M0 744H${MW}`, '#E4505B', 4, 0.6);
  // ceiling
  w += `<rect x="0" y="0" width="${MW}" height="100" fill="#150E36"/><path d="M0 100H${MW}" stroke="${INK}" stroke-width="9"/>`;
  // floor
  w += `<rect x="0" y="${FL}" width="${MW}" height="${MH - FL}" fill="url(#chk)"/><rect x="0" y="${FL}" width="${MW}" height="${MH - FL}" fill="url(#wetpave)"/>`;
  w += `<rect x="-10" y="${FL - 20}" width="${MW + 20}" height="26" fill="#1C1240" stroke="${INK}" stroke-width="7"/>`;
  return w;
}

function tubes() {
  let w = '';
  for (let i = 0; i < 6; i++) {
    const x = 60 + i * 540;
    w += `<polygon points="${x + 20},88 ${x + 440},88 ${x + 560},760 ${x - 100},760" fill="#E6F4FF" opacity=".07" style="mix-blend-mode:screen"/>`;
    w += R(x, 40, 460, 46, '#8A86C8', 8, 7) + R(x + 16, 52, 428, 22, '#F4FBFF', 11, 4);
    w += L(`M${x + 70} 40V0M${x + 390} 40V0`, INK, 6);
  }
  return w;
}

/* ---------- counter ---------- */
function counter() {
  let w = '';
  w += R(-40, CT + 22, 2190, FL - CT - 22, 'url(#steel)', 0, 8);
  for (let x = 60; x < 2150; x += 150) w += L(`M${x} ${CT + 50}V${FL - 60}`, '#6A6FAE', 4, 0.55) + L(`M${x + 12} ${CT + 50}V${FL - 60}`, '#EEF0FF', 3, 0.5);
  [480, 1040, 1600].forEach((x) => (w += L(`M${x} ${CT + 24}V${FL - 48}`, INK, 6)));
  w += R(-40, FL - 52, 2190, 52, '#2E2A66', 0, 7);
  w += R(-60, CT - 6, 2210, 36, '#E3E5F8', 8, 8);
  w += L(`M-40 ${CT + 2}H2140`, '#FFFFFF', 4, 0.8);
  return w;
}

/* ---------- left post: the app ---------- */
function leftTile() {
  let w = '';
  // neon sign on a dark backer
  w += R(50, 150, 560, 380, '#150E36', 24, 8) + R(66, 166, 528, 348, 'none', 18, 3, '#3A2A72');
  w += neon(330, 292, 'COMING', 138, '#FF5FA8', 'middle', '#FFE6F2');
  w += neon(330, 430, 'SOON', 138, '#FF5FA8', 'middle', '#FFE6F2');
  w += neon(330, 494, 'FOR iPHONE', 46, '#4FF0D2', 'middle', '#E6FFF9');
  w += L('M200 150V100M460 150V100', INK, 6);

  // sauce bottles
  const bottle = (x: number, c: string, cap: string) => R(x, 790, 38, 84, c, 14, 6) + R(x + 9, 764, 20, 30, c, 6, 5) + P(`M${x + 12} 764L${x + 19} 740L${x + 26} 764Z`, cap, 5);
  w += bottle(70, '#E13A44', '#F7F2E4') + bottle(114, '#F7F2E4', '#E13A44') + bottle(158, '#E8B52B', '#E13A44');

  // phone: bezel, real screenshot, glow
  w += `<g transform="rotate(-3 840 874)">`;
  w += R(686, 230, 308, 636, '#17122E', 52, 8);
  w += `<image href="file://${root}/store/raw/1-home.png" x="700" y="244" width="280" height="608" preserveAspectRatio="xMidYMid slice" clip-path="url(#scr)"/>`;
  w += R(808, 254, 64, 18, '#0B0A1C', 9, 0, '#0B0A1C');
  w += R(770, 862, 140, 14, '#2A2058', 5, 6);
  w += '</g>';

  return w;
}

function sticker() {
  let w = '';
  // sticker with the real icon and the three promises
  w += `<g transform="rotate(-2 360 1030)">${R(80, 930, 560, 200, '#FFF6E6', 28, 7)}`;
  w += `<image href="file://${root}/assets/icon.png" x="106" y="962" width="150" height="150" clip-path="url(#ico)"/>${R(106, 962, 150, 150, 'none', 34, 6)}`;
  w += T(290, 1020, 'Free.', { font: 'Marker', size: 44, fill: INK });
  w += T(290, 1066, 'No bank login.', { font: 'Marker', size: 44, fill: INK });
  w += T(290, 1112, 'No ads.', { font: 'Marker', size: 44, fill: '#B3262F' });
  w += '</g>';
  return w;
}

/* ---------- middle: doner, fries, whiteboard ---------- */
function doner() {
  let w = '';
  w += R(1283, 250, 14, 620, '#C9CCE8', 3, 5);
  // layered meat: stacked bumpy slabs, wide at the top, narrow at the bottom
  const cols = ['#A65E2C', '#7C4020', '#C27A3C', '#8E4A24', '#B5693A', '#6E381B', '#C98040', '#8A4622', '#A65E2C', '#7C4020'];
  const n = 10, y0 = 336, y1 = 838, hh = (y1 - y0) / n;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const half = 112 - t * 52 + (i % 3 === 0 ? 6 : i % 3 === 1 ? -4 : 2);
    const wob = (i % 2 ? 5 : -5);
    const yt = y0 + i * hh, yb = yt + hh + 6;
    w += P(`M${1290 - half} ${yt + 6}Q${1290 - half - 8 + wob} ${yt + hh / 2} ${1290 - half + 2} ${yb}L${1290 + half - 2} ${yb}Q${1290 + half + 8 + wob} ${yt + hh / 2} ${1290 + half} ${yt + 6}Z`, cols[i], 6);
    w += L(`M${1290 - half + 14} ${yt + 16}Q${1290} ${yt + 28} ${1290 + half - 14} ${yt + 16}`, i % 2 ? '#E9B070' : '#4C2410', 4, 0.6);
  }
  w += `<ellipse cx="1290" cy="338" rx="116" ry="26" fill="#D99650" stroke="${INK}" stroke-width="7"/>`;
  w += `<ellipse cx="1290" cy="336" rx="80" ry="14" fill="#B8702F" opacity=".7"/>`;
  w += R(1272, 232, 36, 30, '#C9CCE8', 8, 6) + R(1284, 214, 12, 22, '#C9CCE8', 3, 5);
  // fat drips
  w += P('M1250 838q-4 22 0 36q8 4 10 -8q2 -14 -2 -28z', '#E9B070', 5) + P('M1330 838q-3 16 2 26q8 2 8 -8q0 -10 -4 -18z', '#E9B070', 5);
  w += R(1190, 856, 200, 18, '#B7BAE0', 6, 6) + R(1170, 870, 240, 26, '#8E94CC', 8, 6);
  // heater
  w += R(1436, 330, 62, 540, '#2A1B34', 8, 7);
  [1450, 1467, 1484].forEach((x) => (w += R(x, 350, 8, 500, '#FF9A3A', 4, 0)));
  return w;
}

function fryTray() {
  let w = '';
  w += P('M1468 838H1792L1772 880H1488Z', '#B9BCE0', 7);
  w += L('M1490 852H1772', '#FFFFFF', 4, 0.7);
  const fry = (x: number, y: number, r: number) => `<g transform="rotate(${r} ${x + 95} ${y + 17})">${R(x, y, 190, 34, '#FFD23F', 15, 5)}${L(`M${x + 14} ${y + 11}H${x + 150}`, '#FFF0A0', 5, 0.85)}</g>`;
  w += fry(1500, 826, -4) + fry(1572, 804, 5) + fry(1540, 784, -9);
  return w;
}

function whiteboard() {
  let w = '';
  w += R(1620, 190, 470, 380, '#F6F4FF', 10, 9);
  w += R(1632, 202, 446, 356, 'none', 4, 3, '#D7D3EE');
  w += L('M1700 300q80 -14 170 -4', '#DAD6EE', 18, 0.5) + L('M1900 470q70 8 120 -6', '#DAD6EE', 14, 0.45);
  w += T(1855, 290, 'THURSDAY', { font: 'Marker', size: 80, fill: INK, anchor: 'middle', rot: -2 });
  w += T(1855, 376, '3 FRIES LEFT', { font: 'Marker', size: 56, fill: '#C9202E', anchor: 'middle', rot: 1 });
  for (let i = 0; i < 9; i++) {
    const x = 1664 + i * 42;
    if (i < 6) w += R(x, 410, 22, 78, 'none', 8, 4, '#B8B2D4') + L(`M${x - 6} ${416}L${x + 28} ${482}M${x + 28} ${416}L${x - 6} ${482}`, '#7A7399', 5);
    else w += R(x, 410, 22, 78, '#FFD23F', 8, 5);
  }
  w += T(1855, 540, 'resets monday', { font: 'Marker', size: 32, fill: '#6B5E8C', anchor: 'middle' });
  w += R(1700, 566, 300, 14, '#9EA3CF', 5, 6);
  [['#E13A44', 1730], ['#2F6FD0', 1790], ['#24120A', 1850]].forEach(([c, x]) => (w += R(+x, 554, 50, 14, '#F6F4FF', 5, 4) + R(+x + 34, 554, 16, 14, String(c), 3, 3)));
  return w;
}

/* ---------- right: the fridge ---------- */
function fridge() {
  let w = '';
  const X = 2650, Y = 300, FW = 540, IL = X + 28, IW = FW - 56;
  w += R(X, Y, FW, 890, '#3B3586', 18, 9);
  w += R(X + 16, Y + 16, FW - 32, 84, '#FFD83A', 10, 7) + T(X + FW / 2, Y + 82, 'THE FRIDGE', { size: 66, fill: INK, anchor: 'middle', ls: 3 });
  w += R(X + 16, Y + 110, FW - 32, 78, '#0B0A1C', 10, 7);
  w += T(X + 34, Y + 140, 'COOLING OFF', { size: 17, fill: '#FF8A8A', ls: 3 }) + T(X + FW - 34, Y + 140, '24H', { size: 17, fill: '#FF8A8A', anchor: 'end', ls: 3 });
  w += `<g filter="url(#bl3)"><text x="${X + FW / 2}" y="${Y + 176}" font-family="Anton" font-size="52" fill="#FF3B3B" text-anchor="middle" letter-spacing="5">23:59:41</text></g>`;
  w += T(X + FW / 2, Y + 176, '23:59:41', { size: 52, fill: '#FF6B6B', anchor: 'middle', ls: 5 });
  // glass
  w += R(X + 16, Y + 198, FW - 32, 650, '#B8E9F7', 8, 8);
  const s0 = Y + 330, s1 = Y + 612, s2 = Y + 836;
  const cols = ['#FF5A6E', '#38C6B5', '#FFD23F', '#6E7CF0'];
  for (let i = 0; i < 9; i++) {
    const x = IL + 6 + i * 54;
    w += R(x, s0 - 104, 46, 104, cols[i % 4], 9, 5) + R(x + 2, s0 - 74, 42, 30, '#FFF6E6', 0, 3);
  }
  for (let i = 0; i < 8; i++) {
    const x = IL + 12 + i * 60;
    w += R(x + 10, s2 - 150, 24, 30, '#E8E4F8', 6, 5) + R(x, s2 - 124, 44, 124, '#FFF6E6', 14, 5) + R(x + 2, s2 - 84, 40, 28, i % 2 ? '#2F6FD0' : '#E13A44', 0, 3);
  }
  [s0, s1, s2].forEach((y) => (w += R(IL, y, IW, 12, '#8E9AD8', 3, 6)));
  // headphones, lit and big
  const cx = X + FW / 2, base = s1;
  w += glow(cx, base - 120, 280, 190, '#FFF6D8', 0.75);
  w += `<g transform="translate(${cx} ${base}) scale(1.38) translate(${-cx} ${-base})">`;
  w += L(`M${cx - 97} ${base - 112}C${cx - 97} ${base - 214} ${cx + 97} ${base - 214} ${cx + 97} ${base - 112}`, INK, 26);
  w += L(`M${cx - 97} ${base - 112}C${cx - 97} ${base - 214} ${cx + 97} ${base - 214} ${cx + 97} ${base - 112}`, '#5B4FC0', 14);
  [[cx - 99, -1], [cx + 99, 1]].forEach(([x, sgn]) => {
    w += `<ellipse cx="${x}" cy="${base - 62}" rx="38" ry="64" fill="#E8344A" stroke="${INK}" stroke-width="7"/>`;
    w += `<ellipse cx="${+x - sgn * 22}" cy="${base - 62}" rx="15" ry="48" fill="#FFF6E6" stroke="${INK}" stroke-width="5"/>`;
  });
  w += `<g transform="rotate(-3 ${cx} ${base - 60})">${R(cx - 42, base - 96, 84, 64, '#FFF6E6', 4, 5)}${T(cx, base - 60, '$249', { size: 30, fill: INK, anchor: 'middle' })}${T(cx, base - 40, '14 HSP', { size: 18, fill: '#B3262F', anchor: 'middle', ls: 1 })}</g>`;
  w += '</g>';
  // glass sheen
  w += `<polygon points="${X + 40},${Y + 198} ${X + 120},${Y + 198} ${X + 20},${Y + 848} ${X - 60},${Y + 848}" fill="#FFFFFF" opacity=".16"/><polygon points="${X + 190},${Y + 198} ${X + 214},${Y + 198} ${X + 114},${Y + 848} ${X + 90},${Y + 848}" fill="#FFFFFF" opacity=".14"/>`;
  w += R(X + 26, Y + 330, 16, 250, '#F0E6C8', 6, 5);
  // sticky note
  w += `<g transform="rotate(6 ${X + 440} ${Y + 290})">${R(X + 380, Y + 226, 124, 124, '#FFE14A', 3, 4)}${T(X + 442, Y + 280, '24H.', { font: 'Marker', size: 44, fill: INK, anchor: 'middle' })}${T(X + 442, Y + 312, 'THEN ASK', { font: 'Marker', size: 22, fill: INK, anchor: 'middle' })}${T(X + 442, Y + 336, 'AGAIN.', { font: 'Marker', size: 22, fill: INK, anchor: 'middle' })}</g>`;
  // plinth
  w += R(X + 16, Y + 850, FW - 32, 40, '#B3262F', 8, 7) + T(X + FW / 2, Y + 881, 'HANDS OFF THE CARD.', { size: 28, fill: '#FFF6E6', anchor: 'middle', ls: 3 });
  return w;
}

function wallRight() {
  let w = '';
  // clock showing late
  const cx = 2395, cy = 270, r = 72;
  w += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#FFF6E6" stroke="${INK}" stroke-width="8"/>`;
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    w += L(`M${(cx + Math.sin(a) * (r - 8)).toFixed(1)} ${(cy - Math.cos(a) * (r - 8)).toFixed(1)}L${(cx + Math.sin(a) * (r - 18)).toFixed(1)} ${(cy - Math.cos(a) * (r - 18)).toFixed(1)}`, INK, 4);
  }
  w += L(`M${cx} ${cy}L${cx + 26} ${cy - 30}`, INK, 8) + L(`M${cx} ${cy}L${cx - 6} ${cy - 52}`, INK, 5) + `<circle cx="${cx}" cy="${cy}" r="6" fill="#B3262F"/>`;
  // sign
  w += R(2200, 420, 400, 220, '#FFF6E6', 10, 8) + R(2212, 432, 376, 196, 'none', 6, 3, '#B3262F');
  w += T(2400, 490, 'WE ACCEPT', { size: 52, fill: '#B3262F', anchor: 'middle', ls: 4 });
  w += T(2400, 546, 'CARD. CASH.', { size: 52, fill: INK, anchor: 'middle', ls: 3 });
  w += T(2400, 604, 'SELF CONTROL: SOON', { size: 33, fill: INK, anchor: 'middle', ls: 2 });
  return w;
}

function display() {
  let w = '';
  w += R(1110, 925, 1010, 215, '#CFF2F7', 10, 8);
  const foods = ['#E8443A', '#8CCB5E', '#9B4DB0', '#F0E2F4', '#D6312F', '#B4C94A', '#E9C98A', '#FFF6E6'];
  foods.forEach((c, i) => {
    const x = 1128 + i * 122;
    w += R(x, 1062, 116, 62, '#A3A8D6', 6, 6);
    w += P(`M${x + 6} 1066Q${x + 20} 1010 ${x + 58} 1008Q${x + 96} 1010 ${x + 110} 1066Z`, c, 6);
    w += `<circle cx="${x + 40}" cy="1038" r="5" fill="#FFFFFF" opacity=".6"/><circle cx="${x + 72}" cy="1030" r="4" fill="#FFFFFF" opacity=".5"/>`;
  });
  w += `<polygon points="1122,938 1360,938 1230,1056 1122,1056" fill="#FFFFFF" opacity=".16"/><polygon points="1600,938 1660,938 1540,1056 1480,1056" fill="#FFFFFF" opacity=".12"/>`;
  w += R(1110, 925, 1010, 14, '#8E94CC', 4, 6);
  return w;
}

function floorProps() {
  let w = '';
  // wet floor sign
  w += P('M1468 1392L1508 1236H1572L1612 1392Z', '#FFD23F', 7);
  w += T(1540, 1296, 'WET', { size: 36, fill: INK, anchor: 'middle', ls: 2 }) + T(1540, 1340, 'FLOOR', { size: 36, fill: INK, anchor: 'middle', ls: 2 });
  w += L('M1520 1230h40', INK, 8);
  // stray fries and a receipt
  w += `<rect x="1900" y="1290" width="14" height="58" rx="6" fill="#FFD23F" stroke="${INK}" stroke-width="5" transform="rotate(64 1900 1290)"/><rect x="1990" y="1330" width="14" height="58" rx="6" fill="#FFD23F" stroke="${INK}" stroke-width="5" transform="rotate(-20 1990 1330)"/>`;
  w += `<g transform="rotate(10 760 1350)"><path d="M720 1326h80l-6 62h-70z" fill="#EDE3CC" stroke="${INK}" stroke-width="5"/><path d="M732 1342h52M732 1356h38M732 1370h46" stroke="#8A7F6A" stroke-width="4"/></g>`;
  return w;
}

export function inside() {
  const body = [
    room(),
    tubes(),
    wallRight(),
    leftTile(),
    standing(counter() + display(), FL, 0.2, 5),
    sticker(),
    doner(),
    fryTray(),
    whiteboard(),
    mas('sad', 3, 1810, 594, 300),
    mas('proud', 9, 230, 566, 330),
    standing(fridge(), FL, 0.14, 5),
    floorProps(),
    standing(mas('tempted', 6, 2230, 889, 360), 1225, 0.2, 5),
    // light
    ...Array.from({ length: 6 }, (_, i) => glow(60 + i * 540 + 230, 110, 360, 150, '#E6F4FF', 0.5)),
    glow(330, 330, 480, 300, '#FF5FA8', 0.4),
    glow(840, 560, 330, 420, '#CFE2FF', 0.3),
    glow(1330, 620, 340, 380, '#FF8A2A', 0.45),
    glow(1620, 840, 260, 90, '#FFE08A', 0.45),
    glow(2920, 800, 340, 440, '#BFF3FF', 0.28),
    glow(2920, 1210, 560, 90, '#FFE08A', 0.2),
  ].join('');
  return wrap(DEFS2 + body);
}
