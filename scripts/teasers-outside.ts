/** OUTSIDE panorama: x 0-1080 the tram shelter (post 3), 1080-2160 the shop window (post 2), 2160-3240 the shopfront (post 1). */
import { INK } from './story-art';
import { city } from './story-art';
import { MW, MH, GY, R, P, L, T, glow, neon, mas, standing, stars, rain, pavement, wires, wrap } from './teasers-scene';

const TRAM_BODY = '#B9BCDD';

function tram() {
  let w = '';
  // body
  w += P('M-170 700 H1060 Q1118 706 1128 770 V1030 H-170Z', TRAM_BODY, 8);
  w += `<rect x="-170" y="700" width="1240" height="34" fill="#8B8FBA" opacity=".9"/>`;
  // lit windows with people
  const xs = [-120, 70, 262, 454, 646, 838];
  xs.forEach((x, i) => {
    w += R(x, 746, 150, 118, '#FFD98A', 10, 6);
    if (i % 2 === 0) w += `<circle cx="${x + 54}" cy="800" r="19" fill="#3A1F4E"/><path d="M${x + 24} 862 Q${x + 54} 808 ${x + 84} 862Z" fill="#3A1F4E"/>`;
    if (i === 3) w += `<circle cx="${x + 100}" cy="808" r="17" fill="#6A3A5E"/><path d="M${x + 74} 862 Q${x + 100} 818 ${x + 126} 862Z" fill="#6A3A5E"/>`;
  });
  // yellow doors
  [[160, 0], [610, 0]].forEach(([x]) => {
    w += R(x as number, 744, 120, 262, '#E8B93A', 10, 7) + R((x as number) + 14, 758, 92, 112, '#FFE9A8', 8, 5) + L(`M${(x as number) + 60} 758V1000`, INK, 5);
  });
  // route LED
  w += R(330, 712, 250, 26, '#0B0716', 5, 4) + T(455, 732, '96 EAST BRUNSWICK', { font: 'Anton', size: 22, fill: '#FFB43A', anchor: 'middle', ls: 2 });
  // stripes + skirt
  w += `<rect x="-170" y="900" width="1298" height="26" fill="#3BAA6E"/><rect x="-170" y="930" width="1298" height="12" fill="#3B7DD8"/><rect x="-170" y="948" width="1298" height="82" fill="#6C6E98"/>`;
  w += L('M-170 900H1128M-170 948H1128', INK, 5);
  // windscreen nose + bogies
  w += P('M1060 706 Q1118 712 1128 770 V860 H1060Z', '#FFD98A', 7);
  [[20, 260], [700, 940]].forEach(([a, b]) => { w += R(a as number, 1028, (b as number) - (a as number), 44, '#1B1738', 12, 6); [(a as number) + 56, (b as number) - 56].forEach((cx) => (w += `<circle cx="${cx}" cy="1066" r="30" fill="#27224E" stroke="${INK}" stroke-width="7"/>`)); });
  // trolley line up to the wires
  w += L('M540 700L612 178', '#0A0716', 5);
  return w;
}

