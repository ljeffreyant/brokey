import * as G from './geom';
import { C, INK } from './palette';
import { SceneBuilder, Scene } from './scene';
import { shape, limb, inkLine } from './draw';
import { dollarPaths } from './dollar';

export type Mood = 'happy' | 'ok' | 'sideeye' | 'sad' | 'broke' | 'shock' | 'proud' | 'tempted';
export const MOODS: Mood[] = ['happy', 'ok', 'sideeye', 'sad', 'broke', 'shock', 'proud', 'tempted'];

type Pt = G.Pt;

// A slight lean per mood so he reads as posed, not stamped.
const TILT: Record<Mood, number> = { happy: -4, ok: 2, sideeye: 4, sad: 5, broke: 5, shock: -2, proud: -5, tempted: -3 };

/** A bendy fry: centre line is an S-curve, outline is offset along the normal so it keeps its thickness. */
function fryPts(
  bx: number,
  by: number,
  ang: number,
  len: number,
  w: number,
  bend: number,
  wave: number,
  side: [number, number] = [-1, 1],
  lenScale = 1,
): Pt[] {
  const n = 6;
  const cl: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    cl.push([bend * Math.sin(Math.PI * t) + wave * Math.sin(2 * Math.PI * t), -len * t * lenScale]);
  }
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = cl[Math.max(i - 1, 0)];
    const b = cl[Math.min(i + 1, n)];
    const tx = b[0] - a[0];
    const ty = b[1] - a[1];
    const l = Math.hypot(tx, ty) || 1;
    const nx = -ty / l;
    const ny = tx / l;
    const hw = (w / 2) * (1 - 0.08 * (i / n));
    left.push([cl[i][0] + nx * hw * side[0], cl[i][1] + ny * hw * side[0]]);
    right.push([cl[i][0] + nx * hw * side[1], cl[i][1] + ny * hw * side[1]]);
  }
  const poly = [...left, ...right.reverse()].map((p) => [p[0] + bx, p[1] + by] as Pt);
  return G.rotatePts(poly, bx, by, ang);
}

export const FRY_COUNT = 9;
export const MASCOT_TILT = TILT;
export const FRY_BASE_Y = 122;

const FRIES = [
  { x: 64, ang: -52, len: 54, w: 19, bend: -7, wave: 3 },
  { x: 78, ang: -39, len: 74, w: 19, bend: 10, wave: -4 },
  { x: 92, ang: -26, len: 90, w: 20, bend: -9, wave: 5 },
  { x: 107, ang: -12, len: 106, w: 20, bend: 11, wave: -6 },
  { x: 124, ang: 3, len: 116, w: 21, bend: -10, wave: 6 },
  { x: 141, ang: 15, len: 102, w: 20, bend: 11, wave: -5 },
  { x: 156, ang: 28, len: 90, w: 20, bend: -9, wave: 4 },
  { x: 171, ang: 41, len: 70, w: 19, bend: 8, wave: -3 },
  { x: 184, ang: 55, len: 48, w: 19, bend: 6, wave: 2 },
];

/** Which fry goes first when you spend. The tall middle one is the last to survive. */
export const FRY_BITE_ORDER = [1, 7, 3, 5, 0, 8, 2, 6, 4];

export function fryBase(index: number): [number, number] {
  return [FRIES[index].x, FRY_BASE_Y];
}

export function fryPresent(index: number, friesLeft: number): boolean {
  const removed = FRY_COUNT - Math.max(0, Math.min(FRY_COUNT, friesLeft));
  return FRY_BITE_ORDER.indexOf(index) >= removed;
}

