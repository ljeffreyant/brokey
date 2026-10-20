#!/usr/bin/env python3
"""usage: html-to-pdf.py IN.html OUT.pdf  (A4 in CSS px, like the print engine on a phone)"""
import sys
from playwright.sync_api import sync_playwright
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--no-sandbox'])
    pg = b.new_page()
    pg.goto('file://' + __import__('os').path.abspath(sys.argv[1]))
    pg.wait_for_timeout(300)
    pg.pdf(path=sys.argv[2], width='595px', height='842px', print_background=True, prefer_css_page_size=True)
    b.close()
