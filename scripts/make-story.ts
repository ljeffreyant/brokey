/**
 * "The Broke Apocalypse": narrated cel-shaded story reels (Part 1, 2, 3...).
 *   npx tsx scripts/make-story.ts p1 --script   -> social/story/vo/p1/script.json (text for the narrator)
 *   npx tsx scripts/make-story.ts p1            -> social/story/p1.html + p1.timeline.json (uses vo/p1/durations.json)
 * Then: scripts/make-story-vo.py, scripts/render-story.py, scripts/make-story-audio.py
 */
import fs from 'node:fs';
import path from 'node:path';
import { SHOTS as S1 } from './story-shots';
import { SHOTS as S2 } from './story-shots2';
const SHOTS = { ...S1, ...S2 };
import { PARTS, Beat, Chunk, At } from './story-parts';
import { root } from './story-art';

const partId = process.argv[2] ?? 'p1';
const part = PARTS[partId];
if (!part) throw new Error(`unknown part ${partId}: ${Object.keys(PARTS).join(', ')}`);
const out = path.join(root, 'social', 'story');
const voDir = path.join(out, 'vo', partId);
fs.mkdirSync(voDir, { recursive: true });

const strip = (s: string) => s.replace(/\*/g, '');
const em = (s: string) => s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
const isText = (c: Chunk): c is string => typeof c === 'string';

/* ---- narrator script ---- */
const script: { key: string; text: string }[] = [];
part.beats.forEach((b, bi) => (b.vo ?? []).forEach((c, ci) => { if (isText(c)) script.push({ key: `b${bi}c${ci}`, text: strip(c) }); }));
fs.writeFileSync(path.join(voDir, 'script.json'), JSON.stringify(script, null, 1));
if (process.argv.includes('--script')) {
  console.log(`${script.length} narrator lines, ${script.reduce((n, s) => n + s.text.split(/\s+/).length, 0)} words -> ${path.relative(root, voDir)}/script.json`);
  process.exit(0);
}

/* ---- timeline ---- */
const durFile = path.join(voDir, 'durations.json');
const known: Record<string, number> = fs.existsSync(durFile) ? JSON.parse(fs.readFileSync(durFile, 'utf8')) : {};
const guess = (t: string) => 0.5 + t.split(/\s+/).length / 2.3;
const GAP = 0.2;

type Cue = { k: string; t: number; v?: number | string };
const scenes: any[] = [];
const caps: { a: number; b: number; html: string }[] = [];
const fries: { t: number; n: number }[] = [];
const fx: { t: number; k: string; d: number }[] = [];
const vo: { t: number; d: number; key: string }[] = [];
const sfx: Cue[] = [];
const labels: { a: number; b: number; txt: string }[] = [];
const beatsOut: { a: number; b: number; bed: string }[] = [];

let cur = 0;
part.beats.forEach((b, bi) => {
  const a = cur;
  const lead = b.lead ?? 0.35;
  let t = a + lead;
  const chunkStart: number[] = [];
  (b.vo ?? []).forEach((c, ci) => {
    chunkStart[ci] = t;
    if (!isText(c)) { t += c.p; return; }
    const key = `b${bi}c${ci}`;
    const d = known[key] ?? guess(strip(c));
    caps.push({ a: t - 0.04, b: t + d + GAP * 0.8, html: em(c) });
    vo.push({ t, d, key });
    t += d + GAP;
  });
  const voEnd = (b.vo ?? []).length ? t - GAP : a + lead;
  const dur = Math.max(b.min ?? 0, voEnd - a + (b.pad ?? 0.5));
  const bEnd = a + dur;
  const resolve = (at: At): number => (typeof at === 'number' ? a + at : (chunkStart[at.chunk] ?? a) + (at.off ?? 0));

  // shots inside the beat
  const shots = (b.shots ?? [{ shot: b.shot!, opts: b.opts, cam: b.cam }]).map((s) => ({ ...s, opts: { ...(b.opts ?? {}), ...(s.opts ?? {}) } }));
  shots.forEach((s, si) => {
    const sa = si === 0 ? a : resolve((s as any).at ?? 0);
    const sb = si === shots.length - 1 ? bEnd : resolve((shots[si + 1] as any).at ?? 0);
    const fn = SHOTS[s.shot];
    if (!fn) throw new Error(`no shot ${s.shot}`);
    const n = scenes.length;
    const html = fn(s.opts as any)
      .replace(/\bid="([^"]+)"/g, (_m, id) => `id="${id}_${n}" data-id="${id}"`)
      .replace(/url\(#([^)]+)\)/g, (_m, id) => `url(#${id}_${n})`);
    scenes.push({ n, shot: s.shot, a: sa, b: sb, cam: s.cam ?? b.cam ?? { from: [0, 0, 1.03, 0], to: [10, -10, 1.08, 0] }, html, cues: [] as Cue[], tr: si === 0 ? b.tr ?? 'cut' : (s as any).tr ?? 'cut' });
  });
  const last = scenes.length;
  (b.cues ?? []).forEach((c) => {
    const cue: Cue = { k: c.k, t: resolve(c.at), v: c.v };
    // attach to the scene that is on screen at that time
    const sc = scenes.slice(last - shots.length).find((s) => cue.t >= s.a && cue.t < s.b) ?? scenes[last - 1];
    sc.cues.push(cue);
    sfx.push({ ...cue, v: c.v });
    if (c.k === 'fries') fries.push({ t: cue.t, n: Number(c.v) });
  });
  if (b.fries !== undefined) fries.push({ t: a, n: b.fries });
  if (b.label !== undefined) labels.push({ a, b: bEnd, txt: b.label });
  if (b.tr && b.tr !== 'cut') fx.push({ t: a, k: b.tr, d: b.trd ?? 0.28 });
  beatsOut.push({ a, b: bEnd, bed: b.bed ?? 'calm' });
  cur = bEnd;
});
const total = cur + (part.tail ?? 0);
fries.sort((x, y) => x.t - y.t);

const timeline = {
  part: partId, title: part.title, dur: total, fps: 24,
  scenes: scenes.map(({ html, ...s }) => s),
  caps, fries, fx, labels, vo, sfx, beats: beatsOut,
};
fs.writeFileSync(path.join(out, `${partId}.timeline.json`), JSON.stringify(timeline, null, 1));

const css = fs.readFileSync(path.join(__dirname, 'story.css'), 'utf8').replace(/__ROOT__/g, root);
const js = fs.readFileSync(path.join(__dirname, 'story.js'), 'utf8').replace('__TL__', () => JSON.stringify(timeline));
const sceneHtml = scenes.map((s) => `<div class="scene" id="sc-${s.n}">${s.html}</div>`).join('\n');
const html = `<!doctype html><html><head><meta charset="utf-8"><title>Brokey story ${partId}</title><style>${css}</style></head><body><div id="stage">
${sceneHtml}
<div id="capshade"></div><div id="label"></div><div id="fries"></div><div id="cap"><span></span></div><div id="flash"></div><div id="glitch"></div>
</div><script>${js}</script></body></html>`;
fs.writeFileSync(path.join(out, `${partId}.html`), html);
console.log(`${partId}: ${scenes.length} shots, ${total.toFixed(1)}s, ${vo.length} narrator lines${Object.keys(known).length ? '' : ' (estimated, run make-story-vo.py)'}`);