/** Brokey: a cute HSP blob. Takeaway box, doner pile with a sauce $, bendy fries. Simple on purpose. */
export function mascot(mood: Mood, seed = 7, friesLeft = FRY_COUNT): Scene {
  const sb = new SceneBuilder(240, 256, 'm');
  sb.vb = [-14, -8, 268, 276];
  const r = G.rng(seed);

  sb.group('shadow');
  sb.add({ d: G.blob(124, 247, 74, 7, r, { n: 10, amp: 0.08 }).d, fill: INK, op: 0.28 });

  // feet
  sb.group('feet');
  const foot = (fx: number, fy: number, rx: number, ry: number, rot: number) => {
    const f = G.blob(fx, fy, rx, ry, r, { n: 10, amp: 0.05, rot });
    shape(sb, f.d, {
      fill: C.red,
      layers: [
        { d: G.blob(fx + 3, fy + 7, rx, ry * 0.6, r).d, color: C.chilliShade, op: 0.75 },
        { d: G.blob(fx - 6, fy - 4, 7, 2.6, r).d, color: C.chilliHi, op: 0.9 },
      ],
    });
  };
  foot(88, 232, 21, 11, -6);
  if (mood === 'sideeye') foot(160, 224, 17, 10, 24);
  else foot(156, 231, 17, 10, 8);

  // fries: curvy, uneven heights
  FRIES.forEach((f, i) => {
    if (!fryPresent(i, friesLeft)) return;
    // each fry has its own random stream, so the rest of the drawing never shifts when one is eaten
    const fr = G.rng(seed * 131 + i * 17 + 5);
    sb.group(`fry${i}`);
    const by = 122;
    const { d } = G.wobblyPoly(fryPts(f.x, by, f.ang, f.len, f.w, f.bend, f.wave), fr, { round: 5, amp: 0.6, step: 16 });
    shape(sb, d, {
      fill: C.fry,
      layers: [
        { d: G.polyPath(fryPts(f.x, by, f.ang, f.len, f.w, f.bend, f.wave, [0.2, 1.5], 1.02)), color: C.fryShade },
        { d: G.polyPath(fryPts(f.x, by - f.len * 0.06, f.ang, f.len, f.w, f.bend, f.wave, [-0.78, -0.42], 0.8)), color: C.fryHi, op: 0.9 },
      ],
    });
  });

  // doner mound
  sb.group('meat');
  const mound = G.wobblyPoly(
    [[36, 130], [38, 104], [52, 88], [72, 86], [84, 70], [110, 66], [126, 74], [146, 66], [166, 76], [184, 86], [200, 104], [204, 130]],
    r,
    { round: 12, amp: 1.2, step: 12 },
  );
  const marks = [
    [58, 102, 5, 2.4], [96, 80, 4.5, 2.2], [150, 82, 5, 2.4], [188, 104, 4.5, 2.2], [74, 118, 5, 2.4], [168, 116, 5, 2.4],
  ]
    .map(([mx, my, rx, ry]) => G.blob(mx, my, rx, ry, r, { n: 6, amp: 0.1 }).d)
    .join('');
  shape(sb, mound.d, {
    fill: C.meat,
    layers: [
      { d: G.polyPath([[30, 110], [214, 110], [214, 140], [30, 140]]), color: C.meatShade, op: 0.9 },
      { d: G.blob(84, 98, 18, 7, r).d, color: C.meatHi, op: 0.95 },
      { d: G.blob(130, 82, 18, 6.5, r).d, color: C.meatHi, op: 0.95 },
      { d: G.blob(176, 96, 11, 5, r).d, color: C.meatHi, op: 0.9 },
      { d: marks, color: C.meatChar, op: 0.55 },
    ],
  });

  // the sauce $ (money sauce)
  const dp = dollarPaths(124, 92, 17, 22, r, 0.4);
  for (const part of [dp.s, dp.tickTop, dp.tickBottom]) sb.add({ d: part, stroke: INK, sw: 14, cap: 'round', join: 'round' });
  for (const part of [dp.s, dp.tickTop, dp.tickBottom]) sb.add({ d: part, stroke: C.garlic, sw: 7.5, cap: 'round', join: 'round' });
  sb.add({ d: G.translatePath(dp.s, -1.6, -1.8), stroke: '#FFFFFF', sw: 2.2, cap: 'round', join: 'round' });
  // a little chilli on the left
  limb(sb, G.wobblyLine([[50, 112], [60, 105], [71, 111], [80, 106]], r, 0.4), 4.5, C.chilli, false);

  // box
  sb.group('box');
  const box = G.wobblyPoly([[46, 122], [198, 118], [184, 226], [60, 228]], r, { round: 16, amp: 1.2, step: 12 });
  shape(sb, box.d, {
    fill: C.cream,
    layers: [
      { d: G.polyPath([[150, 112], [206, 112], [194, 236], [160, 236]]), color: C.creamShade },
      { d: G.polyPath([[58, 150], [65, 150], [70, 206], [63, 206]]), color: C.creamHi, op: 0.95 },
      { d: G.blob(122, 232, 70, 10, r).d, color: C.creamShade, op: 0.85 },
    ],
  });
  const lip = G.wobblyPoly([[40, 116], [204, 112], [200, 134], [44, 138]], r, { round: 8, amp: 0.7, step: 13 });
  shape(sb, lip.d, {
    fill: C.creamHi,
    layers: [{ d: G.polyPath([[36, 130], [208, 126], [208, 146], [36, 148]]), color: C.creamShade, op: 0.9 }],
  });
  const dripG = G.wobblyPoly(
    [[60, 134], [75, 134], [73, 146], [71, 153], [76, 159], [75, 167], [68, 172], [61, 167], [60, 159], [65, 153], [63, 146]],
    r,
    { round: 3, amp: 0.5, step: 9 },
  );
  shape(sb, dripG.d, {
    fill: C.garlic,
    sw: 3.4,
    sil: false,
    layers: [{ d: G.polyPath([[69, 134], [80, 134], [80, 174], [69, 174]]), color: C.garlicShade, op: 0.8 }],
  });
  const dripR = G.wobblyPoly(
    [[168, 130], [180, 129], [179, 138], [178, 144], [181, 150], [176, 155], [171, 151], [172, 144], [170, 138]],
    r,
    { round: 3, amp: 0.4, step: 8 },
  );
  shape(sb, dripR.d, {
    fill: C.chilli,
    sw: 3,
    sil: false,
    layers: [{ d: G.polyPath([[176, 129], [184, 129], [184, 156], [176, 156]]), color: C.chilliShade, op: 0.8 }],
  });

  // ---------------- face: dot eyes, little smile, blush ----------------
  sb.group('face');
  const Lx = 92;
  const Ly = 168;
  const Rx = 150;
  const Ry = 166;

  const blush = (o: number) => {
    sb.add({ d: G.blob(71, 189, 12, 7, r).d, fill: C.pink, op: o });
    sb.add({ d: G.blob(172, 187, 11, 6.6, r).d, fill: C.pink, op: o * 0.92 });
  };
  const dotEye = (cx: number, cy: number, rx: number, ry: number, hiScale = 1) => {
    sb.group('eyes');
    sb.add({ d: G.blob(cx, cy, rx, ry, r, { n: 10, amp: 0.025 }).d, fill: INK });
    sb.add({ d: G.blob(cx - rx * 0.32, cy - ry * 0.34, 3.1 * hiScale, 3.1 * hiScale, r, { n: 8, amp: 0.03 }).d, fill: '#FFFFFF' });
    sb.add({ d: G.blob(cx + rx * 0.34, cy + ry * 0.36, 1.5 * hiScale, 1.5 * hiScale, r, { n: 6, amp: 0.03 }).d, fill: '#FFFFFF', op: 0.9 });
    sb.group('face');
  };
  const bigEye = (cx: number, cy: number, rx: number, ry: number, pr: number, px = 0, py = 0, lid = 0) => {
    sb.group('eyes');
    const e = G.blob(cx, cy, rx, ry, r, { n: 10, amp: 0.03 });
    const id = sb.def(e.d);
    sb.add({ d: e.d, fill: '#FFFFFF' });
    sb.add({ d: G.blob(cx + px, cy + py, pr, pr * 1.05, r, { n: 8, amp: 0.03 }).d, fill: INK, clip: id });
    sb.add({ d: G.blob(cx + px - pr * 0.35, cy + py - pr * 0.4, pr * 0.34, pr * 0.34, r, { n: 6, amp: 0.03 }).d, fill: '#FFFFFF', clip: id });
    if (lid > 0) {
      const ly = cy - ry + 2 * ry * lid;
      sb.add({ d: G.polyPath([[cx - rx - 4, cy - ry - 4], [cx + rx + 4, cy - ry - 4], [cx + rx + 4, ly], [cx - rx - 4, ly]]), fill: C.cream, clip: id });
      sb.add({ d: G.wobblyLine([[cx - rx - 3, ly], [cx + rx + 3, ly + 0.6]], r, 0.3), stroke: INK, sw: 4, cap: 'round', clip: id });
    }
    sb.add({ d: e.d, stroke: INK, sw: 4, join: 'round' });
    sb.group('face');
  };
  const arcEye = (cx: number, cy: number) => {
    sb.group('eyes');
    inkLine(sb, G.wobblyLine([[cx - 11, cy + 5], [cx - 5, cy - 4], [cx, cy - 8], [cx + 5, cy - 4], [cx + 11, cy + 5]], r, 0.3), 5);
    sb.group('face');
  };
  const brow = (pts: Pt[]) => inkLine(sb, G.wobblyLine(pts, r, 0.4), 5);
  const mouth = (pts: Pt[], w = 4.6, amp = 0.3) => inkLine(sb, G.wobblyLine(pts, r, amp), w);
  const coinEye = (cx: number, cy: number, rad: number) => {
    sb.group('eyes');
    shape(sb, G.blob(cx, cy, rad, rad, r, { n: 12, amp: 0.02 }).d, {
      fill: C.fry,
      sw: 3.6,
      sil: false,
      heavy: false,
      layers: [{ d: G.blob(cx + rad * 0.3, cy + rad * 0.4, rad * 0.9, rad * 0.7, r).d, color: C.fryShade, op: 0.9 }],
    });
    const d$ = dollarPaths(cx, cy, rad * 0.34, rad * 0.46, r, 0.1);
    inkLine(sb, d$.s, 3);
    inkLine(sb, d$.tickTop, 2.6);
    inkLine(sb, d$.tickBottom, 2.6);
    sb.group('face');
  };
  const drop = (x: number, y: number, s: number) =>
    shape(sb, `M${x} ${y}Q${x - s} ${y + s * 1.6} ${x} ${y + s * 2.1}Q${x + s} ${y + s * 1.6} ${x} ${y}Z`, {
      fill: C.blue,
      sw: 2.6,
      sil: false,
      heavy: false,
    });

  switch (mood) {
    case 'happy':
      blush(0.85);
      dotEye(Lx, Ly, 8.4, 10.2);
      dotEye(Rx, Ry, 8.2, 10);
      mouth([[107, 184], [114, 193], [122, 196], [130, 192], [137, 182]]);
      break;
    case 'proud':
      blush(0.9);
      arcEye(Lx, Ly + 1);
      arcEye(Rx, Ry + 1);
      mouth([[103, 183], [111, 195], [122, 199], [133, 194], [141, 181]], 5);
      break;
    case 'ok':
      blush(0.55);
      dotEye(Lx, Ly, 8, 9.6);
      dotEye(Rx, Ry, 7.8, 9.4);
      mouth([[110, 192], [117, 194], [125, 193], [133, 190]]);
      break;
    case 'sideeye':
      blush(0.3);
      bigEye(Lx, Ly, 13, 13, 6.5, 6.5, 1.5, 0.45);
      bigEye(Rx, Ry, 12, 12, 6, 6, 1.5, 0.5);
      brow([[79, 148], [93, 142], [108, 148]]);
      brow([[137, 152], [151, 153], [164, 157]]);
      mouth([[108, 192], [118, 193], [128, 191], [138, 186]]);
      break;
    case 'sad':
      blush(0.45);
      dotEye(Lx, Ly + 1, 9, 11.4, 1.15);
      dotEye(Rx, Ry + 1, 8.8, 11, 1.15);
      brow([[80, 153], [93, 148], [107, 139]]);
      brow([[137, 140], [150, 148], [162, 153]]);
      mouth([[106, 199], [114, 192], [123, 190], [132, 193], [139, 200]], 4.6, 0.5);
      drop(72, 201, 4.4);
      break;
    case 'broke': {
      dotEye(Lx, Ly + 1, 9, 11.4, 1.15);
      dotEye(Rx, Ry + 1, 8.8, 11, 1.15);
      brow([[80, 154], [93, 149], [107, 139]]);
      brow([[137, 140], [150, 148], [162, 154]]);
      mouth([[104, 200], [111, 192], [117, 198], [123, 191], [129, 198], [136, 192]], 4.6, 0.4);
      for (const [x0, x1] of [[88, 84], [153, 157]] as const) {
        const tear = G.wobblyLine([[x0, 180], [x0 - 1, 190], [x1, 202]], r, 0.3);
        inkLine(sb, tear, 9.5);
        inkLine(sb, tear, 5, C.blue);
      }
      break;
    }
    case 'shock':
      bigEye(Lx, Ly, 13, 15, 4, 0, 0);
      bigEye(Rx, Ry, 12, 14, 3.6, 0, 0);
      brow([[79, 143], [93, 134], [108, 140]]);
      brow([[137, 141], [151, 134], [164, 143]]);
      {
        const m = G.blob(121, 198, 8.5, 12, r, { n: 10, amp: 0.04 });
        shape(sb, m.d, { fill: C.mouth, sw: 4, sil: false, heavy: false, layers: [{ d: G.blob(121, 206, 6.4, 4.6, r).d, color: C.tongue }] });
      }
      break;
    case 'tempted':
      blush(0.9);
      coinEye(Lx, Ly, 13);
      coinEye(Rx, Ry - 1, 12.4);
      mouth([[106, 185], [114, 194], [124, 195], [134, 190], [141, 180]], 4.8);
      break;
  }
  if (mood === 'sad' || mood === 'shock') drop(186, 150, 4.4);

  // ---------------- arms + props ----------------
  sb.group('limbs');
  const arm = (pts: Pt[], hand: Pt) => {
    limb(sb, G.wobblyLine(pts, r, 0.4), 12, C.cream);
    const h = G.blob(hand[0], hand[1], 10, 10, r, { n: 9, amp: 0.05 });
    shape(sb, h.d, { fill: C.cream, layers: [{ d: G.blob(hand[0] + 3, hand[1] + 4, 9, 6, r).d, color: C.creamShade }], sw: 3.8 });
  };
  sb.group('props');
  const coin = (cx: number, cy: number, rad: number) => {
    shape(sb, G.blob(cx, cy, rad, rad, r, { n: 10, amp: 0.03 }).d, {
      fill: C.fry,
      sw: 3.4,
      layers: [
        { d: G.blob(cx + rad * 0.35, cy + rad * 0.4, rad * 0.9, rad * 0.7, r).d, color: C.fryShade },
        { d: G.blob(cx - rad * 0.4, cy - rad * 0.4, rad * 0.3, rad * 0.2, r).d, color: C.fryHi },
      ],
    });
    const d$ = dollarPaths(cx, cy, rad * 0.3, rad * 0.42, r, 0.1);
    inkLine(sb, d$.s, 2.2);
    inkLine(sb, d$.tickTop, 2);
    inkLine(sb, d$.tickBottom, 2);
  };
  const wallet = (cx: number, cy: number, tilt: number) => {
    const body = G.wobblyPoly(G.rotatePts([[cx - 18, cy - 12], [cx + 18, cy - 12], [cx + 18, cy + 12], [cx - 18, cy + 12]], cx, cy, tilt), r, { round: 5, amp: 0.5, step: 12 });
    shape(sb, G.blob(cx + 4, cy + 14, 11, 6, r, { n: 8, amp: 0.05, rot: tilt }).d, { fill: '#E9DCC0', sw: 2.8, sil: false, heavy: false });
    shape(sb, body.d, {
      fill: '#8A4B24',
      sw: 3.6,
      layers: [
        { d: G.blob(cx, cy + 10, 20, 7, r).d, color: C.meatShade, op: 0.8 },
        { d: G.polyPath(G.rotatePts([[cx - 18, cy - 12], [cx + 18, cy - 12], [cx + 12, cy - 3], [cx - 12, cy - 3]], cx, cy, tilt)), color: C.meatHi, op: 0.9 },
      ],
    });
  };
  const star = (x: number, y: number, s: number) => shape(sb, G.sparkle(x, y, s), { fill: C.fry, sw: 2.6, sil: false, heavy: false });

  sb.group('limbs');
  switch (mood) {
    case 'happy':
      arm([[62, 184], [46, 178], [38, 162]], [37, 154]);
      arm([[182, 182], [204, 190], [196, 208]], [194, 212]);
      break;
    case 'proud':
      arm([[62, 186], [46, 194], [52, 208]], [56, 212]);
      arm([[182, 182], [200, 170], [208, 152]], [207, 144]);
      break;
    case 'ok':
      arm([[60, 184], [46, 198], [46, 212]], [46, 217]);
      arm([[182, 184], [202, 190], [212, 178]], [214, 172]);
      break;
    case 'sad':
    case 'broke':
      arm([[62, 188], [46, 180], [56, 170], [76, 190]], [78, 194]);
      arm([[182, 186], [200, 202], [196, 218]], [196, 223]);
      break;
    case 'shock':
      arm([[60, 186], [46, 180], [54, 170]], [68, 176]);
      arm([[183, 186], [198, 180], [190, 170]], [174, 174]);
      break;
    case 'sideeye':
      arm([[185, 197], [152, 222], [118, 223], [94, 216]], [91, 215]);
      arm([[59, 195], [90, 219], [126, 225], [150, 218]], [153, 217]);
      break;
    case 'tempted':
      arm([[62, 184], [46, 176], [42, 160]], [44, 152]);
      arm([[182, 184], [200, 176], [204, 160]], [202, 152]);
      break;
  }

  sb.group('props');
  switch (mood) {
    case 'happy':
      star(26, 128, 8);
      star(216, 104, 6);
      break;
    case 'proud':
      coin(207, 124, 11);
      star(22, 90, 11);
      star(222, 80, 8);
      star(30, 172, 6);
      star(220, 170, 9);
      break;
    case 'sad':
      wallet(204, 232, 12);
      break;
    case 'broke':
      wallet(214, 140, -16);
      break;
    case 'shock':
      for (const [a, b] of [
        [[40, 96], [54, 106]],
        [[32, 118], [49, 120]],
        [[202, 100], [188, 108]],
        [[208, 124], [190, 123]],
        [[198, 80], [188, 92]],
      ] as [Pt, Pt][]) {
        inkLine(sb, G.wobblyLine([a, b], r, 0.2), 4.5, C.fry);
      }
      break;
    case 'tempted':
      star(28, 100, 9);
      star(218, 96, 8);
      star(214, 176, 6);
      break;
  }

  return sb.scene({ color: C.sticker, width: 14 }, `rotate(${TILT[mood]} 120 230)`);
}
