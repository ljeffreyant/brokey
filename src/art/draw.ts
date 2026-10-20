import { INK } from './palette';
import { SceneBuilder } from './scene';
import { translatePath } from './geom';

export interface Layer {
  d: string;
  color: string;
  op?: number;
  /** when set, draw as a stroke of this width (hatching) instead of a fill */
  line?: number;
}

/**
 * Cartoon shape: flat fill, shading layers clipped to the shape,
 * then a thick ink outline on top so shading never eats the line.
 */
export function shape(
  sb: SceneBuilder,
  d: string,
  o: { fill: string; layers?: Layer[]; sw?: number; sil?: boolean; heavy?: boolean; off?: number },
): string {
  const id = sb.def(d);
  sb.add({ d, fill: o.fill });
  for (const l of o.layers ?? []) {
    if (l.line != null) sb.add({ d: l.d, stroke: l.color, sw: l.line, op: l.op, cap: 'round', clip: id });
    else sb.add({ d: l.d, fill: l.color, op: l.op, clip: id });
  }
  const sw = o.sw ?? 4.2;
  sb.add({ d, stroke: INK, sw, join: 'round', cap: 'round' });
  // second pass nudged down-right: heavier line on the shadow side, like real inking
  const off = o.off ?? 1;
  if (o.heavy !== false) sb.add({ d: translatePath(d, 1.2 * off, 1.5 * off), stroke: INK, sw: sw * 0.8, join: 'round', cap: 'round' });
  if (o.sil !== false) sb.silhouette(d);
  return id;
}

/** Outlined limb / drizzle: ink line with a colored line on top. */
export function limb(sb: SceneBuilder, d: string, w: number, color: string, sil = true): void {
  sb.add({ d, stroke: INK, sw: w + 5, cap: 'round', join: 'round' });
  sb.add({ d, stroke: color, sw: w, cap: 'round', join: 'round' });
  if (sil) sb.silhouetteLine(d, w + 5);
}

export function inkLine(sb: SceneBuilder, d: string, w: number, color: string = INK): void {
  sb.add({ d, stroke: color, sw: w, cap: 'round', join: 'round' });
}
