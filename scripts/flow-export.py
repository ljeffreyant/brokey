#!/usr/bin/env python3
"""Drives the web build: opens Export, taps Spreadsheet and PDF report, checks what came out."""
import json, sys, importlib.util
from playwright.sync_api import sync_playwright
spec = importlib.util.spec_from_file_location('shoot', __file__.replace('flow-export', 'shoot'))
src = open(spec.origin).read().replace('\nmain()\n', '\n')  # reuse the seed builder without running main
ns = {}; exec(compile(src, 'shoot', 'exec'), ns)
out = sys.argv[1] if len(sys.argv) > 1 else '/tmp'
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--no-sandbox'])
    ctx = b.new_context(viewport=dict(width=390, height=844), device_scale_factor=2, is_mobile=True, has_touch=True, accept_downloads=True)
    ctx.add_init_script("if(!localStorage.getItem('__seeded')){localStorage.setItem('brokey-v1', %s);localStorage.setItem('__seeded','1');}" % json.dumps(json.dumps(ns['state']('mid', 'garlic', 'en'))))
    page = ctx.new_page()
    errs = []
    page.on('pageerror', lambda e: errs.append(str(e)))
    page.goto('http://127.0.0.1:8099/export'); page.wait_for_timeout(2500)
    with page.expect_download(timeout=15000) as dl:
        page.get_by_text('Spreadsheet', exact=True).first.click()
    d = dl.value; path = f'{out}/app-export.xlsx'; d.save_as(path)
    print('xlsx saved:', d.suggested_filename)
    page.wait_for_timeout(600)
    page.screenshot(path=f'{out}/after-xlsx.png')
    with ctx.expect_page(timeout=15000) as pp:
        page.get_by_text('PDF report', exact=True).first.click()
    pop = pp.value; pop.wait_for_timeout(800)
    pop.add_style_tag(content='@page{size:595px 842px;margin:0}')
    pop.pdf(path=f'{out}/app-export.pdf', width='595px', height='842px', print_background=True)
    print('pdf popup title:', pop.title())
    print('errors:', errs)
    b.close()
