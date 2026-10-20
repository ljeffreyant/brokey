import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs';
import { logoMark } from '../src/art/logomark';
import { sceneInner } from '../src/art/scene';
import { C } from '../src/art/palette';

const out = path.join(__dirname, '..', 'art-out');
fs.mkdirSync(out, { recursive: true });

async function main() {
  const sc = logoMark();
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">` +
    `<rect width="1024" height="1024" fill="${C.red}"/>` +
    sceneInner(sc, 'x-') +
    `</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(out, 'mark-test.png'));
  await sharp(Buffer.from(svg)).resize(180, 180).png().toFile(path.join(out, 'mark-test-small.png'));
  console.log('ok');
}
main();
