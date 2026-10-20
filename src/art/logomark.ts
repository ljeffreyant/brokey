import * as G from './geom';
import { C, INK } from './palette';
import { Scene, SceneBuilder } from './scene';
import { shape } from './draw';
import { dollarPaths } from './dollar';

type Pt = G.Pt;

function rectPts(cx: number, cy: number, len: number, w: number, ang: number, grow = 0, yFrom = -1, yTo = 1): Pt[] {
  const hl = len / 2 + grow;
  const hw = w / 2;
  return G.rotatePts(
    [
      [cx - hl, cy + hw * yFrom],
      [cx + hl, cy + hw * yFrom],
      [cx + hl, cy + hw * yTo],
      [cx - hl, cy + hw * yTo],
    ],
    cx,
    cy,
    ang,
  );
}

/**
 * The Brokey mark: an HSP seen from above, with the garlic sauce squeezed into a $.
 * No character. Canvas is 1024 so it drops straight into an icon.
 */
export function logoMark(seed = 21): Scene {
  const sb = new SceneBuilder(1024, 1024, 'l');
  sb.vb = [0, 0, 1024, 1024];
  const r = G.rng(seed);
  const SW = 15;

  // ---- tray ----
  const trayCorners: Pt[] = [[132, 292], [884, 262], [906, 782], [118, 806]];
  const tray = G.wobblyPoly(trayCorners, r, { round: 92, amp: 3, step: 26 });
  // hard offset shadow, one flat colour (poster style)
  sb.add({ d: G.translatePath(tray.d, 26, 30), fill: INK });
  shape(sb, tray.d, {
    fill: C.cream,
    sw: SW,
    off: 3.2,
    sil: false,
    layers: [
      { d: G.polyPath([[640, 240], [940, 240], [940, 830], [760, 830]]), color: C.creamShade },
      { d: G.dotsPath(700, 250, 920, 810, 30, 5, r, 3), color: C.creamDeep, op: 0.6 },
      { d: G.polyPath([[150, 330], [186, 330], [178, 760], [142, 760]]), color: C.creamHi },
    ],
  });
  // tray floor
  const floor = G.wobblyPoly([[196, 356], [826, 330], [846, 724], [188, 746]], r, { round: 64, amp: 2.4, step: 24 });
  shape(sb, floor.d, {
    fill: C.creamShade,
    sw: 9,
    off: 2,
    sil: false,
    heavy: false,
    layers: [{ d: G.polyPath([[180, 300], [880, 300], [880, 420], [180, 450]]), color: C.creamDeep, op: 0.7 }],
  });

  // ---- chips: a messy bed, a few hanging over the rim ----
  type Fry = { cx: number; cy: number; len: number; w: number; ang: number };
  const fries: Fry[] = [];
  const put = (cx: number, cy: number, ang: number, len = 210, w = 50) => fries.push({ cx, cy, len: len + (r() - 0.5) * 50, w: w + (r() - 0.5) * 6, ang });
  // bed: jittered grid so the tray reads as properly loaded
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 6; col++) {
      const x = 236 + col * 114 + (row % 2 ? 50 : 0) + (r() - 0.5) * 34;
      const y = 380 + row * 54 + (r() - 0.5) * 22;
      const base = row % 3 === 0 ? -12 : row % 3 === 1 ? 14 : -4;
      const a = r() < 0.28 ? 55 + (r() - 0.5) * 60 : base + (r() - 0.5) * 34;
      put(x, y, a, 200, 48);
    }
  }
  // spilling over the lip
  put(112, 462, -64, 170, 46);
  put(892, 372, 28, 160, 46);
  put(196, 776, 10, 170, 46);
  fries.sort((a, b) => a.cy - b.cy);
  for (const f of fries) {
    const body = G.wobblyPoly(rectPts(f.cx, f.cy, f.len, f.w, f.ang), r, { round: 9, amp: 1.2, step: 30 });
    shape(sb, body.d, {
      fill: C.fry,
      sw: 11,
      off: 2.6,
      sil: false,
      layers: [
        { d: G.polyPath(rectPts(f.cx, f.cy, f.len, f.w, f.ang, 6, 0.15, 1.3)), color: C.fryShade },
        { d: G.polyPath(rectPts(f.cx, f.cy - f.w * 0.04, f.len * 0.8, f.w, f.ang, 0, -0.78, -0.4)), color: C.fryHi, op: 0.9 },
      ],
    });
  }

  // ---- doner meat: lumps with char, piled left and right so the $ has room ----
  const lumps = [
    { cx: 262, cy: 628, rx: 100, ry: 64, rot: -12 },
    { cx: 396, cy: 706, rx: 88, ry: 52, rot: 6 },
    { cx: 240, cy: 468, rx: 78, ry: 52, rot: 10 },
    { cx: 712, cy: 620, rx: 94, ry: 62, rot: 14 },
    { cx: 770, cy: 480, rx: 70, ry: 48, rot: -8 },
    { cx: 626, cy: 718, rx: 80, ry: 46, rot: -4 },
    { cx: 690, cy: 374, rx: 74, ry: 46, rot: 6 },
  ];
  for (const l of lumps) {
    const b = G.blob(l.cx, l.cy, l.rx, l.ry, r, { n: 11, amp: 0.17, rot: l.rot });
    const marks = [0, 1, 2, 3]
      .map(() => G.blob(l.cx + (r() - 0.5) * l.rx * 1.2, l.cy + (r() - 0.25) * l.ry * 0.8, 15, 7, r, { n: 6, amp: 0.1 }).d)
      .join('');
    shape(sb, b.d, {
      fill: C.meat,
      sw: 12,
      off: 3,
      sil: false,
      layers: [
        { d: G.blob(l.cx + 8, l.cy + l.ry * 0.62, l.rx * 1.05, l.ry * 0.7, r).d, color: C.meatShade, op: 0.9 },
        { d: G.hatchPath(l.cx - l.rx, l.cy - l.ry * 0.2, l.cx + l.rx, l.cy + l.ry, 15, r), color: INK, op: 0.3, line: 3.4 },
        { d: G.blob(l.cx - l.rx * 0.24, l.cy - l.ry * 0.46, l.rx * 0.55, l.ry * 0.32, r).d, color: C.meatHi, op: 0.95 },
        { d: marks, color: C.meatChar, op: 0.55 },
      ],
    });
  }

  // ---- the $ ----
  const dp = dollarPaths(510, 524, 116, 212, r, 1.3);
  const W = 66;
  const drizzle = (d: string, w: number) => {
    sb.add({ d, stroke: INK, sw: w + 30, cap: 'round', join: 'round' });
  };
  // ink first for every part, so the tick/S overlap has no seam
  drizzle(dp.s, W);
  drizzle(dp.tickTop, W - 6);
  drizzle(dp.tickBottom, W - 6);
  const fillPart = (d: string, w: number) => {
    sb.add({ d, stroke: C.garlic, sw: w, cap: 'round', join: 'round' });
    sb.add({ d: G.translatePath(d, 9, 11), stroke: C.garlicShade, sw: w * 0.3, cap: 'round', join: 'round', op: 0.95 });
    sb.add({ d: G.translatePath(d, -8, -9), stroke: '#FFFFFF', sw: w * 0.2, cap: 'round', join: 'round' });
  };
  fillPart(dp.s, W);
  fillPart(dp.tickTop, W - 6);
  fillPart(dp.tickBottom, W - 6);
  // ---- shine ----
  const star = (x: number, y: number, s: number, fill: string) => shape(sb, G.sparkle(x, y, s), { fill, sw: 9, sil: false, heavy: false });
  star(124, 196, 56, C.fry);
  star(912, 150, 38, C.fry);
  star(944, 900, 44, C.cream);

  return sb.scene(undefined, 'rotate(-4 512 540)');
}
