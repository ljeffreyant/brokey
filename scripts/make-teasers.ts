/**
 * Brokey "coming soon" teaser posts. One system (see teasers-common.ts), six posts.
 *   npx tsx scripts/make-teasers.ts   -> social/teasers/posts.html + posts.json
 *   python3 scripts/render-teasers.py all
 *
 * The series asks one question, "how many snack packs is that?", and answers it in the app's own numbers:
 * 01 the unit, 02 sneakers, 03 a ride, 04 headphones (the fridge), 05 fries left (the weekly meter), 06 the app.
 * Every number and line below is from the app (src/core/roasts-*.ts, src/i18n/en.ts, store/raw screenshots).
 */
import fs from 'node:fs';
import path from 'node:path';
import { root } from './story-art';
import { CSS, W, H, X0, X1, RY2, chrome, chart, key, hero, eyebrow, voice, type Post } from './teasers-common';

const TOTAL = 6;
const posts: Post[] = [];
const add = (id: string, cls: 'yel' | 'ink', html: string) => posts.push({ id, cls, html });

// 01 THE UNIT: what one pack is worth.
add('t1-unit', 'yel', `
${chrome(1, TOTAL)}
${eyebrow('Meet Brokey', '1 HSP = $18', false)}
${hero('1', 'Halal|snack|pack')}
${chart(1)}
${key('Everything you buy, in these')}
${voice('happy', 9, 'Brokey', 'A halal snack pack with opinions about your money.')}
`);

// 02 A RIDE: real Melbourne roast.
add('t2-ride', 'ink', `
${chrome(2, TOTAL)}
${eyebrow('Ride across town', '$38')}
${hero('2.1', 'Halal|snack|packs')}
${chart(2.1)}
${key('One pack = $18')}
${voice('sideeye', 6, 'The roast', 'There is a tram. It goes there. It costs $2.')}
`);

// 03 SNEAKERS: the conversion. Roast: real line from the clothes set.
add('t3-sneakers', 'yel', `
${chrome(3, TOTAL)}
${eyebrow('Sneakers', '$179')}
${hero('9.9', 'Halal|snack|packs')}
${chart(9.9)}
${key('One pack = $18')}
${voice('shock', 3, 'The roast', 'The cart sat there for a week and then you caved. Classic.')}
`);

// 04 HEADPHONES: the fridge (Chill). The app rounds 10+ to whole packs, so 249 / 18 shows as 14.
add('t4-fridge', 'ink', `
${chrome(4, TOTAL)}
${eyebrow('Headphones', '$249')}
${hero('14', 'Halal|snack|packs')}
${chart(14)}
${key('One pack = $18')}
${voice('tempted', 6, 'The fridge', 'Hands off the card. Big wants cool off for 24 hours first.')}
`);

// 05 FRIES: the weekly meter. 9 fries a week, 3 left on a Thursday.
add('t5-fries', 'yel', `
${chrome(5, TOTAL)}
${eyebrow('This week', '9 fries', false)}
${hero('3', 'Fries|left')}
${chart(3, 'fry', 766)}
${key('9 fries a week. Resets Monday.')}
${voice('sad', 3, 'The fries', 'Fries are getting scarce, bestie.')}
`);

// 06 THE APP: real screens. Same chrome, the hero slot holds the message, the phones stand behind the lower rule.
const scr = (n: string) => `file://${root}/store/raw/${n}.png`;
const PW = 288;
const phone = (img: string, x: number, y: number) => `<div class="phone" style="left:${x}px;top:${y}px;width:${PW}px;border-radius:48px"><img src="${scr(img)}"></div>`;
add('t6-app', 'ink', `
<div class="ab" style="left:0;top:0;width:${W}px;height:${RY2}px;overflow:hidden">
${phone('1-home', X0, 700)}${phone('2-roast', X0 + PW + 36, 650)}${phone('3-chill', X0 + 2 * (PW + 36), 700)}
</div>
${chrome(6, TOTAL, 'No bank login. No ads. Made in Melbourne.')}
${eyebrow('Roast your spending', 'iPhone', false)}
<div class="ab bri big" style="left:${X0}px;top:270px">Coming<br>soon.</div>
<img class="ab" src="file://${root}/assets/icon.png" style="left:826px;top:496px;width:182px;height:182px;border-radius:41px;box-shadow:0 0 0 3px #FFD23F">
`);

const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
${posts.map((p) => `<section class="post ${p.cls}" id="${p.id}">${p.html}</section>`).join('\n')}
</body></html>`;
const out = path.join(root, 'social', 'teasers');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'posts.html'), html);
fs.writeFileSync(path.join(out, 'posts.json'), JSON.stringify(posts.map((p) => ({ id: p.id, cls: p.cls }))));
console.log('wrote', posts.length, 'posts');
void H; void X1;
