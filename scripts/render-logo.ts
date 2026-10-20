import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { logoMark } from '../src/art/logomark';
import { mascot } from '../src/art/mascot';
import { viewBoxOf } from '../src/art/scene';
import { sceneInner } from '../src/art/scene';
import { BROKEY_GLYPHS } from '../src/art/glyphs';
import { rng, dotsPath } from '../src/art/geom';
import { C, INK } from '../src/art/palette';

const root = path.join(__dirname, '..');
const out = path.join(root, 'art-out');
const assets = path.join(root, 'assets');
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(assets, { recursive: true });

function burst(cx: number, cy: number, rays: number, rad: number, color: string, phase = 0): string {
  let d = '';
  for (let i = 0; i < rays; i++) {
    const a0 = phase + (i / rays) * Math.PI * 2;
    const a1 = a0 + (Math.PI * 2) / rays / 2;
    d += `M${cx} ${cy}L${(cx + Math.cos(a0) * rad).toFixed(1)} ${(cy + Math.sin(a0) * rad).toFixed(1)}L${(cx + Math.cos(a1) * rad).toFixed(1)} ${(cy + Math.sin(a1) * rad).toFixed(1)}Z`;
  }
  return `<path d="${d}" fill="${color}"/>`;
}

export function wordmark(seed = 5, fill = C.fry): { svg: string; w: number; h: number } {
  const r = rng(seed);
  const gl = BROKEY_GLYPHS;
  const x1 = Math.min(...gl.map((g) => g.x1));
  const x2 = Math.max(...gl.map((g) => g.x2));
  const top = Math.min(...gl.map((g) => g.y1));
  const bottom = Math.max(...gl.map((g) => g.y2));
  const pad = 22;
  const w = x2 - x1 + pad * 2;
  const h = bottom - top + pad * 2;
  let shadow = '';
  let main = '';
  gl.forEach((g, i) => {
    const rot = (r() - 0.5) * 9;
    const dy = (r() - 0.5) * 6 + (i % 2 ? 2 : -2);
    const cx = (g.x1 + g.x2) / 2;
    const cy = (g.y1 + g.y2) / 2;
    const t = `translate(${(pad - x1).toFixed(1)} ${(pad - top + dy).toFixed(1)}) rotate(${rot.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})`;
    shadow += `<path d="${g.d}" transform="translate(4 5) ${t}" fill="${INK}" stroke="${INK}" stroke-width="7" stroke-linejoin="round" fill-rule="evenodd"/>`;
    main += `<path d="${g.d}" transform="${t}" fill="${fill}" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round" fill-rule="evenodd"/>`;
  });
  return { svg: shadow + main, w, h };
}

async function main() {
  const size = 1024;
  const r = rng(3);
  const hero = mascot('happy');
  const [vx, vy, vw, vh] = viewBoxOf(hero);
  const hk = 3.35;
  const heroAt = (idp: string, k: number, cx: number, cy: number) =>
    `<g transform="translate(${(cx - (vx + vw / 2) * k).toFixed(1)} ${(cy - (vy + vh / 2) * k).toFixed(1)}) scale(${k})">${sceneInner(hero, idp)}</g>`;
  const tray = logoMark();
  const place = (k: number) => `translate(${(512 - 512 * k).toFixed(1)} ${(512 - 540 * k).toFixed(1)}) scale(${k})`;

  const bg =
    `<rect width="${size}" height="${size}" fill="${C.red}"/>` +
    `<circle cx="512" cy="530" r="470" fill="#FF6F5C"/>` +
    `<path d="${dotsPath(0, 0, size, size, 34, 5.5, r, 1.5)}" fill="#C93A2A" fill-opacity="0.22"/>`;
  const wrap = (inner: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${inner}</svg>`;

  // ---------- app icon: the cute one ----------
  const iconSvg = wrap(
    bg + heroAt('i-', hk, 512, 520),
  );
  // App Store icons must have no alpha channel at all, even a fully opaque one.
  await sharp(Buffer.from(iconSvg)).flatten({ background: C.red }).removeAlpha().png().toFile(path.join(assets, 'icon.png'));
  await sharp(Buffer.from(iconSvg)).resize(256, 256).png().toFile(path.join(out, 'icon-preview.png'));
  await sharp(Buffer.from(iconSvg)).resize(180, 180).png().toFile(path.join(out, 'icon-180.png'));
  await sharp(Buffer.from(iconSvg)).resize(48, 48).png().toFile(path.join(assets, 'favicon.png'));

  // alternates kept for comparison
  await sharp(Buffer.from(wrap(bg + `<g transform="${place(1.04)}">${sceneInner(tray, 'alt1-')}</g>`))).png().toFile(path.join(out, 'alt-icon-tray.png'));
  const tempted = mascot('tempted');
  const [tx, ty, tw, th] = viewBoxOf(tempted);
  await sharp(
    Buffer.from(
      wrap(bg + `<g transform="translate(${(512 - (tx + tw / 2) * hk).toFixed(1)} ${(520 - (ty + th / 2) * hk).toFixed(1)}) scale(${hk})">${sceneInner(tempted, 'alt2-')}</g>`),
    ),
  ).png().toFile(path.join(out, 'alt-icon-money-eyes.png'));

  // adaptive foreground (android later): mascot only, inside the safe zone
  await sharp(Buffer.from(wrap(heroAt('a-', 2.5, 512, 530)))).png().toFile(path.join(assets, 'adaptive-icon.png'));

  // ---------- wordmark ----------
  const wm = wordmark();
  const wmSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(wm.w * 4)}" height="${Math.round(wm.h * 4)}" viewBox="0 0 ${wm.w.toFixed(0)} ${wm.h.toFixed(0)}">${wm.svg}</svg>`;
  await sharp(Buffer.from(wmSvg)).png().toFile(path.join(out, 'wordmark.png'));

  // ---------- splash: mascot + wordmark on transparent ----------
  const wmScale = 760 / wm.w;
  const splash = wrap(
    heroAt('s-', 2.0, 512, 330) +
      `<g transform="translate(${(512 - (wm.w * wmScale) / 2).toFixed(1)} 640) scale(${wmScale.toFixed(3)})">${wm.svg}</g>`,
  );
  await sharp(Buffer.from(splash)).png().toFile(path.join(assets, 'splash-icon.png'));
  await sharp(Buffer.from(splash)).resize(512, 512).flatten({ background: '#16110E' }).png().toFile(path.join(out, 'splash-preview.png'));
  console.log('logo rendered');
}

if (require.main === module) main();