function shelter() {
  let w = '';
  // posts and roof
  w += R(206, 600, 24, 585, '#3E3C84', 6) + R(870, 600, 24, 585, '#3E3C84', 6);
  w += R(150, 548, 800, 62, '#45428F', 14, 8);
  w += `<rect x="168" y="604" width="764" height="26" fill="#FFE9A8" opacity=".9"/>`; // roof light strip
  // glass back panel
  w += `<rect x="236" y="636" width="628" height="500" fill="#9CC4F0" opacity=".1"/>` + L('M236 636V1136M864 636V1136', '#C9E0FF', 3, 0.35);
  // lightbox frame + poster
  w += R(358, 636, 384, 520, '#2C2A66', 10, 8);
  const px = 376, py = 654, pw = 348, ph = 484;
  w += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="#FFD23F"/>`;
  w += `<rect x="${px}" y="${py + ph - 54}" width="${pw}" height="54" fill="${INK}"/>`;
  w += mas('sideeye', 5, px + 54, py + 4, 240);
  w += T(px + pw / 2, py + 318, 'THERE IS A TRAM.', { size: 48, fill: INK, anchor: 'middle' });
  w += T(px + pw / 2, py + 372, 'IT GOES THERE.', { size: 48, fill: INK, anchor: 'middle' });
  w += `<rect x="${px + 52}" y="${py + 382}" width="244" height="56" fill="#EF3B2D"/>` + T(px + pw / 2, py + 427, 'IT COSTS $2.', { size: 48, fill: '#FFF6E6', anchor: 'middle' });
  w += T(px + pw / 2, py + ph - 17, 'BROKEY  ·  COMING SOON', { size: 26, fill: '#FFD23F', anchor: 'middle', ls: 2 });
  // price sticker
  w += `<g transform="rotate(-9 ${px + 64} ${py + 70})"><circle cx="${px + 64}" cy="${py + 70}" r="56" fill="#EF3B2D" stroke="${INK}" stroke-width="6"/>` + T(px + 64, py + 60, '$38 RIDE', { size: 22, fill: '#FFF6E6', anchor: 'middle' }) + T(px + 64, py + 98, '2.1 HSP', { size: 34, fill: '#FFF6E6', anchor: 'middle' }) + '</g>';
  // bench
  w += R(262, 1000, 70, 14, '#5B58A8', 6, 5) + L('M280 1014V1100M318 1014V1100', INK, 8);
  return `<g transform="translate(560 1185) scale(1.2) translate(-560 -1185)">${w}</g>`;
}

function stopPole() {
  let w = '';
  w += R(1022, 660, 20, 525, '#3E3C84', 6);
  w += R(984, 700, 94, 146, '#FFC93A', 8, 7) + T(1031, 778, '96', { size: 60, fill: INK, anchor: 'middle' }) + T(1031, 818, 'STOP 8', { size: 21, fill: INK, anchor: 'middle', ls: 1 });
  return w;
}

function windowBoard() {
  const wx = 1270, wy = 612, ww = 820, wh = 488;
  let w = '<g id="win2">';
  w += R(wx - 14, wy - 14, ww + 28, wh + 28, '#3A2C72', 10, 9); // frame
  w += `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="#FFDB8A"/>`;
  const bx = wx + 18, by = wy + 16, bw = ww - 36;
  w += R(bx, by, bw, 66, '#B3262F', 4, 6) + T(bx + bw / 2, by + 48, 'EVERYTHING COSTS SNACK PACKS', { size: 42, fill: '#FFF1D0', anchor: 'middle', ls: 3 });
  w += `<rect x="${bx}" y="${by + 66}" width="${bw}" height="350" fill="#231A52"/>`;
  const rows: [string, string][] = [['SNEAKERS', '9.9'], ['RIDE ACROSS TOWN', '2.1'], ['HEADPHONES', '14']];
  rows.forEach(([n, p], i) => {
    const ry = by + 66 + i * 86;
    if (i) w += L(`M${bx + 24} ${ry}H${bx + bw - 24}`, '#4B3D96', 3);
    w += T(bx + 30, ry + 60, n, { size: 46, fill: '#FFF1D0', ls: 1.5 });
    if (i) w += L(`M${bx + 30 + (n.length * 23 + 20)} ${ry + 54}H${bx + bw - 214}`, '#6A5BC0', 3, 0.8, 'stroke-dasharray="2 9"');
    w += T(bx + bw - 106, ry + 66, p, { size: 70, fill: i === 0 ? '#FFD83A' : '#FFF1D0', anchor: 'end' }) + T(bx + bw - 28, ry + 64, 'HSP', { size: 26, fill: '#B8A8FF', anchor: 'end', ls: 1 });
  });
  w += T(bx + 30, by + 66 + 350 - 22, '1 HSP = $18', { font: 'Anton', size: 34, fill: '#FFD83A', ls: 2 });
  // red marker circle round the sneakers row + the real price in dollars
  const cy = by + 66 + 43;
  w += L(`M${bx + 8} ${cy - 10} Q${bx + bw / 2} ${cy - 58} ${bx + bw - 8} ${cy - 8} Q${bx + bw + 6} ${cy + 46} ${bx + bw / 2} ${cy + 48} Q${bx + 2} ${cy + 44} ${bx + 6} ${cy + 2}`, '#FF4A5E', 7);
  w += T(bx + 262, cy + 20, '$179?!', { font: 'Marker', size: 54, fill: '#FF6A7A', rot: -4 });
  w += '</g>';
  return w;
}

function shopfront() {
  let w = '';
  // facade
  w += R(1190, -30, 2100, GY + 30, '#2A1F58', 0, 8);
  for (let x = 1290, i = 0; x < 3200; x += 200, i++) w += R(x, 36, 120, 124, i % 3 === 1 ? '#FFC96A' : i % 3 === 2 ? '#3C2D86' : '#18123F', 8, 7) + (i % 3 === 1 ? `<path d="M${x + 60} 36V160M${x} 98H${x + 120}" stroke="${INK}" stroke-width="6"/>` : '');
  w += `<rect x="1190" y="196" width="2100" height="44" fill="#3A2C72"/>` + L('M1190 196H3290M1190 240H3290', INK, 6);
  for (let i = 0; i < 6; i++) w += `<rect x="1190" y="${520 + i * 90}" width="2100" height="3" fill="#1E1646" opacity=".5"/>`;
  // pilaster at the seam between window and shopfront
  w += R(2104, 240, 78, GY - 240, '#3A2C72', 0, 7);
  // post 2 fascia board
  w += R(1270, 262, 820, 190, '#B3262F', 10, 8);
  w += `<rect x="1286" y="278" width="788" height="158" fill="none" stroke="#FFF1D0" stroke-width="3" rx="4" opacity=".8"/>`;
  w += T(1680, 364, 'KEBABS · PIDE · HSP', { size: 96, fill: '#FFF1D0', anchor: 'middle', ls: 3 });
  w += T(1680, 414, 'COMING SOON TO iPHONE', { size: 36, fill: '#FFD83A', anchor: 'middle', ls: 6 });
  // post 1 neon backer
  w += `<g id="sign1">` + R(2230, 256, 940, 232, '#140F30', 22, 8) + neon(2700, 404, 'BROKEY', 178, '#FFD83A') + neon(2700, 462, 'HALAL SNACK PACKS', 42, '#FF4A5E') + `</g>`;
  return w;
}

function awning() {
  let w = '';
  const x0 = 1190, x1 = 3290, y0 = 492, y1 = 590, sw = 70;
  let path = `M${x0} ${y0}H${x1}V${y1}`;
  for (let x = x1; x > x0; x -= sw) path += `q${-sw / 2} 34 ${-sw} 0`;
  path += 'Z';
  const id = 'awn';
  w += `<defs><clipPath id="${id}"><path d="${path}"/></clipPath></defs><g clip-path="url(#${id})">`;
  for (let x = x0; x < x1; x += sw) w += `<rect x="${x}" y="${y0}" width="${sw}" height="${y1 - y0 + 40}" fill="${((x - x0) / sw) % 2 ? '#C9B590' : '#9B2C4A'}"/>`;
  w += `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="30" fill="#000" opacity=".28"/></g>`;
  w += `<path d="${path}" fill="none" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
  return w;
}

