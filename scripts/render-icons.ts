import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { ICON_DEFS, iconScene } from '../src/art/icons';
import { sceneInner, viewBoxOf } from '../src/art/scene';

const out = path.join(__dirname, '..', 'art-out');
fs.mkdirSync(out, { recursive: true });

async function sheet(ids: string[], name: string, cols = 8, cell = Number(process.argv[3] ?? 150)) {
  const rows = Math.ceil(ids.length / cols);
  let inner = '';
  ids.forEach((id, i) => {
    const sc = iconScene(id);
    const [vx, vy, vw, vh] = viewBoxOf(sc);
    const x = (i % cols) * cell;
    const y = Math.floor(i / cols) * (cell + 18);
    inner += `<rect x="${x + 8}" y="${y + 6}" width="${cell - 16}" height="${cell - 16}" rx="26" fill="#FFD23F" fill-opacity="${0.12 + (i % 5) * 0.03}"/>`;
    inner += `<svg x="${x + 18}" y="${y + 16}" width="${cell - 36}" height="${cell - 36}" viewBox="${vx} ${vy} ${vw} ${vh}">${sceneInner(sc, `${id}-`)}</svg>`;
    inner += `<text x="${x + cell / 2}" y="${y + cell + 6}" fill="#E9DCC3" font-family="sans-serif" font-size="12" text-anchor="middle">${id}</text>`;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * cell}" height="${rows * (cell + 18)}"><rect width="100%" height="100%" fill="#16110E"/>${inner}</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(out, name));
}

async function main() {
  const arg = process.argv[2];
  const ids = ICON_DEFS.map((d) => d.id).filter((id) => !arg || id.startsWith(arg) || arg.split(',').includes(id));
  const per = 24;
  for (let i = 0; i * per < ids.length; i++) {
    await sheet(ids.slice(i * per, (i + 1) * per), `icons-${i + 1}.png`);
  }
  console.log(`${ids.length} icons`);
}
main();
