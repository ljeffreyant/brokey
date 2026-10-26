"""Render every .phone in social/mockups/<dir>.html to PNG, plus a side-by-side sheet.
usage: python3 scripts/mockups/render.py a-opshop [b-wheatpaste ...]"""
import sys, os
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'social', 'mockups'))
names = sys.argv[1:] or sorted(f[:-5] for f in os.listdir(ROOT) if f.endswith('.html') and f[0] in 'abcdefgh' and f[1] == '-')
os.makedirs(f'{ROOT}/png', exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch()
    for n in names:
        pg = b.new_page(viewport={'width': 3000, 'height': 1000}, device_scale_factor=2)
        pg.goto(f'file://{ROOT}/{n}.html')
        pg.wait_for_timeout(600)
        pg.evaluate('document.fonts.ready')
        phones = pg.query_selector_all('.phone')
        files = []
        for ph in phones:
            s = ph.get_attribute('data-screen')
            f = f'{ROOT}/png/{n}-{s}.png'
            ph.screenshot(path=f, omit_background=True)
            files.append(f)
        ims = [Image.open(f).convert('RGBA') for f in files]
        sc = 0.5
        w = int(ims[0].width * sc); h = int(ims[0].height * sc)
        sheet = Image.new('RGB', (len(ims) * (w + 24) + 24, h + 48), (16, 16, 17))
        for i, im in enumerate(ims):
            t = im.resize((w, h), Image.LANCZOS)
            sheet.paste(t, (24 + i * (w + 24), 24), t)
        sheet.save(f'{ROOT}/png/{n}-sheet.png')
        print(n, len(files), 'screens')
        pg.close()
    b.close()
