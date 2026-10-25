/**
 * Brokey teaser system (1080x1440, 3:4 = the profile grid tile).
 *
 * One template. Every element lives at a fixed coordinate, so the series reads as one piece.
 *   - Two colours only. Odd posts are yellow with ink type, even posts are ink with yellow type,
 *     so the profile grid is a checkerboard.
 *   - Two full-bleed rules (y 176 and y 1176). They run edge to edge, so across a row of tiles they
 *     read as one continuous ledger line. Brokey stands on the lower one.
 *   - Facts are set in Bricolage Grotesque 800 (numbers, labels, headlines).
 *     Brokey's opinions are set in Fraunces italic (the only serif, the only voice).
 *     DM Sans 700 is for tiny tracked captions.
 *   - The unit chart is the signature graphic: one pack per HSP, one fry per fry.
 */
import { M, root } from './story-art';

export const W = 1080;
export const H = 1440;
export const X0 = 72; // left margin
export const X1 = 1008; // right edge of the text column (W - margin)
export const RY1 = 176; // top rule
export const RY2 = 1176; // bottom rule (the ground line)

export const CSS = `
@font-face{font-family:"Fraunces";font-weight:900;font-style:italic;src:url("file://${root}/social/fonts/fraunces-latin-900-italic.woff2")}
@font-face{font-family:"Fraunces";font-weight:700;font-style:italic;src:url("file://${root}/social/fonts/fraunces-latin-700-italic.woff2")}
@font-face{font-family:"Bricolage";font-weight:800;src:url("file://${root}/node_modules/@expo-google-fonts/bricolage-grotesque/800ExtraBold/BricolageGrotesque_800ExtraBold.ttf")}
@font-face{font-family:"DM";font-weight:700;src:url("file://${root}/node_modules/@expo-google-fonts/dm-sans/700Bold/DMSans_700Bold.ttf")}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#111;width:${W}px}
.post{position:relative;width:${W}px;height:${H}px;overflow:hidden;margin-bottom:40px;background:var(--bg);color:var(--fg)}
.yel{--bg:#FFD23F;--fg:#24120A}
.ink{--bg:#24120A;--fg:#FFD23F}
.ab{position:absolute}
.rule{position:absolute;left:0;width:${W}px;height:4px;background:var(--fg)}
.bri{font-family:"Bricolage",sans-serif;font-weight:800}
.dm{font-family:"DM",sans-serif;font-weight:700}
.hd-l{left:${X0}px;top:92px;font-size:46px;line-height:1;letter-spacing:-.01em}
.hd-r{right:${W - X1}px;top:102px;font-size:26px;line-height:1;letter-spacing:.14em;font-variant-numeric:tabular-nums}
.eb-l{left:${X0}px;top:206px;font-size:46px;line-height:1;letter-spacing:-.01em}
.eb-r{right:${W - X1}px;top:206px;font-size:46px;line-height:1;letter-spacing:-.01em;font-variant-numeric:tabular-nums}
.eb-r.cut{text-decoration:line-through;text-decoration-thickness:6px}
.hero{left:${X0}px;top:262px;display:flex;align-items:flex-end;gap:30px;height:440px}
.num{font-size:540px;line-height:.74;letter-spacing:-.055em;margin-left:-22px;height:400px;display:block}
.unit{font-size:44px;line-height:1.04;letter-spacing:.02em;text-transform:uppercase;padding-bottom:6px;white-space:nowrap}
.big{font-size:218px;line-height:.86;letter-spacing:-.045em;margin-left:-8px}
.slot{position:absolute}
.slot svg{display:block;width:100%;height:100%}
.slot .part{position:absolute;inset:0}
.key{left:${X0}px;font-size:24px;line-height:1;letter-spacing:.12em;text-transform:uppercase}
.mas{width:240px}
.mas svg{display:block;width:100%;height:auto}
.vlabel{left:318px;top:1004px;font-size:22px;line-height:1;letter-spacing:.16em;text-transform:uppercase}
.vq{left:318px;top:1042px;width:690px;font-family:"Fraunces",serif;font-style:italic;font-weight:900;font-size:47px;line-height:1.1;letter-spacing:-.005em}
.fl1{left:${X0}px;top:1230px;font-size:40px;line-height:1;letter-spacing:-.01em}
.fl2{left:${X0}px;top:1286px;font-size:25px;line-height:1;letter-spacing:.02em;opacity:.82}
.pill{right:${W - X1}px;top:1236px;background:var(--fg);color:var(--bg);border-radius:999px;padding:21px 34px 20px;font-size:24px;line-height:1;letter-spacing:.16em;white-space:nowrap}
.phone{position:absolute;overflow:hidden;background:#000;border:9px solid #52331F;box-shadow:0 0 0 2px var(--fg)}
.phone img{display:block;width:100%;height:auto}
`;

