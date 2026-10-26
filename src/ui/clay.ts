import type { Palette } from '../theme';

/**
 * The material. Everything in the app is soft 3D clay, the same stuff the mascot is made of:
 * a darker lip under the face (the thickness), a bright inner edge on top, a soft shade at the bottom
 * and a diffuse shadow on the ground. No hard outlines.
 */

type RGBA = [number, number, number, number];

const cache = new Map<string, RGBA | null>();

export function parseColor(c: string): RGBA | null {
  if (cache.has(c)) return cache.get(c)!;
  let out: RGBA | null = null;
  const h = /^#([0-9a-f]{3,8})$/i.exec(c.trim());
  if (h) {
    let x = h[1];
    if (x.length === 3 || x.length === 4) x = x.split('').map((d) => d + d).join('');
    if (x.length === 6 || x.length === 8) {
      out = [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16), x.length === 8 ? parseInt(x.slice(6, 8), 16) / 255 : 1];
    }
  } else {
    const m = /^rgba?\(([^)]+)\)$/i.exec(c.trim());
    if (m) {
      const v = m[1].split(',').map((s) => parseFloat(s));
      if (v.length >= 3 && v.every((n) => !isNaN(n))) out = [v[0], v[1], v[2], v[3] ?? 1];
    }
  }
  cache.set(c, out);
  return out;
}

const hex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');

/** blend a toward b by t (0..1); returns a unchanged if either is not a colour we can read */
export function mix(a: string, b: string, t: number): string {
  const x = parseColor(a);
  const y = parseColor(b);
  if (!x || !y) return a;
  return `#${hex(x[0] + (y[0] - x[0]) * t)}${hex(x[1] + (y[1] - x[1]) * t)}${hex(x[2] + (y[2] - x[2]) * t)}`;
}

export function alpha(c: string, a: number): string {
  const x = parseColor(c);
  if (!x) return c;
  return `rgba(${Math.round(x[0])},${Math.round(x[1])},${Math.round(x[2])},${+(a * x[3]).toFixed(3)})`;
}

const luma = (c: RGBA) => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;

/** the underside of a lump of clay: the fill, darker and a little warmer */
export function lipOf(p: Pick<Palette, 'dark'>, fill: string): string {
  const c = parseColor(fill);
  if (!c || c[3] < 0.5) return 'transparent';
  if (p.dark) return mix(fill, '#000000', 0.5);
  const l = luma(c);
  return mix(mix(fill, '#8A4A12', l > 0.8 ? 0.2 : 0.14), '#000000', l > 0.8 ? 0.02 : 0.14);
}

export function groundShadow(p: Pick<Palette, 'dark'>, depth: number, strength = 1): string {
  const col = p.dark ? `rgba(0,0,0,${0.5 * strength})` : `rgba(110,55,0,${0.2 * strength})`;
  return `0 ${depth + 3}px ${depth * 2 + 6}px ${col}`;
}

/** the inner light on a clay face: bright edge on top, soft shade at the bottom */
export function sheen(p: Pick<Palette, 'dark'>, fill: string, depth: number): string {
  const hi = p.dark ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.8)';
  const lo = p.dark ? 'rgba(0,0,0,0.38)' : alpha(lipOf(p, fill), 0.38);
  return `inset 0 2px 0 ${hi}, inset 0 -${Math.max(3, depth + 1)}px ${depth * 2 + 2}px ${lo}`;
}

/**
 * One-view clay for small things (badges, icon tiles, pills): spread it into a style that already has the
 * backgroundColor. The lip and the ground shadow are outer shadows, the sheen is inset.
 */
export function puff(p: Pick<Palette, 'dark'>, fill: string, depth = 3): { boxShadow?: string } {
  const lip = lipOf(p, fill);
  if (lip === 'transparent') return {};
  return { boxShadow: `${sheen(p, fill, depth)}, 0 ${depth}px 0 ${lip}, ${groundShadow(p, depth, 0.8)}` };
}

/** a pressed-in surface: tracks, fields, the groove a toggle runs in */
export function dent(p: Pick<Palette, 'dark'>, strength = 1): { boxShadow: string } {
  const lo = p.dark ? `rgba(0,0,0,${0.55 * strength})` : `rgba(110,55,0,${0.2 * strength})`;
  const hi = p.dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.85)';
  return { boxShadow: `inset 0 3px 6px ${lo}, inset 0 -1px 0 ${hi}, 0 1.5px 0 ${hi}` };
}
