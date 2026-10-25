/**
 * Brokey teaser mural: two night panoramas (3240x1440) -> social/teasers/mural-<name>.html
 *   npx tsx scripts/make-mural.ts [outside|inside|all]
 *   python3 scripts/render-mural.py [outside|inside|all]   (screenshot, print finish, cut into posts)
 */
import fs from 'node:fs';
import path from 'node:path';
import { root } from './story-art';
import { MW, MH } from './teasers-scene';
import { outside } from './teasers-outside';

const FONTS = `
@font-face{font-family:"Neon";src:url("file://${root}/social/fonts/TiltNeon_400Regular.ttf")}
@font-face{font-family:"Anton";src:url("file://${root}/social/fonts/Anton_400Regular.ttf")}
@font-face{font-family:"Marker";src:url("file://${root}/social/fonts/PermanentMarker_400Regular.ttf")}
@font-face{font-family:"Bricolage";font-weight:800;src:url("file://${root}/node_modules/@expo-google-fonts/bricolage-grotesque/800ExtraBold/BricolageGrotesque_800ExtraBold.ttf")}`;

const which = process.argv[2] ?? 'all';
const out = path.join(root, 'social', 'teasers');
fs.mkdirSync(out, { recursive: true });
const page = (svg: string) => `<!doctype html><html><head><meta charset="utf-8"><style>${FONTS}html,body{margin:0;background:#0B0A2B;width:${MW}px;height:${MH}px;overflow:hidden}svg{display:block}</style></head><body>${svg}</body></html>`;
if (which === 'outside' || which === 'all') fs.writeFileSync(path.join(out, 'mural-outside.html'), page(outside()));
if (which === 'inside' || which === 'all') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { inside } = require('./teasers-inside');
    fs.writeFileSync(path.join(out, 'mural-inside.html'), page(inside()));
  } catch (e: any) { if (which === 'inside') throw e; }
}
console.log('wrote mural html', which);
