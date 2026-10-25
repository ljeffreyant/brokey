#!/usr/bin/env python3
"""One-page system sheet for the teaser campaign (the "why", for the person approving it, not for posting).
  python3 scripts/make-teaser-system.py   -> social/teasers/SYSTEM.png  (run render-teasers.py all first)
"""
import asyncio, json, base64
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
TD = ROOT / 'social' / 'teasers'
posts = json.loads((TD / 'posts.json').read_text())
b64 = lambda f: 'data:image/png;base64,' + base64.b64encode((TD / f).read_bytes()).decode()
img = {p['id']: b64(p['id'] + '.png') for p in posts}
grid = list(reversed(posts))  # newest first, as the profile shows it
S = 600 / 1080  # anatomy scale
def mark(n, x, y): return f'<i class="tk" style="top:{y*S-1:.0f}px"></i><i class="m" style="left:624px;top:{y*S-14:.0f}px">{n}</i>'
anat = ''.join([mark(1, 540, 118), mark(2, 540, 176), mark(3, 540, 229), mark(4, 400, 500), mark(5, 540, 830), mark(6, 660, 1090), mark(7, 540, 1268)])
FONT = lambda n, p: f'@font-face{{font-family:"{n}";font-weight:800;src:url("file://{ROOT}/node_modules/@expo-google-fonts/{p}")}}'
html = f'''<!doctype html><html><head><meta charset="utf-8"><style>
{FONT("Bricolage", "bricolage-grotesque/800ExtraBold/BricolageGrotesque_800ExtraBold.ttf")}
@font-face{{font-family:"DM";font-weight:700;src:url("file://{ROOT}/node_modules/@expo-google-fonts/dm-sans/700Bold/DMSans_700Bold.ttf")}}
@font-face{{font-family:"Fraunces";font-weight:900;font-style:italic;src:url("file://{ROOT}/social/fonts/fraunces-latin-900-italic.woff2")}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{width:1920px;height:1180px;background:#F4EEE2;color:#24120A;font-family:"DM";font-weight:700;position:relative;overflow:hidden}}
.bri{{font-family:"Bricolage";font-weight:800}}
.k{{font-size:15px;letter-spacing:.18em;text-transform:uppercase;opacity:.6}}
h1{{font-family:"Bricolage";font-weight:800;font-size:60px;line-height:1;letter-spacing:-.02em}}
.t{{position:absolute;width:196px;height:261px}}.t img{{width:100%;height:100%;display:block}}
.col{{position:absolute}}
.an{{position:absolute;left:730px;top:150px;width:600px;height:800px}}
.an .p{{position:absolute;inset:0;outline:3px solid #24120A}}
.an img{{width:100%;height:100%;display:block}}
.tk{{position:absolute;left:560px;width:62px;height:2px;background:#EF3B2D;display:block}}
.m{{position:absolute;width:28px;height:28px;border-radius:50%;background:#EF3B2D;color:#fff;font:800 15px/28px Bricolage;font-style:normal;text-align:center;}}
.lg{{position:absolute;left:1420px;top:150px;width:440px}}
.lg div{{display:flex;gap:14px;margin-bottom:17px;font-size:16.5px;line-height:1.35;font-weight:700}}
.lg b{{flex:none;width:26px;height:26px;border-radius:50%;background:#EF3B2D;color:#fff;font:800 14px/26px Bricolage;text-align:center}}
.lg span{{opacity:.82}} .lg strong{{opacity:1;font-family:"Bricolage";font-weight:800;font-size:19px;display:block}}
.sw{{display:flex;gap:14px;align-items:center;margin-bottom:12px;font-size:15px}}
.sw i{{width:60px;height:60px;border-radius:12px;display:block;border:2px solid #24120A}}
</style></head><body>
<div class="col" style="left:60px;top:48px"><div class="k">Brokey teaser campaign</div><h1 style="margin-top:12px">One question,<br>six answers.</h1></div>
<div class="col k" style="left:60px;top:218px">Profile grid, as it will look (newest top left)</div>
<div style="position:absolute;left:60px;top:248px">
{''.join(f'<div class="t" style="left:{(i%3)*204}px;top:{(i//3)*265}px"><img src="{img[p["id"]]}"></div>' for i, p in enumerate(grid))}
</div>
<div class="col" style="left:60px;top:800px;width:620px">
<div class="k" style="margin-bottom:14px">Colour: two, alternating tile to tile</div>
<div class="sw"><i style="background:#FFD23F"></i><i style="background:#24120A"></i><span>Yellow #FFD23F and ink #24120A. Odd posts yellow, even posts ink, so the grid is a checkerboard.</span></div>
<div class="k" style="margin:22px 0 10px">Type: three roles, never mixed</div>
<div class="bri" style="font-size:30px;letter-spacing:-.01em">Bricolage 800 <span style="font:700 15px DM;opacity:.7">facts: numbers, labels, headlines</span></div>
<div style="font:italic 900 30px Fraunces;margin-top:6px">Fraunces italic <span style="font:700 15px DM;opacity:.7">Brokey's voice only (quotes)</span></div>
<div style="font-size:19px;margin-top:8px;letter-spacing:.14em">DM SANS 700 <span style="font-size:15px;opacity:.7;letter-spacing:0">tiny tracked captions</span></div>
</div>
<div class="col k" style="left:730px;top:118px">Anatomy (every element sits at a fixed coordinate)</div>
<div class="an"><div class="p"><img src="{img[posts[2]['id']]}"></div>{anat}</div>
<div class="lg">
<div><b>1</b><span><strong>Header</strong>Name left, counter right (01 / 06). Same place every post.</span></div>
<div><b>2</b><span><strong>Two rules, edge to edge</strong>y 176 and y 1176. They run into the neighbouring tiles, so the grid reads as one ledger. Brokey stands on the lower one.</span></div>
<div><b>3</b><span><strong>Eyebrow</strong>What it is, and the dollar price. The dollar price is struck out, because the real price is in packs.</span></div>
<div><b>4</b><span><strong>Hero number</strong>540px, same size every post. 1, 2.1, 9.9, 14: the numbers climb, then 3 fries left.</span></div>
<div><b>5</b><span><strong>Unit chart</strong>One pack per HSP, ten to a row, fractions clipped. Fries use the same grammar.</span></div>
<div><b>6</b><span><strong>Brokey says</strong>A real line from the app, in the only serif on the page.</span></div>
<div><b>7</b><span><strong>Footer</strong>Same line, same pill, every post.</span></div>
</div>
<div class="col" style="left:1420px;top:1010px;width:440px;font-size:15.5px;line-height:1.4;opacity:.85">All numbers and quotes are from the app: 9.9 and 14 are the Chill screen, 3 of 9 fries is the weekly meter, the tram line is a real roast. Post 1 to 6 in order, one a day.</div>
</body></html>'''
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 1920, 'height': 1180})
        (TD / 'system.html').write_text(html); await pg.goto('file://' + str(TD / 'system.html')); await pg.evaluate('document.fonts.ready'); await pg.wait_for_timeout(700)
        await pg.screenshot(path=str(TD / 'SYSTEM.png')); await b.close(); print('wrote', TD / 'SYSTEM.png')
asyncio.run(main())
