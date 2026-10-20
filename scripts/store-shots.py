"""App Store screenshots: raw 1320x2868 PNGs (iPhone 6.9 inch) of the real UI from the web build.
   npx expo export --platform web && python3 scripts/serve.py 8099 &   then   python3 scripts/store-shots.py store/raw
"""
import json, sys, os, types
from playwright.sync_api import sync_playwright

src = open(os.path.join(os.path.dirname(__file__), 'shoot.py')).read().split('def main')[0]
ns = {}; exec(src, ns)
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = 8099
W, H, SCALE = 440, 956, 3  # 1320 x 2868

def shot(name, route, mode='hsp', theme='garlic', lang='en', actions=None, wait=2200):
    st = ns['state']('store', theme, lang, mode)
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--no-sandbox'])
        ctx = b.new_context(viewport=dict(width=W, height=H), device_scale_factor=SCALE, is_mobile=True, has_touch=True)
        ctx.add_init_script(f"if(!localStorage.getItem('__s')){{localStorage.setItem('brokey-v1', {json.dumps(json.dumps(st))});localStorage.setItem('__s','1');}}")
        page = ctx.new_page()
        errs = []
        page.on('pageerror', lambda e: errs.append(str(e)))
        page.goto(f'http://127.0.0.1:{PORT}{route}'); page.wait_for_timeout(wait)
        if actions: actions(page)
        page.screenshot(path=f'{OUT}/{name}.png')
        b.close()
        print(name, 'ok', errs[:2])

def eat(page):
    page.get_by_text('Same again').first.click()
    page.wait_for_timeout(5400)

shot('1-home', '/home')
shot('2-roast', '/log', actions=eat)
shot('3-chill', '/cooling')
shot('4-week', '/week')
shot('5-receipt', '/receipt', wait=3200)
shot('6-hours-of-work', '/home', mode='work')
