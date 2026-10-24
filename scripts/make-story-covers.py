#!/usr/bin/env python3
"""Reel covers for the Broke Apocalypse story (1080x1920, title block inside the 3:4 profile-grid crop and the 4:5 feed crop).
  python3 scripts/make-story-covers.py            -> social/story/covers/cover-p1.png .. p3.png (+ grid preview)
Each cover = a cel-look frame from the part + big "PART n" title. Upload as the reel cover (Edit cover > Add from camera roll).
"""
import asyncio, io, sys, base64
from pathlib import Path
from PIL import Image
from playwright.async_api import async_playwright
sys.path.insert(0, str(Path(__file__).resolve().parent))
import cel

ROOT = Path(__file__).resolve().parent.parent
SD = ROOT / 'social' / 'story'
FONT = ROOT / 'social' / 'fonts'
W, H = 1080, 1920

COVERS = [
    # part, frame time, part label, subtitle, kicker
    ('p1', 4.6, 'PART 1', 'THE FREE TRIAL', 'THE BROKE APOCALYPSE'),
    ('p2', 71.0, 'PART 2', 'THE FRIDGE', 'THE BROKE APOCALYPSE'),
    ('p3', 82.5, 'PART 3', 'THE ROAST', 'THE BROKE APOCALYPSE'),
]

def look(png, seed=7):
    im = __import__('numpy').asarray(Image.open(io.BytesIO(png)).convert('RGB'))
    return Image.fromarray(cel.cel(im, seed=seed, bloom=0.25, vignette=0.28, split=2, thresh=0.42))

def page(bg_b64, part, sub, kicker):
    f = lambda w, s='normal': base64.b64encode((FONT / f'fraunces-latin-{w}-{s}.woff2').read_bytes()).decode()
    return f'''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:F;font-weight:900;src:url(data:font/woff2;base64,{f(900)}) format("woff2")}}
@font-face{{font-family:F;font-weight:800;font-style:italic;src:url(data:font/woff2;base64,{f(800, "italic")}) format("woff2")}}
html,body{{margin:0;width:{W}px;height:{H}px;background:#14091f;overflow:hidden}}
#bg{{position:absolute;inset:0;background:url(data:image/png;base64,{bg_b64}) center/cover}}
#band{{position:absolute;left:0;right:0;top:560px;height:760px;background:linear-gradient(180deg,rgba(12,6,24,0) 0,rgba(12,6,24,.62) 22%,rgba(12,6,24,.62) 78%,rgba(12,6,24,0) 100%)}}
#t{{position:absolute;left:0;right:0;top:640px;text-align:center;font-family:F}}
#k{{font-weight:900;font-size:40px;letter-spacing:.42em;color:#F6D88C;margin-left:.42em}}
#p{{font-weight:900;font-size:236px;line-height:1;margin-top:24px;white-space:nowrap;color:#FFF6E6;text-shadow:0 10px 0 #24120A,0 0 40px rgba(0,0,0,.6);-webkit-text-stroke:6px #24120A;paint-order:stroke fill}}
#s{{font-weight:800;font-style:italic;font-size:84px;margin-top:10px;color:#FFD23F;text-shadow:0 5px 0 #24120A}}
#b{{position:absolute;left:0;right:0;top:1260px;text-align:center;font-family:F;font-weight:900;font-size:40px;letter-spacing:.2em;color:#FFF6E6;text-shadow:0 3px 0 #24120A}}
</style></head><body><div id="bg"></div><div id="band"></div>
<div id="t"><div id="k">{kicker}</div><div id="p">{part}</div><div id="s">{sub.title()}</div></div>
</body></html>'''

async def main():
    out = SD / 'covers'; out.mkdir(exist_ok=True)
    made = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for part, t, label, sub, kicker in COVERS:
            pg = await b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=1)
            await pg.goto('file://' + str(SD / f'{part}.html'))
            await pg.evaluate('document.fonts.ready'); await pg.wait_for_timeout(500)
            await pg.evaluate(f'seek({t})')
            # hide HUD/caption so the cover is clean
            await pg.add_style_tag(content='#cap,#capshade,#label,#fries{display:none!important}')
            bg = look(await pg.screenshot(type='png'))
            buf = io.BytesIO(); bg.save(buf, 'PNG')
            await pg.close()
            pg2 = await b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=1)
            await pg2.set_content(page(base64.b64encode(buf.getvalue()).decode(), label, sub, kicker))
            await pg2.evaluate('document.fonts.ready'); await pg2.wait_for_timeout(400)
            f = out / f'cover-{part}.png'
            await pg2.screenshot(path=str(f), type='png')
            await pg2.close(); made.append(f); print('wrote', f)
        await b.close()
    # grid preview: how the 3 covers sit in the 3:4 profile grid
    tiles = [Image.open(f).crop((0, 240, W, 1680)).resize((360, 480), Image.LANCZOS) for f in made]
    g = Image.new('RGB', (360 * len(tiles) + 8 * (len(tiles) - 1), 480), (10, 6, 20))
    for i, im in enumerate(tiles): g.paste(im, (i * 368, 0))
    g.save(out / 'grid-preview.png'); print('wrote', out / 'grid-preview.png')

asyncio.run(main())
