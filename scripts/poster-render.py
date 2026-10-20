#!/usr/bin/env python3
"""usage: poster-render.py poster.html OUTDIR  -> poster-A3.pdf, poster-A4.pdf, poster-preview.png (called by make-poster.ts)"""
import os, sys
from playwright.sync_api import sync_playwright

src, out = os.path.abspath(sys.argv[1]), sys.argv[2]
W, H = 1123, 1587  # A3 at 96 dpi
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--no-sandbox', '--allow-file-access-from-files'])
    pg = b.new_page(viewport=dict(width=W, height=H))
    pg.goto('file://' + src)
    pg.evaluate('document.fonts.ready')
    pg.wait_for_timeout(600)
    pg.screenshot(path=os.path.join(out, 'poster-preview.png'), clip=dict(x=0, y=0, width=W, height=H))
    # A3 = 297 x 420 mm. The page is laid out at A3 size, so the A4 copy is the same layout scaled to fit.
    pg.pdf(path=os.path.join(out, 'poster-A3.pdf'), width='297mm', height='420mm', print_background=True, prefer_css_page_size=False, scale=0.9996)
    pg.pdf(path=os.path.join(out, 'poster-A4.pdf'), width='210mm', height='297mm', print_background=True, prefer_css_page_size=False, scale=0.7071)
    b.close()
