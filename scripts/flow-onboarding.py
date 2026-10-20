#!/usr/bin/env python3
"""Walk the four onboarding steps on the web build, screenshotting each one."""
import sys
from playwright.sync_api import sync_playwright

W = int(sys.argv[1]) if len(sys.argv) > 1 else 390
Hh = int(sys.argv[2]) if len(sys.argv) > 2 else 844
OUT = sys.argv[3] if len(sys.argv) > 3 else 'shots'
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--no-sandbox'])
    ctx = b.new_context(viewport=dict(width=W, height=Hh), device_scale_factor=2, is_mobile=True, has_touch=True)
    page = ctx.new_page()
    logs = []
    page.on('console', lambda m: logs.append(f'{m.type}: {m.text}') if m.type == 'error' else None)
    page.on('pageerror', lambda e: logs.append(f'pageerror: {e}'))
    page.goto('http://127.0.0.1:8099/')
    page.wait_for_timeout(2200)
    page.screenshot(path=f'{OUT}/ob-0-welcome.png')
    page.get_by_role('button', name='Let us go').click(); page.wait_for_timeout(1000)
    page.screenshot(path=f'{OUT}/ob-1-money.png')
    page.get_by_role('button', name='Next', exact=True).click(); page.wait_for_timeout(1000)
    page.screenshot(path=f'{OUT}/ob-2-budget.png')
    page.get_by_role('button', name='Next', exact=True).click(); page.wait_for_timeout(1000)
    page.screenshot(path=f'{OUT}/ob-3-roast.png')
    page.get_by_text('Unhinged', exact=True).first.click(); page.wait_for_timeout(900)
    page.screenshot(path=f'{OUT}/ob-3b-gate.png')
    page.get_by_role('button', name='I am 18 or older').click(); page.wait_for_timeout(700)
    page.get_by_role('button', name='Open Brokey').click(); page.wait_for_timeout(1800)
    page.screenshot(path=f'{OUT}/ob-4-home.png')
    for l in logs[:10]: print(l)
    b.close()
