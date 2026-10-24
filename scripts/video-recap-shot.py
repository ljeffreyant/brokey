"""Exports the real Week share card (1080x1920) from the web build, for the launch video.
   python3 scripts/video-recap-shot.py video/shots/recap.png   (needs the web build served on :8099)"""
import json, os, sys
from playwright.sync_api import sync_playwright
src = open(os.path.join(os.path.dirname(__file__), 'shoot.py')).read().split('def main')[0]
ns = {}; exec(src, ns)
out = sys.argv[1]
st = ns['state']('store', 'garlic', 'en')
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--no-sandbox'])
    ctx = b.new_context(viewport=dict(width=440, height=956), device_scale_factor=3, is_mobile=True, has_touch=True, accept_downloads=True)
    ctx.add_init_script(f"if(!localStorage.getItem('__s')){{localStorage.setItem('brokey-v1', {json.dumps(json.dumps(st))});localStorage.setItem('__s','1');}}")
    page = ctx.new_page()
    page.goto('http://127.0.0.1:8099/recap'); page.wait_for_timeout(2500)
    with page.expect_download(timeout=30000) as d:
        page.get_by_text('Share my week').first.click()
    d.value.save_as(out)
    b.close()
print('saved', out)
