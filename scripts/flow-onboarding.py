#!/usr/bin/env python3
"""Walk the onboarding on the web build, screenshotting each step."""
import sys
from playwright.sync_api import sync_playwright

W = int(sys.argv[1]) if len(sys.argv) > 1 else 390
Hh = int(sys.argv[2]) if len(sys.argv) > 2 else 844
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--no-sandbox'])
    ctx = b.new_context(viewport=dict(width=W, height=Hh), device_scale_factor=2, is_mobile=True, has_touch=True)
    page = ctx.new_page()
    logs = []
    page.on('console', lambda m: logs.append(f'{m.type}: {m.text}') if m.type == 'error' else None)
    page.on('pageerror', lambda e: logs.append(f'pageerror: {e}'))
    page.goto('http://127.0.0.1:8099/')
    page.wait_for_timeout(2200)
    page.screenshot(path='shots/ob-0-welcome.png')
    page.get_by_role('button', name='Let us go').click(); page.wait_for_timeout(1000)
    page.get_by_role('button', name='3AM Kebab Shop').click(); page.wait_for_timeout(700)
    page.screenshot(path='shots/ob-1-vibe.png')
    page.get_by_role('button', name='Next', exact=True).click(); page.wait_for_timeout(1000)
    page.screenshot(path='shots/ob-2-money.png')
    page.get_by_role('button', name='Next', exact=True).click(); page.wait_for_timeout(1000)
    page.screenshot(path='shots/ob-3-budget.png')
    page.get_by_role('button', name='Next', exact=True).click(); page.wait_for_timeout(1000)
    page.screenshot(path='shots/ob-4-roast.png')
    page.get_by_text('Unhinged', exact=True).first.click(); page.wait_for_timeout(900)
    page.screenshot(path='shots/ob-4b-gate.png')
    page.get_by_role('button', name='I am 18 or older').click(); page.wait_for_timeout(700)
    page.screenshot(path='shots/ob-4c-unhinged.png')
    page.get_by_role('button', name='Next', exact=True).click(); page.wait_for_timeout(1000)
    page.screenshot(path='shots/ob-5-nudge.png')
    page.get_by_role('button', name='Continue').click(); page.wait_for_timeout(900)
    page.screenshot(path='shots/ob-5b-denied.png')
    page.get_by_role('button', name='Continue').click(); page.wait_for_timeout(1000)
    page.screenshot(path='shots/ob-6-done.png')
    page.get_by_role('button', name='Open Brokey').click(); page.wait_for_timeout(1800)
    page.screenshot(path='shots/ob-7-home.png')
    for l in logs[:10]: print(l)
    b.close()
