#!/usr/bin/env python3
"""Render the teaser mural panoramas, give them the printed finish, cut into 1080x1440 posts.
  python3 scripts/render-mural.py outside|inside|all
Outside row (left to right): t3-tram, t2-board, t1-shop.  Inside row: t6-app, t5-fries, t4-fridge.
"""
import asyncio, io, sys
from pathlib import Path
import numpy as np
from PIL import Image
from playwright.async_api import async_playwright
sys.path.insert(0, str(Path(__file__).resolve().parent))
import cel

ROOT = Path(__file__).resolve().parent.parent
TD = ROOT / 'social' / 'teasers'
MW, MH = 3240, 1440
TILES = {'outside': ['t3-tram', 't2-board', 't1-shop'], 'inside': ['t6-app', 't5-fries', 't4-fridge']}

def finish(png: bytes, seed: int) -> Image.Image:
    im = np.asarray(Image.open(io.BytesIO(png)).convert('RGB'))
    return Image.fromarray(cel.cel(im, s=9.0, strength=0.5, grain=0.03, bloom=0.22, seed=seed, split=1, thresh=0.40))

async def run(names):
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for n in names:
            pg = await b.new_page(viewport={'width': MW, 'height': MH}, device_scale_factor=1)
            await pg.goto('file://' + str(TD / f'mural-{n}.html'))
            await pg.evaluate('document.fonts.ready'); await pg.wait_for_timeout(900)
            png = await pg.screenshot(type='png')
            await pg.close()
            im = finish(png, 3 if n == 'outside' else 5)
            im.save(TD / f'mural-{n}.png')
            for i, name in enumerate(TILES[n]):
                im.crop((i * 1080, 0, (i + 1) * 1080, MH)).save(TD / f'{name}.png'); print('wrote', name)
        await b.close()

if __name__ == '__main__':
    a = sys.argv[1] if len(sys.argv) > 1 else 'all'
    asyncio.run(run(['outside', 'inside'] if a == 'all' else [a]))
