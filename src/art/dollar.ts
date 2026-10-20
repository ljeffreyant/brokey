import * as G from './geom';

type Pt = G.Pt;

// A $ drawn the way you'd squeeze it out of a sauce bottle: one wobbly S and two stubby ticks.
// Normalised so x and y both run about -1..1 around the centre.
const S_PTS: Pt[] = [
  [1, -0.61],
  [0.6, -0.92],
  [-0.08, -1],
  [-0.75, -0.82],
  [-0.87, -0.46],
  [-0.46, -0.2],
  [0.31, -0.02],
  [0.94, 0.23],
  [0.88, 0.63],
  [0.31, 0.94],
  [-0.4, 1],
  [-1, 0.77],
];

export interface DollarPaths {
  s: string;
  tickTop: string;
  tickBottom: string;
}

/** cx,cy = centre, hx/hy = half width / half height of the S. */
export function dollarPaths(cx: number, cy: number, hx: number, hy: number, rand: G.Rand, wobble = 0.5): DollarPaths {
  const map = (p: Pt): Pt => [cx + p[0] * hx, cy + p[1] * hy];
  return {
    s: G.wobblyLine(S_PTS.map(map), rand, wobble),
    tickTop: G.wobblyLine([map([0.02, -1.3]), map([0, -0.98])], rand, wobble * 0.3, 20),
    tickBottom: G.wobblyLine([map([0, 0.98]), map([-0.02, 1.3])], rand, wobble * 0.3, 20),
  };
}