/** Chrome shared by every post: header, the two rules, the footer. */
export const chrome = (n: number, total: number, foot2 = 'Free. No bank login. No ads.') => `
<div class="rule" style="top:${RY1}px"></div>
<div class="rule" style="top:${RY2}px"></div>
<div class="ab bri hd-l">Brokey</div>
<div class="ab dm hd-r">${String(n).padStart(2, '0')} / ${String(total).padStart(2, '0')}</div>
<div class="ab bri fl1">Budget in halal snack packs.</div>
<div class="ab dm fl2">${foot2}</div>
<div class="ab dm pill">COMING SOON</div>`;

/** Geometric snack pack, one colour: fries over a lidded tray. 100x100 box. */
const tray = 'M9 38 H91 L81 93 Q80 96 76 96 H24 Q20 96 19 93 Z';
const fries = 'M22 36 L15 12M40 34 L37 5M58 34 L62 7M76 38 L85 16';
const packFull = `<svg viewBox="0 0 100 100"><g stroke="var(--fg)" stroke-linecap="round" stroke-width="10" fill="none"><path d="${fries}"/></g><path d="${tray}" fill="var(--fg)" stroke="var(--fg)" stroke-width="5" stroke-linejoin="round"/><path d="M14 56 H86" stroke="var(--bg)" stroke-width="5"/></svg>`;
const packEmpty = `<svg viewBox="0 0 100 100" opacity=".4"><g stroke="var(--fg)" stroke-linecap="round" stroke-width="5" fill="none"><path d="${fries}"/></g><path d="${tray}" fill="none" stroke="var(--fg)" stroke-width="4" stroke-linejoin="round"/><path d="M14 56 H86" stroke="var(--fg)" stroke-width="3"/></svg>`;
const fryFull = `<svg viewBox="0 0 40 100" preserveAspectRatio="none"><rect x="3" y="3" width="34" height="94" rx="9" fill="var(--fg)"/></svg>`;
const fryEmpty = `<svg viewBox="0 0 40 100" preserveAspectRatio="none"><rect x="5" y="5" width="30" height="90" rx="7" fill="none" stroke="var(--fg)" stroke-width="4" opacity=".4"/></svg>`;

/**
 * Unit chart. kind 'pack': rows of 10, one pack per HSP (fractions are clipped).
 * kind 'fry': one row of 9 fries.
 */
export function chart(value: number, kind: 'pack' | 'fry' = 'pack', top = 764): string {
  const out: string[] = [];
  if (kind === 'pack') {
    const rows = Math.max(1, Math.ceil(value / 10 - 1e-9));
    const size = 80, rowH = 90; // tray edges (9%..91% of the glyph) land exactly on both margins
    const p10 = (X1 - X0 - size * 0.82) / 9, x00 = X0 - size * 0.09;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < 10; c++) {
        const idx = r * 10 + c;
        const fill = Math.max(0, Math.min(1, value - idx));
        const left = x00 + c * p10, y = top + r * rowH;
        let inner = fill >= 1 ? packFull : fill <= 0 ? packEmpty : `${packEmpty}<div class="part" style="clip-path:inset(0 ${(100 - fill * 100).toFixed(1)}% 0 0)">${packFull}</div>`;
        out.push(`<div class="slot" style="left:${left.toFixed(1)}px;top:${y}px;width:${size}px;height:${size}px">${inner}</div>`);
      }
    }
  } else {
    const w = 44, h = 118, pitch = (X1 - X0 - w * 0.85) / 8, x00 = X0 - w * 0.085;
    for (let c = 0; c < 9; c++) {
      const on = c < value;
      out.push(`<div class="slot" style="left:${(x00 + c * pitch).toFixed(1)}px;top:${top - 2}px;width:${w}px;height:${h}px">${on ? fryFull : fryEmpty}</div>`);
    }
  }
  return out.join('');
}

/** Chart key, fixed above the chart. */
export const key = (text: string) => `<div class="ab dm key" style="top:716px">${text}</div>`;

/** Hero: giant number plus a stacked unit label on its baseline. */
export const hero = (num: string, unit: string) =>
  `<div class="ab hero"><span class="bri num">${num}</span><span class="bri unit">${unit.replace(/\|/g, '<br>')}</span></div>`;

/** Eyebrow row: item on the left, price on the right (struck through when it is the dollar price being replaced). */
export const eyebrow = (l: string, r: string, cut = true) =>
  `<div class="ab bri eb-l">${l}</div><div class="ab bri eb-r${cut ? ' cut' : ''}">${r}</div>`;

/** Brokey stands on the lower rule and gives his opinion in the serif. */
export const voice = (mood: any, fries: number, label: string, quote: string) => `
<div class="ab mas" style="left:${X0 - 14}px;top:${RY2 - 247 + 16}px">${M(mood, fries)}</div>
<div class="ab dm vlabel">${label}</div>
<div class="ab vq">${quote}</div>`;

export type Post = { id: string; html: string; cls: 'yel' | 'ink' };