function shop1() {
  let w = '';
  // left window + door
  w += R(2214, 612, 520, 488, '#3A2C72', 10, 9) + `<rect x="2228" y="626" width="492" height="460" fill="#FFDB8A"/>`;
  w += `<rect x="2228" y="626" width="492" height="150" fill="#FFB84A" opacity=".5"/>`;
  w += R(2776, 612, 400, 488, '#3A2C72', 10, 9) + `<rect x="2790" y="626" width="372" height="460" fill="#FFDB8A"/>`;
  w += L('M2976 626V1086', INK, 8) + R(2938, 840, 12, 90, '#D9D2F0', 6, 4) + R(3002, 840, 12, 90, '#D9D2F0', 6, 4);
  w += `<rect x="2822" y="640" width="308" height="136" fill="#FFDB8A"/>`;
  w += T(2976, 700, 'OPEN LATE', { size: 66, fill: '#B3262F', anchor: 'middle', ls: 3, stroke: '#FFF1D0', sw: 6 });
  w += T(2976, 752, '11AM - 4AM · 7 NIGHTS', { size: 28, fill: INK, anchor: 'middle', ls: 3 });
  // halal sticker
  w += `<circle cx="2272" cy="668" r="44" fill="#2E9E5B" stroke="${INK}" stroke-width="6"/>` + T(2272, 679, 'HALAL', { size: 26, fill: '#FFF6E6', anchor: 'middle', ls: 1 });
  return w;
}

