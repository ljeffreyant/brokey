import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { mascot, MOODS } from '../src/art/mascot';
import { sceneInner, sceneToSvg, viewBoxOf } from '../src/art/scene';

const out = path.join(__dirname, '..', 'art-out');
fs.mkdirSync(out, { recursive: true });

async function main() {
  // contact sheet of all moods
  const cell = 300;
  const cols = 4;
  const rows = Math.ceil(MOODS.length / cols);
  let inner = '';
  MOODS.forEach((m, i) => {
    const sc = mascot(m);
    const x = (i % cols) * cell;
    const y = Math.floor(i / cols) * cell;
    const [vx, vy, vw, vh] = viewBoxOf(sc);
    inner += `<svg x="${x + 20}" y="${y + 10}" width="${cell - 40}" height="${Math.round(((cell - 40) * vh) / vw)}" viewBox="${vx} ${vy} ${vw} ${vh}">${sceneInner(sc, `${m}-`)}</svg>`;
    inner += `<text x="${x + cell / 2}" y="${y + cell - 8}" fill="#FFD23F" font-family="sans-serif" font-size="16" text-anchor="middle">${m}</text>`;
  });
  const sheetSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cell * cols}" height="${cell * rows}" viewBox="0 0 ${cell * cols} ${cell * rows}"><rect width="100%" height="100%" fill="#16110E"/>${inner}</svg>`;
  await sharp(Buffer.from(sheetSvg)).png().toFile(path.join(out, 'mascot-sheet.png'));

  // single big happy on dark
  await sharp(Buffer.from(sceneToSvg(mascot('happy'), { size: 720, bg: '#241B16' }))).png().toFile(path.join(out, 'mascot-happy.png'));
  console.log('rendered');
}

main();
