// Tiny geometry toolkit for the hand-drawn cartoon look.
// Everything is pure and seeded so art is stable between renders and testable.

export type Pt = [number, number];
export type Rand = () => number;

export function rng(seed: number): Rand {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const n1 = (v: number) => Math.round(v * 10) / 10;
const P = (p: Pt) => `${n1(p[0])} ${n1(p[1])}`;

/** Closed Catmull-Rom spline through the points, as cubic Beziers. */
export function smoothClosed(pts: Pt[], k = 1): string {
  const n = pts.length;
  let d = `M${P(pts[0])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1: Pt = [p1[0] + ((p2[0] - p0[0]) / 6) * k, p1[1] + ((p2[1] - p0[1]) / 6) * k];
    const c2: Pt = [p2[0] - ((p3[0] - p1[0]) / 6) * k, p2[1] - ((p3[1] - p1[1]) / 6) * k];
    d += `C${P(c1)} ${P(c2)} ${P(p2)}`;
  }
  return d + 'Z';
}

/** Open Catmull-Rom spline. */
export function smoothOpen(pts: Pt[], k = 1): string {
  const n = pts.length;
  let d = `M${P(pts[0])}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, n - 1)];
    const c1: Pt = [p1[0] + ((p2[0] - p0[0]) / 6) * k, p1[1] + ((p2[1] - p0[1]) / 6) * k];
    const c2: Pt = [p2[0] - ((p3[0] - p1[0]) / 6) * k, p2[1] - ((p3[1] - p1[1]) / 6) * k];
    d += `C${P(c1)} ${P(c2)} ${P(p2)}`;
  }
  return d;
}

export function polyPath(pts: Pt[], close = true): string {
  return 'M' + pts.map(P).join('L') + (close ? 'Z' : '');
}

export function dist(a: Pt, b: Pt): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

/** Insert points along edges so jitter produces wobble instead of a few kinks. */
export function densify(pts: Pt[], closed: boolean, step: number): Pt[] {
  const out: Pt[] = [];
  const n = pts.length;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const count = Math.max(1, Math.round(dist(a, b) / step));
    for (let j = 0; j < count; j++) {
      const t = j / count;
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}

export function jitter(pts: Pt[], rand: Rand, amp: number): Pt[] {
  return pts.map((p) => [p[0] + (rand() - 0.5) * 2 * amp, p[1] + (rand() - 0.5) * 2 * amp] as Pt);
}

export function rotatePts(pts: Pt[], cx: number, cy: number, deg: number): Pt[] {
  const a = (deg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return pts.map((p) => {
    const dx = p[0] - cx;
    const dy = p[1] - cy;
    return [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos] as Pt;
  });
}

/** Sample a polygon with rounded corners (quadratic corner arcs). */
export function roundedPolyPts(corners: Pt[], radius: number, arcSteps = 5): Pt[] {
  const n = corners.length;
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const prev = corners[(i - 1 + n) % n];
    const v = corners[i];
    const next = corners[(i + 1) % n];
    const dp = dist(v, prev) || 1;
    const dn = dist(v, next) || 1;
    const rp = Math.min(radius, dp / 2.2);
    const rn = Math.min(radius, dn / 2.2);
    const a: Pt = [v[0] + ((prev[0] - v[0]) / dp) * rp, v[1] + ((prev[1] - v[1]) / dp) * rp];
    const b: Pt = [v[0] + ((next[0] - v[0]) / dn) * rn, v[1] + ((next[1] - v[1]) / dn) * rn];
    for (let s = 0; s <= arcSteps; s++) {
      const t = s / arcSteps;
      const mt = 1 - t;
      out.push([
        mt * mt * a[0] + 2 * mt * t * v[0] + t * t * b[0],
        mt * mt * a[1] + 2 * mt * t * v[1] + t * t * b[1],
      ]);
    }
  }
  return out;
}

export interface WobbleOpts {
  round?: number;
  amp?: number;
  step?: number;
  k?: number;
}

/** A hand-cut looking polygon: rounded corners, densified, jittered, smoothed. */
export function wobblyPoly(corners: Pt[], rand: Rand, o: WobbleOpts = {}): { d: string; pts: Pt[] } {
  const { round = 8, amp = 1.1, step = 14, k = 1 } = o;
  const rounded = roundedPolyPts(corners, round, 4);
  const dense = densify(rounded, true, step);
  const pts = jitter(dense, rand, amp);
  return { d: smoothClosed(pts, k), pts };
}

export function ellipsePts(cx: number, cy: number, rx: number, ry: number, n: number, rot = 0): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return rot ? rotatePts(pts, cx, cy, rot) : pts;
}