function aframe() {
  let w = '';
  w += P('M2860 1186 L2902 800 H3090 L3132 1186', '#3B2B6A', 9);
  w += R(2884, 812, 224, 310, '#24211F', 6, 7);
  w += `<rect x="2894" y="822" width="204" height="290" fill="#2F2D2A"/>`;
  w += T(2996, 888, '1 HSP', { font: 'Marker', size: 62, fill: '#FFF6E6', anchor: 'middle', rot: -3 });
  w += T(2996, 948, '= $18', { font: 'Marker', size: 62, fill: '#FFD83A', anchor: 'middle', rot: -2 });
  w += L('M2916 970H3076', '#FFF6E6', 4, 0.8);
  w += T(2996, 1012, 'we have opinions', { font: 'Marker', size: 27, fill: '#FFF6E6', anchor: 'middle', rot: -2 });
  w += T(2996, 1074, 'COMING SOON', { font: 'Marker', size: 34, fill: '#FF6A7A', anchor: 'middle', rot: 2 });
  return w;
}

function puddles() {
  const pud = (cid: string, cx: number, cy: number, rx: number, ry: number, src: string, c: number, col: string) =>
    `<defs><clipPath id="${cid}"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/></clipPath></defs><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#0E0B2E" opacity=".7"/><g clip-path="url(#${cid})"><use href="#${src}" transform="translate(0 ${c}) scale(1 -1)" opacity=".75" filter="url(#bl3)"/></g><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${col}" stroke-width="3" opacity=".4"/>`;
  const fries = [[2760, 1236, -62], [2812, 1262, 24], [2870, 1246, 80], [2930, 1272, 8]].map(([x, y, r]) => `<rect x="${x}" y="${y}" width="16" height="64" rx="7" fill="#FFD23F" stroke="${INK}" stroke-width="5" transform="rotate(${r} ${x} ${y})"/>`).join('');
  const receipt = `<g transform="rotate(-14 1480 1330)"><path d="M1440 1306h86l-6 62h-76z" fill="#EDE3CC" stroke="${INK}" stroke-width="5"/><path d="M1452 1322h56M1452 1336h40M1452 1350h50" stroke="#8A7F6A" stroke-width="4"/></g>`;
  const drain = `<g><rect x="2010" y="1236" width="130" height="38" rx="6" fill="#0E0B2E" stroke="${INK}" stroke-width="5"/>${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${2028 + i * 18} 1242v26" stroke="#3C3A7A" stroke-width="5"/>`).join('')}</g>`;
  const bin = `<g>${R(76, 980, 118, 190, '#4A4796', 14, 7)}${R(64, 958, 142, 34, '#5B58A8', 12, 7)}<path d="M96 990v140M134 990v140M172 990v140" stroke="#1B1A47" stroke-width="5"/></g>`;
  return pud('pud1', 2540, 1346, 360, 52, 'sign1', 1706, '#FFD83A') + receipt + drain + fries + bin;
}

export function outside() {
  const flyers = () => {
    let w = '';
    // room for rent, with tear-off tabs (some torn), scaled to sit above the shelter roof
    w += `<g transform="translate(811 318) scale(.74) rotate(-2) translate(-811 -417)">` + R(716, 292, 190, 250, '#FFF6E6', 2, 5) + T(811, 340, 'ROOM', { size: 40, fill: INK, anchor: 'middle' }) + T(811, 384, 'FOR RENT', { size: 40, fill: INK, anchor: 'middle' }) + T(811, 430, '$280 / WK', { size: 34, fill: '#B3262F', anchor: 'middle' }) + T(811, 462, 'BRUNSWICK · NO BOND', { size: 14, fill: INK, anchor: 'middle', ls: 1 });
    [0, 1, 2, 3, 4].forEach((i) => { if (i !== 1 && i !== 3) w += R(722 + i * 36, 482, 32, 62, '#FFF6E6', 1, 3) + `<path d="M${738 + i * 36} 490v44" stroke="${INK}" stroke-width="3" opacity=".5"/>`; });
    w += '</g>';
    // gig poster
    w += `<g transform="translate(400 316) scale(.74) rotate(3) translate(-400 -397)">` + R(300, 262, 200, 270, '#FF4A5E', 2, 5) + T(400, 330, 'GIG', { size: 76, fill: '#FFF6E6', anchor: 'middle' }) + T(400, 392, 'NIGHT', { size: 62, fill: '#FFD23F', anchor: 'middle' }) + T(400, 440, 'FRI 9PM', { size: 38, fill: INK, anchor: 'middle' }) + T(400, 490, 'FREE ENTRY', { size: 26, fill: '#FFF6E6', anchor: 'middle', ls: 2 }) + '</g>';
    return w;
  };
  const farBuilding = `<g>${`<rect x="-20" y="190" width="1230" height="810" fill="url(#brick)" stroke="${INK}" stroke-width="8"/>`}
  ${[0, 1, 2].map((r) => [60, 330, 600, 870].map((x, c) => ((r === 0 && (c === 1 || c === 2)) || (r === 1 && (c === 1 || c === 2)) ? '' : R(x, 250 + r * 220, 150, 150, (r + c) % 3 === 1 ? '#FFD27A' : '#1A1642', 8, 7))).join('')).join('')}${flyers()}</g>`;
  const road = `<rect x="0" y="1000" width="1260" height="${GY - 1000}" fill="#171532"/><path d="M0 1086H1260M0 1100H1260" stroke="#4B4A8F" stroke-width="3" opacity=".7"/>`;
  const sky = `<rect width="${MW}" height="${GY}" fill="url(#sky)"/>${stars(70, 5, MW, 520, 0, 20)}<g transform="translate(0 ${GY - 640})" opacity=".9">${city(MW, 640, 21)}</g>`;
  const pole = `<g>${R(1128, 100, 28, GY - 100, '#3A2C72', 0, 7)}${L('M1142 120 L1180 128', INK, 8)}</g>`;
  const body = [
    sky,
    farBuilding,
    road,
    shopfront(),
    awning(),
    windowBoard(),
    shop1(),
    pole,
    pavement(),
    // glows that spill onto the wet street
    `<g filter="url(#bl8)"><polygon points="1280,1100 2080,1100 2260,1440 1100,1440" fill="#FFC25A" opacity=".2" style="mix-blend-mode:screen"/><polygon points="2240,1100 3180,1100 3240,1440 2160,1440" fill="#FFD83A" opacity=".14" style="mix-blend-mode:screen"/></g>`,
    `<use href="#win2" transform="translate(0 2200) scale(1 -1)" opacity=".3" filter="url(#bl8)" clip-path="url(#street)"/>`,
    `<g>${[1318, 1374].map((y) => `<rect x="0" y="${y}" width="${MW}" height="14" fill="#15122F" stroke="${INK}" stroke-width="5"/><rect x="0" y="${y + 2}" width="${MW}" height="3" fill="#8F8AE0" opacity=".55"/>`).join('')}${Array.from({ length: 22 }, (_, i) => `<rect x="${i * 150 + 40}" y="1332" width="22" height="42" fill="#0E0B2E" opacity=".55"/>`).join('')}</g>`,
    puddles(),
    standing(`<g transform="translate(-130 0)">${tram()}</g>`, GY - 30, 0.0, 5),
    standing(shelter() + stopPole(), 1185, 0.34, 5),
    standing(aframe() + mas('happy', 9, 2190, 560, 600), 1180, 0.3, 5),
    standing(mas('tempted', 6, 1850, 962, 232), 1175, 0.3, 5),
    // light
    glow(2700, 340, 900, 260, '#FFD83A', 0.5),
    glow(2700, 470, 700, 130, '#FF4A5E', 0.4),
    glow(1680, 860, 720, 380, '#FFC25A', 0.5),
    glow(2470, 860, 420, 320, '#FFC25A', 0.4),
    glow(3000, 860, 420, 320, '#FFC25A', 0.4),
    glow(550, 900, 520, 560, '#FFE08A', 0.45),
    glow(550, 1300, 520, 150, '#FFE08A', 0.35),
    glow(1680, 1260, 760, 160, '#FFC25A', 0.35),
    glow(2700, 1260, 900, 170, '#FFD83A', 0.3),
    wires(120),
    rain(520, 7),
  ].join('');
  return wrap(body);
}
