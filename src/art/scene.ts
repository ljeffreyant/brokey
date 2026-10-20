// A scene is a flat list of styled paths. The same scene renders to
// react-native-svg in the app and to an SVG string for PNGs (icon, previews).

export interface PathPrim {
  d: string;
  fill?: string;
  stroke?: string;
  sw?: number;
  op?: number;
  cap?: 'butt' | 'round';
  join?: 'round' | 'miter';
  /** id of a clip def */
  clip?: string;
  transform?: string;
  /** layer name, so the app can animate parts (fries, face, limbs) separately */
  g?: string;
}

export interface Scene {
  w: number;
  h: number;
  /** viewBox [x, y, w, h]; defaults to [0, 0, w, h] */
  vb?: [number, number, number, number];
  /** SVG transform applied to the whole drawing (a slight lean makes it feel hand-posed) */
  tilt?: string;
  defs: { id: string; d: string }[];
  prims: PathPrim[];
  /** layer names in back-to-front order ('sticker' first when there is a sticker border) */
  groups: string[];
}

export class SceneBuilder {
  prims: PathPrim[] = [];
  defs: { id: string; d: string }[] = [];
  private sil: { d: string; line?: number; g?: string }[] = [];
  vb?: [number, number, number, number];
  private uid = 0;
  private cur?: string;

  /** Everything added after this call belongs to the named layer. */
  group(name?: string): void {
    this.cur = name;
  }

  constructor(
    public w: number,
    public h: number,
    private prefix = 's',
  ) {}

  nextId(): string {
    return `${this.prefix}${this.uid++}`;
  }

  def(d: string): string {
    const id = this.nextId();
    this.defs.push({ id, d });
    return id;
  }

  add(p: PathPrim): void {
    this.prims.push(p.g || !this.cur ? p : { ...p, g: this.cur });
  }

  /** Mark a path as part of the sticker silhouette (thick outline behind everything). */
  silhouette(d: string): void {
    this.sil.push({ d, g: this.cur });
  }

  /** Open stroke (limb) that should also get the sticker border; w = its ink width. */
  silhouetteLine(d: string, w: number): void {
    this.sil.push({ d, line: w, g: this.cur });
  }

  /** Border for a detachable layer (fry*) travels with it, everything else shares one border layer. */
  private stickerGroup(g?: string): string {
    return g && g.startsWith('fry') ? g : 'sticker';
  }

  scene(sticker?: { color: string; width: number }, tilt?: string): Scene {
    const back: PathPrim[] = sticker
      ? this.sil.map((s) =>
          s.line != null
            ? {
                d: s.d,
                stroke: sticker.color,
                sw: s.line + sticker.width,
                join: 'round' as const,
                cap: 'round' as const,
                g: this.stickerGroup(s.g),
              }
            : {
                d: s.d,
                fill: sticker.color,
                stroke: sticker.color,
                sw: sticker.width,
                join: 'round' as const,
                cap: 'round' as const,
                g: this.stickerGroup(s.g),
              },
        )
      : [];
    const prims = [...back, ...this.prims];
    const groups: string[] = back.some((b) => b.g === 'sticker') ? ['sticker'] : [];
    for (const p of this.prims) if (p.g && !groups.includes(p.g)) groups.push(p.g);
    return { w: this.w, h: this.h, vb: this.vb, tilt, defs: this.defs, prims, groups };
  }
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/** Inner SVG markup (defs + paths) for a scene. */
export function sceneInner(scene: Scene, idPrefix = '', only?: string[]): string {
  const defs = scene.defs
    .map((d) => `<clipPath id="${idPrefix}${d.id}"><path d="${esc(d.d)}"/></clipPath>`)
    .join('');
  const body = scene.prims
    .filter((p) => !only || (p.g != null && only.includes(p.g)))
    .map((p) => {
      const attrs = [
        `d="${esc(p.d)}"`,
        `fill="${p.fill ?? 'none'}"`,
        p.stroke ? `stroke="${p.stroke}"` : '',
        p.sw != null ? `stroke-width="${p.sw}"` : '',
        p.op != null ? `opacity="${p.op}"` : '',
        p.cap ? `stroke-linecap="${p.cap}"` : '',
        p.join ? `stroke-linejoin="${p.join}"` : '',
        p.transform ? `transform="${p.transform}"` : '',
      ]
        .filter(Boolean)
        .join(' ');
      const path = `<path ${attrs}/>`;
      return p.clip ? `<g clip-path="url(#${idPrefix}${p.clip})">${path}</g>` : path;
    })
    .join('');
  return `<defs>${defs}</defs>` + (scene.tilt ? `<g transform="${scene.tilt}">${body}</g>` : body);
}

export function viewBoxOf(scene: Scene): [number, number, number, number] {
  return scene.vb ?? [0, 0, scene.w, scene.h];
}

export function sceneToSvg(scene: Scene, opts: { size?: number; bg?: string } = {}): string {
  const [vx, vy, vw, vh] = viewBoxOf(scene);
  const size = opts.size ?? vw;
  const h = Math.round((size * vh) / vw);
  const bg = opts.bg ? `<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="${opts.bg}"/>` : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${h}" viewBox="${vx} ${vy} ${vw} ${vh}">` +
    bg +
    sceneInner(scene) +
    `</svg>`
  );
}