/** A wobbly blob: ellipse with radial noise. */
export function blob(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rand: Rand,
  o: { n?: number; amp?: number; rot?: number } = {},
): { d: string; pts: Pt[] } {
  const { n = 12, amp = 0.05, rot = 0 } = o;
  const base = ellipsePts(cx, cy, rx, ry, n, rot);
  const pts = base.map((p) => {
    const k = 1 + (rand() - 0.5) * 2 * amp;
    return [cx + (p[0] - cx) * k, cy + (p[1] - cy) * k] as Pt;
  });
  return { d: smoothClosed(pts), pts };
}

/** Wobbly open stroke through points (mouths, brows, arms, sauce drizzles). */
export function wobblyLine(pts: Pt[], rand: Rand, amp = 0.6, step = 12): string {
  const dense = densify(pts, false, step);
  return smoothOpen(jitter(dense, rand, amp));
}

/** Halftone dots filling a rectangle, as one path. */
export function dotsPath(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  spacing: number,
  r: number,
  rand: Rand,
  jit = 0.5,
): string {
  let d = '';
  let row = 0;
  for (let y = y0; y <= y1; y += spacing * 0.866) {
    const off = row % 2 ? spacing / 2 : 0;
    for (let x = x0 + off; x <= x1; x += spacing) {
      const cx = x + (rand() - 0.5) * jit;
      const cy = y + (rand() - 0.5) * jit;
      d += `M${n1(cx - r)} ${n1(cy)}a${r} ${r} 0 1 0 ${n1(2 * r)} 0a${r} ${r} 0 1 0 ${n1(-2 * r)} 0Z`;
    }
    row++;
  }
  return d;
}

/** 4-point sparkle star centered at x,y. */
export function sparkle(x: number, y: number, size: number): string {
  const s = size;
  const t = size * 0.28;
  return (
    `M${n1(x)} ${n1(y - s)}` +
    `Q${n1(x + t)} ${n1(y - t)} ${n1(x + s)} ${n1(y)}` +
    `Q${n1(x + t)} ${n1(y + t)} ${n1(x)} ${n1(y + s)}` +
    `Q${n1(x - t)} ${n1(y + t)} ${n1(x - s)} ${n1(y)}` +
    `Q${n1(x - t)} ${n1(y - t)} ${n1(x)} ${n1(y - s)}Z`
  );
}


/** Translate an absolute-coordinate path (M L C Q Z; lowercase commands are left alone). */
export function translatePath(d: string, dx: number, dy: number): string {
  return d.replace(/([MLCQ])([^MLCQZmlcqza]*)/g, (_m, cmd: string, rest: string) => {
    const nums = rest.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    const out: number[] = [];
    for (let i = 0; i < nums.length; i += 2) {
      out.push(Math.round((nums[i] + dx) * 10) / 10, Math.round((nums[i + 1] + dy) * 10) / 10);
    }
    return cmd + out.join(' ');
  });
}

/** Diagonal hatch lines filling a rectangle, as stroke path data. */
export function hatchPath(x0: number, y0: number, x1: number, y1: number, spacing: number, rand: Rand, slant = 0.6): string {
  let d = '';
  for (let x = x0 - (y1 - y0) * slant; x <= x1; x += spacing) {
    const j = (rand() - 0.5) * 1.2;
    d += `M${n1(x + j)} ${n1(y1)}L${n1(x + (y1 - y0) * slant + j)} ${n1(y0)}`;
  }
  return d;
}
