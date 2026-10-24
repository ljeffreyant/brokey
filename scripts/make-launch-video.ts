/**
 * Brokey launch video, step 1: builds video/index.html (the animation page) from the real mascot art.
 *   npx tsx scripts/make-launch-video.ts          -> "Coming soon to iPhone" end card
 *   LIVE=1 npx tsx scripts/make-launch-video.ts   -> "Free on iPhone" end card (after approval)
 * Step 2: python3 scripts/render-launch-video.py   (renders frames, mixes the app's own sounds, writes video/brokey-launch.mp4)
 */
import fs from 'node:fs';
import path from 'node:path';
import { mascot, Mood } from '../src/art/mascot';
import { sceneInner, viewBoxOf } from '../src/art/scene';
import { wordmark } from './render-logo';

const root = path.join(__dirname, '..');
const out = path.join(root, 'video');
fs.mkdirSync(out, { recursive: true });

function svg(mood: Mood, fries: number, key: string): string {
  const sc = mascot(mood, 7, fries);
  const [vx, vy, vw, vh] = viewBoxOf(sc);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${vw} ${vh}">${sceneInner(sc, `${key}-`)}</svg>`;
}

let html = fs.readFileSync(path.join(__dirname, 'video-template.html'), 'utf8');
html = html.replace(/<!--M:([a-z]+)(\d)-->/g, (_m, mood: string, fries: string) => svg(mood as Mood, Number(fries), `${mood}${fries}`));
const wm = wordmark();
html = html.replace('<!--WORDMARK-->', `<svg viewBox="0 0 ${wm.w.toFixed(0)} ${wm.h.toFixed(0)}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">${wm.svg}</svg>`);
html = html.replace(/__ROOT__/g, root).replace('__CTA__', process.env.LIVE ? 'Free on iPhone' : 'Coming soon to iPhone');
fs.writeFileSync(path.join(out, 'index.html'), html);
console.log('video/index.html written');
