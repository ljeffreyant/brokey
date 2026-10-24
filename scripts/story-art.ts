/** Shared art helpers for the Broke Apocalypse story (mascot, icons, zombie subscriptions, city). */
import path from 'node:path';
import { mascot, Mood } from '../src/art/mascot';
import { sceneInner, viewBoxOf } from '../src/art/scene';
import { iconScene } from '../src/art/icons';
import { logoMark } from '../src/art/logomark';
import { wordmark } from './render-logo';
import { rng } from '../src/art/geom';

export const root = path.join(__dirname, '..');

let uid = 0;
const sv = (sc: ReturnType<typeof mascot>, key: string) => {
  const [x, y, w, h] = viewBoxOf(sc);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}">${sceneInner(sc, `${key}${uid++}-`)}</svg>`;
};
export const M = (mood: Mood, fries: number) => sv(mascot(mood, 7, fries), `m${mood}${fries}`);
export const I = (id: string) => sv(iconScene(id), `i${id}`);
export const LOGO = () => sv(logoMark(), 'logo');
export const WM = () => {
  const w = wordmark();
  return `<svg viewBox="0 0 ${w.w.toFixed(0)} ${w.h.toFixed(0)}" xmlns="http://www.w3.org/2000/svg">${w.svg}</svg>`;
};

export const INK = '#24120A';

/** A zombie subscription, big and cinematic: a card that has been dead a while and still charges you. */
export function zombie(label: string, price: string, o: { cry?: boolean; tone?: string } = {}): string {
  const k = uid++;
  const body = o.tone ?? '#9CC98A';
  const dark = '#5E8F57';
  const eyes = o.cry
    ? `<path d="M96 96 l26 12 M96 108 l26 -12" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M224 96 l-26 12 M224 108 l-26 -12" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M104 124 q-6 22 0 34 q8 -10 0 -34z M216 124 q6 22 0 34 q-8 -10 0 -34z" fill="#3FC1F0" stroke="${INK}" stroke-width="3"/>`
    : `<ellipse cx="106" cy="104" rx="30" ry="24" fill="#6B3F78" opacity=".55"/><path d="M92 88 l30 30 M122 88 l-30 30" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><ellipse cx="216" cy="104" rx="34" ry="30" fill="#6B3F78" opacity=".55"/><circle cx="216" cy="104" r="26" fill="#FFF6E6" stroke="${INK}" stroke-width="6"/><circle cx="224" cy="111" r="9" fill="${INK}"/><path d="M188 72 q26 -14 54 -2" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  return `<svg viewBox="-60 -10 440 290" xmlns="http://www.w3.org/2000/svg">
  <defs><clipPath id="zq${k}"><path d="M40 34 L246 34 L258 46 L246 56 L268 66 L280 60 L280 222 L40 222 Z"/></clipPath></defs>
  <g stroke="${INK}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M52 132 Q-4 118 -30 56" stroke-width="38" fill="none"/><path d="M52 132 Q-4 118 -30 56" stroke="${body}" stroke-width="24" fill="none"/>
    <path d="M268 132 Q324 118 350 56" stroke-width="38" fill="none"/><path d="M268 132 Q324 118 350 56" stroke="${body}" stroke-width="24" fill="none"/>
    <path d="M-42 34 l12 22 M-30 28 l4 28 M-18 36 l-6 20" stroke-width="10" fill="none"/>
    <path d="M362 34 l-12 22 M350 28 l-4 28 M338 36 l6 20" stroke-width="10" fill="none"/>
    <path d="M100 222 l-6 38 M220 222 l6 38" stroke-width="32" fill="none"/><path d="M100 222 l-6 38 M220 222 l6 38" stroke="${body}" stroke-width="18" fill="none"/>
    <path d="M40 34 L246 34 L258 46 L246 56 L268 66 L280 60 L280 222 L40 222 Z" fill="${body}" stroke-width="8"/>
  </g>
  <g clip-path="url(#zq${k})">
    <rect x="40" y="34" width="240" height="40" fill="${INK}"/>
    <text x="160" y="62" text-anchor="middle" font-family="Bricolage" font-weight="800" font-size="24" letter-spacing="1.5" fill="#FFF6E6">${label}</text>
    <path d="M205 34 L280 34 L280 222 L170 222 Q214 150 205 34Z" fill="#2F5A33" opacity=".28"/>
    <path d="M40 74 H70 Q64 130 74 222 H40Z" fill="#E4F7C8" opacity=".35"/>
    <ellipse cx="66" cy="196" rx="34" ry="20" fill="${INK}" opacity=".16"/>
    <path d="M60 80 q10 22 4 44 M250 120 q-8 14 -2 34 M150 78 q4 10 -2 20" stroke="${dark}" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${eyes}
    <path d="M104 160 q14 -10 28 0 t28 0 t28 0 t24 0" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M116 150 v20 M144 150 v20 M172 150 v20 M200 150 v20" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    <rect x="124" y="184" width="150" height="34" rx="17" fill="#FFF6E6" stroke="${INK}" stroke-width="5"/>
    <text x="199" y="209" text-anchor="middle" font-family="Bricolage" font-weight="800" font-size="25" fill="${INK}">${price}</text>
  </g></svg>`;
}

export function palm(extra = ''): string {
  return `<svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg" ${extra}><g stroke="${INK}" stroke-width="8" stroke-linejoin="round" stroke-linecap="round" fill="#9CC98A">
  <path d="M40 200 L48 110 Q48 92 66 92 L108 92 Q126 92 126 110 L118 200 Z"/>
  <path d="M50 100 L38 30 Q36 14 52 14 Q66 14 68 30 L76 94 Z"/><path d="M74 96 L76 10 Q78 -4 92 -2 Q106 0 104 16 L100 96 Z"/>
  <path d="M98 96 L114 22 Q118 8 132 14 Q144 20 140 34 L122 100 Z"/><path d="M44 118 L10 84 Q0 70 14 62 Q28 56 38 70 L64 108 Z"/></g></svg>`;
}

/** Bokeh city lights through a window, seeded. */
export function city(w: number, h: number, seed: number, warm = true): string {
  const r = rng(seed);
  let s = '';
  let x = 0;
  while (x < w) {
    const bw = 60 + r() * 110;
    const bh = 90 + r() * (h * 0.7);
    s += `<rect x="${x.toFixed(0)}" y="${(h - bh).toFixed(0)}" width="${bw.toFixed(0)}" height="${bh.toFixed(0)}" fill="#141935"/>`;
    for (let wy = h - bh + 14; wy < h - 16; wy += 22) for (let wx = x + 10; wx < x + bw - 14; wx += 20) if (r() < 0.34) s += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="9" height="12" fill="${r() < 0.8 ? (warm ? '#FFD27A' : '#BFE3F5') : '#FF8A5C'}" opacity="${(0.55 + r() * 0.45).toFixed(2)}"/>`;
    x += bw + 6;
  }
  return s;
}

