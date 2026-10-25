/** Shared canvas, CSS and helpers for the teaser posts (1080x1440). */
import { M, WM, INK, root } from './story-art';

export const W = 1080;
export const H = 1440;

export const CSS = `
@font-face{font-family:"Fraunces";font-weight:600;font-style:normal;src:url("file://${root}/social/fonts/fraunces-latin-600-normal.woff2")}
@font-face{font-family:"Fraunces";font-weight:800;font-style:normal;src:url("file://${root}/social/fonts/fraunces-latin-800-normal.woff2")}
@font-face{font-family:"Fraunces";font-weight:900;font-style:normal;src:url("file://${root}/social/fonts/fraunces-latin-900-normal.woff2")}
@font-face{font-family:"Fraunces";font-weight:700;font-style:italic;src:url("file://${root}/social/fonts/fraunces-latin-700-italic.woff2")}
@font-face{font-family:"Fraunces";font-weight:800;font-style:italic;src:url("file://${root}/social/fonts/fraunces-latin-800-italic.woff2")}
@font-face{font-family:"Fraunces";font-weight:900;font-style:italic;src:url("file://${root}/social/fonts/fraunces-latin-900-italic.woff2")}
@font-face{font-family:"Bricolage";font-weight:800;src:url("file://${root}/node_modules/@expo-google-fonts/bricolage-grotesque/800ExtraBold/BricolageGrotesque_800ExtraBold.ttf")}
@font-face{font-family:"DM";font-weight:700;src:url("file://${root}/node_modules/@expo-google-fonts/dm-sans/700Bold/DMSans_700Bold.ttf")}
:root{--ink:#24120A;--cream:#FFF6E6;--gold:#F6D88C;--red:#FF5A47;--yellow:#FFD23F}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#111;width:${W}px}
.post{position:relative;width:${W}px;height:${H}px;overflow:hidden;font-family:"Fraunces",serif;background:#000;margin-bottom:40px}
.ab{position:absolute}
.full{position:absolute;left:0;top:0;width:${W}px;height:${H}px}
.zz svg,.mas svg,.ic svg{width:100%;height:auto;display:block}
.glow{position:absolute;pointer-events:none;mix-blend-mode:screen}
.shade{position:absolute;pointer-events:none;mix-blend-mode:multiply}
.pill{display:inline-block;background:var(--yellow);color:var(--ink);border:6px solid var(--ink);border-radius:999px;padding:14px 32px;font:800 32px/1 "Bricolage";box-shadow:6px 7px 0 var(--ink);white-space:nowrap}
.foot{position:absolute;left:0;right:0;display:flex;justify-content:center;align-items:center;gap:28px}
.foot .wm{width:210px}
.kick{position:absolute;left:0;right:0;text-align:center;font:800 30px/1 "Bricolage";letter-spacing:.3em;color:var(--gold);text-shadow:0 3px 0 rgba(20,8,2,.9)}
.mono{font-family:"Liberation Mono",monospace}
`;

/** Footer: wordmark + coming soon pill. */
export const foot = (top = 1296) => `<div class="foot" style="top:${top}px"><div class="wm">${WM()}</div><span class="pill">COMING SOON TO iPHONE</span></div>`;
export const rr = (x: number, y: number, w: number, h: number, fill: string, rx = 0, sw = 8) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`;
export const mas = (mood: any, fries: number, style: string) => `<div class="ab mas" style="${style}">${M(mood, fries)}</div>`;

export type Post = { id: string; html: string; cel?: Record<string, number> };
