/**
 * Illustrated night scenes for the Brokey teaser mural (two panoramas, 3240x1440 each, cut into three 1080x1440 posts).
 * Same hand as the mascot: flat fills, dark ink outlines, then light (neon, window glow, wet street) painted on top.
 * All type lives inside the scene: neon tubes, the menu board, a tram shelter ad, a sticky note, a whiteboard.
 */
import { M, INK } from './story-art';

export const MW = 3240;
export const MH = 1440;
export const GY = 1110; // where the street meets the shopfront

let uid = 0;
const id = (p: string) => `${p}${uid++}`;

/* ---------- tiny drawing helpers ---------- */
export const R = (x: number, y: number, w: number, h: number, fill: string, rx = 0, sw = 7, stroke = INK) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
export const P = (d: string, fill: string, sw = 7, stroke = INK, extra = '') =>
  `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
export const L = (d: string, stroke: string, sw: number, op = 1, extra = '') =>
  `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}" ${extra}/>`;
type TOpt = { font?: string; size?: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; rot?: number; ls?: number; stroke?: string; sw?: number; weight?: number; op?: number };
export const T = (x: number, y: number, s: string, o: TOpt = {}) =>
  `<text x="${x}" y="${y}" font-family="${o.font ?? 'Anton'}" font-size="${o.size ?? 40}" font-weight="${o.weight ?? 400}" fill="${o.fill ?? '#FFF6E6'}" text-anchor="${o.anchor ?? 'start'}" letter-spacing="${o.ls ?? 0}" ${o.stroke ? `stroke="${o.stroke}" stroke-width="${o.sw ?? 3}" paint-order="stroke" stroke-linejoin="round"` : ''} ${o.rot ? `transform="rotate(${o.rot} ${x} ${y})"` : ''} opacity="${o.op ?? 1}">${s}</text>`;

/** Soft light pool. Painted with screen blending so it brightens what is under it. */
export function glow(cx: number, cy: number, rx: number, ry: number, color: string, op = 0.6, blend = 'screen') {
  const g = id('gl');
  return `<defs><radialGradient id="${g}"><stop offset="0" stop-color="${color}" stop-opacity="1"/><stop offset=".45" stop-color="${color}" stop-opacity=".38"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient></defs>
<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${g})" opacity="${op}" style="mix-blend-mode:${blend}"/>`;
}

/** A neon tube sign: soft halo, coloured tube, hot white core. Tilt Neon is drawn as a single tube, so the stroke trick reads as real glass. */
export function neon(x: number, y: number, s: string, size: number, color: string, anchor: 'start' | 'middle' | 'end' = 'middle', core = '#FFF9DE') {
  const f = 'font-family="Neon"';
  const a = `x="${x}" y="${y}" ${f} font-size="${size}" text-anchor="${anchor}" fill="none" stroke-linejoin="round" stroke-linecap="round" letter-spacing="${(size * 0.04).toFixed(1)}"`;
  return `<g filter="url(#nglow)"><text ${a} stroke="${color}" stroke-width="${(size * 0.05).toFixed(1)}">${s}</text></g>
<text ${a} stroke="${color}" stroke-width="${(size * 0.05).toFixed(1)}">${s}</text>
<text ${a} stroke="${core}" stroke-width="${Math.max(2, size * 0.016).toFixed(1)}" opacity=".95">${s}</text>`;
}

/** Brokey, placed by his top-left and width. */
export function mas(mood: any, fries: number, x: number, y: number, w: number) {
  const h = (w * 276) / 268;
  return M(mood, fries).replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h.toFixed(1)}" overflow="visible" `);
}

/** An object that stands on the pavement: drawn, then mirrored into the wet street underneath. */
export function standing(inner: string, baseY: number, op = 0.3, blur = 5) {
  const g = id('st');
  return `<g id="${g}">${inner}</g>
<use href="#${g}" transform="translate(0 ${2 * baseY}) scale(1 -1)" opacity="${op}" filter="url(#bl${blur})" clip-path="url(#street)"/>`;
}

export const stars = (n: number, seed: number, w: number, h: number, ox = 0, oy = 0) => {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: n }, () => `<circle cx="${(ox + rnd() * w).toFixed(0)}" cy="${(oy + rnd() * h).toFixed(0)}" r="${(1.2 + rnd() * 2.2).toFixed(1)}" fill="#FFF6E6" opacity="${(0.4 + rnd() * 0.6).toFixed(2)}"/>`).join('');
};

