#!/usr/bin/env python3
"""Render the Brokey teaser posts (1080x1440) from social/teasers/posts.html.
  python3 scripts/render-teasers.py all            -> social/teasers/<id>.png (final, faint grain)
  python3 scripts/render-teasers.py only t3-roast  -> one post
  python3 scripts/render-teasers.py sheet [out]    -> contact sheet + 3-wide profile-grid preview (newest top-left)
"""
import asyncio, io, json, sys
from pathlib import Path
import numpy as np
from PIL import Image
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
TD = ROOT / 'social' / 'teasers'
W, H = 1080, 1440

def finish(png: bytes, seed: int) -> Image.Image:
    a = np.asarray(Image.open(io.BytesIO(png)).convert('RGB')).astype(np.float32) / 255.0
    g = np.random.default_rng(seed).normal(0, 0.0, (a.shape[0], a.shape[1], 1)).astype(np.float32)  # flat vector look, no grain
    return Image.fromarray((np.clip(a + g, 0, 1) * 255).astype(np.uint8))

async def render(ids=None):
    posts = json.loads((TD / 'posts.json').read_text())
    made = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=1)
        await pg.goto('file://' + str(TD / 'posts.html'))
        await pg.evaluate('document.fonts.ready'); await pg.wait_for_timeout(700)
        for i, po in enumerate(posts):
            if ids and po['id'] not in ids: continue
            png = await pg.locator('#' + po['id']).screenshot(type='png')
            im = finish(png, i + 1)
            f = TD / f"{po['id']}.png"; im.save(f); made.append(f); print('wrote', f.name, im.size)
        await b.close()
    return made

def sheet(out):
    posts = json.loads((TD / 'posts.json').read_text())
    ims = [Image.open(TD / f"{p['id']}.png").convert('RGB') for p in posts if (TD / f"{p['id']}.png").exists()]
    cols = 4; tw, th = 360, 480
    rows = (len(ims) + cols - 1) // cols
    sh = Image.new('RGB', (cols * (tw + 10) + 10, rows * (th + 10) + 10), (20, 14, 30))
    for i, im in enumerate(ims): sh.paste(im.resize((tw, th), Image.LANCZOS), (10 + (i % cols) * (tw + 10), 10 + (i // cols) * (th + 10)))
    sh.save(out); print('wrote', out)
    # grid as it will look on the profile: newest first, left to right, 3 across
    rev = list(reversed(ims)); gw, gh = 300, 400
    r2 = (len(rev) + 2) // 3
    g = Image.new('RGB', (3 * gw + 8, r2 * gh + (r2 - 1) * 4), (255, 255, 255))
    for i, im in enumerate(rev): g.paste(im.resize((gw, gh), Image.LANCZOS), ((i % 3) * (gw + 4), (i // 3) * (gh + 4)))
    gp = Path(out).with_name('grid-preview.png'); g.save(gp); print('wrote', gp)

if __name__ == '__main__':
    a = sys.argv[1:]
    if a[0] == 'all': asyncio.run(render())
    elif a[0] == 'only': asyncio.run(render(set(a[1:])))
    elif a[0] == 'sheet': sheet(a[1] if len(a) > 1 else str(TD / 'sheet.png'))
