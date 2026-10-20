import * as G from '../geom';
import { C, INK } from '../palette';
import { Scene, SceneBuilder } from '../scene';
import { shape } from '../draw';

export type Pt = G.Pt;

function hex(c: string): [number, number, number] {
  const h = c.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
export function mix(a: string, b: string, t: number): string {
  const x = hex(a);
  const y = hex(b);
  const m = (i: number) => Math.round(x[i] + (y[i] - x[i]) * t);
  return `#${[0, 1, 2].map((i) => m(i).toString(16).padStart(2, '0')).join('')}`;
}
export const shadeOf = (c: string) => mix(c, '#3A1A0A', 0.32);
export const lightOf = (c: string) => mix(c, '#FFFFFF', 0.5);

// More paint than the mascot palette, same warm family.
export const P = {
  ...C,
  green: '#7BC043',
  greenDeep: '#4E9A2E',
  orange: '#FF9F1C',
  pinkHot: '#FF6F91',
  purple: '#A98BFF',
  teal: '#3FC1C9',
  tomato: '#EE3B2B',
  sky: '#7CC8FF',
  navy: '#3B4F7A',
  steel: '#C9CFD8',
  steelDeep: '#8D96A6',
  wood: '#B97A3E',
  gold: '#FFC83D',
  glass: '#E9F6FF',
  paper: '#FFF3DC',
} as const;

export interface Opts {
  sw?: number;
  round?: number;
  amp?: number;
  rot?: number;
  hi?: boolean;
  /** skip the shade crescent */
  flat?: boolean;
}

/** Tiny drawing kit. Every icon is built from these so the whole set matches. */
export class Ico {
  sb = new SceneBuilder(100, 100, 'i');
  r: G.Rand;

  constructor(seed: number) {
    this.sb.vb = [-6, -6, 112, 112];
    this.r = G.rng(seed);
  }

  private fillShape(d: string, fill: string, o: Opts, hiAt?: Pt, hiSize: [number, number] = [6, 3]): void {
    const layers = [];
    if (!o.flat) layers.push({ d: G.translatePath(d, -2.4, -3.2), color: fill });
    if (o.hi !== false && hiAt) layers.push({ d: G.blob(hiAt[0], hiAt[1], hiSize[0], hiSize[1], this.r, { n: 8, amp: 0.05, rot: -25 }).d, color: lightOf(fill), op: 0.85 });
    shape(this.sb, d, { fill: o.flat ? fill : shadeOf(fill), layers, sw: o.sw ?? 4.4, sil: false, off: 1.4 });
  }

  blob(cx: number, cy: number, rx: number, ry: number, fill: string, o: Opts = {}): this {
    const b = G.blob(cx, cy, rx, ry, this.r, { n: 12, amp: o.amp ?? 0.03, rot: o.rot ?? 0 });
    this.fillShape(b.d, fill, o, [cx - rx * 0.42, cy - ry * 0.45], [Math.max(2, rx * 0.25), Math.max(1.5, ry * 0.14)]);
    return this;
  }

  poly(pts: Pt[], fill: string, o: Opts = {}): this {
    const p = G.wobblyPoly(pts, this.r, { round: o.round ?? 6, amp: o.amp ?? 0.5, step: 12 });
    const xs = pts.map((q) => q[0]);
    const ys = pts.map((q) => q[1]);
    const x0 = Math.min(...xs);
    const y0 = Math.min(...ys);
    const w = Math.max(...xs) - x0;
    this.fillShape(p.d, fill, o, [x0 + w * 0.26, y0 + 5], [Math.max(2, w * 0.1), 1.6]);
    return this;
  }

  rect(x: number, y: number, w: number, h: number, fill: string, o: Opts = {}): this {
    let pts: Pt[] = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    if (o.rot) pts = G.rotatePts(pts, x + w / 2, y + h / 2, o.rot);
    return this.poly(pts, fill, o);
  }

  /** A smooth closed shape through the given points (hearts, stars, drops). */
  path(pts: Pt[], fill: string, o: Opts = {}): this {
    const d = G.smoothClosed(pts, 1);
    const xs = pts.map((q) => q[0]);
    const ys = pts.map((q) => q[1]);
    const x0 = Math.min(...xs);
    const y0 = Math.min(...ys);
    const w = Math.max(...xs) - x0;
    this.fillShape(d, fill, o, [x0 + w * 0.28, y0 + (Math.max(...ys) - y0) * 0.2], [Math.max(2, w * 0.1), 1.8]);
    return this;
  }

  /** A hollow ring (an outline you can see through): rims, wheels, rings, handles. */
  ring(cx: number, cy: number, rx: number, ry: number, w: number, color: string): this {
    return this.tubeD(G.smoothClosed(G.ellipsePts(cx, cy, rx, ry, 12), 1), w, color);
  }

  /** Ink line with no fill. */
  line(pts: Pt[], w = 3.4, color: string = INK, amp = 0.3): this {
    this.sb.add({ d: G.wobblyLine(pts, this.r, amp), stroke: color, sw: w, cap: 'round', join: 'round' });
    return this;
  }

  /** A thick coloured line with an ink border: straws, handles, sauce, noodles. */
  tube(pts: Pt[], w: number, color: string, amp = 0.3): this {
    const d = G.wobblyLine(pts, this.r, amp);
    this.sb.add({ d, stroke: INK, sw: w + 5, cap: 'round', join: 'round' });
    this.sb.add({ d, stroke: color, sw: w, cap: 'round', join: 'round' });
    return this;
  }

  /** Same but for a ready-made path string. */
  tubeD(d: string, w: number, color: string): this {
    this.sb.add({ d, stroke: INK, sw: w + 5, cap: 'round', join: 'round' });
    this.sb.add({ d, stroke: color, sw: w, cap: 'round', join: 'round' });
    return this;
  }

  dot(x: number, y: number, rad: number, fill: string = INK, ring = false): this {
    const b = G.blob(x, y, rad, rad, this.r, { n: 8, amp: 0.04 });
    if (ring) shape(this.sb, b.d, { fill, sw: 2.4, sil: false, heavy: false });
    else this.sb.add({ d: b.d, fill });
    return this;
  }

  spark(x: number, y: number, s: number, fill: string = C.fry): this {
    shape(this.sb, G.sparkle(x, y, s), { fill, sw: 2.6, sil: false, heavy: false });
    return this;
  }

  /** A cute face: dot eyes, blush, little smile. kind picks the mood. */
  face(x: number, y: number, s = 1, kind: 'happy' | 'derp' | 'wink' | 'oh' | 'cool' = 'happy'): this {
    const e = (cx: number, cy: number) => {
      this.sb.add({ d: G.blob(cx, cy, 2.5 * s, 3 * s, this.r, { n: 8, amp: 0.02 }).d, fill: INK });
      this.sb.add({ d: G.blob(cx - 0.8 * s, cy - 1 * s, 0.9 * s, 0.9 * s, this.r, { n: 6, amp: 0.02 }).d, fill: '#FFFFFF' });
    };
    if (kind === 'wink') {
      e(x - 6 * s, y);
      this.line([[x + 3 * s, y + 0.5 * s], [x + 6 * s, y - 1.5 * s], [x + 9 * s, y + 0.5 * s]], 1.9 * s);
    } else if (kind === 'cool') {
      this.rect(x - 10 * s, y - 3 * s, 8 * s, 5.5 * s, INK, { flat: true, hi: false, sw: 1.6, round: 2 });
      this.rect(x + 2 * s, y - 3 * s, 8 * s, 5.5 * s, INK, { flat: true, hi: false, sw: 1.6, round: 2 });
      this.line([[x - 2 * s, y - 1.5 * s], [x + 2 * s, y - 1.5 * s]], 1.8 * s);
    } else {
      e(x - 6 * s, y);
      e(x + 6 * s, y);
    }
    this.sb.add({ d: G.blob(x - 11 * s, y + 4.2 * s, 3.4 * s, 2 * s, this.r).d, fill: P.pink, op: 0.85 });
    this.sb.add({ d: G.blob(x + 11 * s, y + 4.2 * s, 3.4 * s, 2 * s, this.r).d, fill: P.pink, op: 0.85 });
    if (kind === 'oh') {
      this.sb.add({ d: G.blob(x, y + 6 * s, 2 * s, 2.6 * s, this.r).d, fill: C.mouth, stroke: INK, sw: 1.6 * s });
    } else if (kind === 'derp') {
      this.line([[x - 3 * s, y + 5.5 * s], [x, y + 6.8 * s], [x + 3 * s, y + 5 * s]], 1.9 * s);
    } else {
      this.line([[x - 3.6 * s, y + 4.6 * s], [x, y + 7.4 * s], [x + 3.6 * s, y + 4.6 * s]], 2 * s);
    }
    return this;
  }

  build(): Scene {
    return this.sb.scene();
  }
}

export type IconDraw = (b: Ico) => void;

export interface IconDef {
  id: string;
  label: string;
  tags: string[];
  draw: IconDraw;
}

/** Points along a circular arc, degrees clockwise from 3 o'clock. */
export function arcPts(cx: number, cy: number, r: number, a0: number, a1: number, n = 8): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return out;
}

export function heartPts(cx: number, cy: number, s: number): Pt[] {
  const out: Pt[] = [];
  const n = 14;
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    out.push([cx + x * s, cy + y * s]);
  }
  return out;
}

export function starPts(cx: number, cy: number, ro: number, ri: number, n = 5, rot = -90): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? ro : ri;
    const a = ((rot + (i * 180) / n) * Math.PI) / 180;
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return out;
}

export const rotPts = G.rotatePts;