export function rain(n: number, seed: number, w = MW, h = MH) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = rnd() * (w + 200) - 100, y = rnd() * h, len = 26 + rnd() * 38;
    out += `M${x.toFixed(0)} ${y.toFixed(0)}l${(-len * 0.22).toFixed(0)} ${len.toFixed(0)}`;
  }
  return `<path d="${out}" stroke="#C9D8FF" stroke-width="2.2" stroke-linecap="round" opacity=".2" fill="none"/>`;
}

/** Shared <defs>: glow and blur filters, the street clip, brick and tile patterns. */
export const DEFS = `<defs>
<filter id="nglow" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="16" result="a"/><feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b"/><feMerge><feMergeNode in="a"/><feMergeNode in="a"/><feMergeNode in="b"/></feMerge></filter>
<filter id="bl3" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="3 9"/></filter>
<filter id="bl5" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="4 12"/></filter>
<filter id="bl8" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="8 18"/></filter>
<filter id="wob" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5"/></filter>
<clipPath id="street"><rect x="0" y="${GY}" width="${MW}" height="${MH - GY}"/></clipPath>
<pattern id="brick" width="96" height="44" patternUnits="userSpaceOnUse"><rect width="96" height="44" fill="#41254F"/><path d="M0 0H96M0 22H96M0 44H96M0 0V22M48 22V44" stroke="#2A1636" stroke-width="3" fill="none"/><rect x="4" y="4" width="40" height="14" fill="#4B2C5C" opacity=".6"/><rect x="52" y="26" width="38" height="14" fill="#38203F" opacity=".7"/></pattern>
<pattern id="paver" width="150" height="60" patternUnits="userSpaceOnUse"><rect width="150" height="60" fill="#272557"/><path d="M0 0H150M0 30H150M75 30V60M0 0V30" stroke="#17143A" stroke-width="3" fill="none"/><rect x="6" y="6" width="62" height="18" fill="#302E66" opacity=".7"/><rect x="82" y="36" width="60" height="18" fill="#232050" opacity=".8"/></pattern>
<pattern id="tile" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="#E9E2D0"/><path d="M0 0H60V60H0Z" stroke="#B7AE96" stroke-width="3" fill="none"/></pattern>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B0A2B"/><stop offset=".55" stop-color="#1F1A5E"/><stop offset=".86" stop-color="#5A2B86"/><stop offset="1" stop-color="#B2507E"/></linearGradient>
<linearGradient id="wetpave" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E5BD0" stop-opacity=".35"/><stop offset=".3" stop-color="#6E5BD0" stop-opacity=".08"/><stop offset="1" stop-color="#0B0A2B" stop-opacity=".55"/></linearGradient>
</defs>`;

/** Street + pavement: opaque base with bluestone pavers and a wet sheen. */
export function pavement(y0 = GY) {
  return `<rect x="0" y="${y0}" width="${MW}" height="${MH - y0}" fill="url(#paver)"/><rect x="0" y="${y0}" width="${MW}" height="${MH - y0}" fill="url(#wetpave)"/>
<path d="M0 ${y0}H${MW}" stroke="${INK}" stroke-width="10"/><rect x="0" y="${y0 + 5}" width="${MW}" height="16" fill="#44408F" opacity=".7"/>`;
}

/** Overhead tram wires, sagging between poles. */
export function wires(y = 130) {
  let d = '';
  for (let x = -40; x < MW; x += 540) d += `M${x} ${y}Q${x + 270} ${y + 34} ${x + 540} ${y}`;
  let d2 = '';
  for (let x = -40; x < MW; x += 540) d2 += `M${x} ${y + 46}Q${x + 270} ${y + 80} ${x + 540} ${y + 46}`;
  return L(d, '#0A0716', 5, 0.9) + L(d2, '#0A0716', 4, 0.8) + L(d, '#8F86D8', 1.5, 0.5, 'transform="translate(0 -3)"');
}

export const wrap = (body: string, bgExtra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${MW}" height="${MH}" viewBox="0 0 ${MW} ${MH}">${DEFS}${bgExtra}${body}</svg>`;
