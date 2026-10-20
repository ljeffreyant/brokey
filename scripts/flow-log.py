#!/usr/bin/env python3
import json, sys, time
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from playwright.sync_api import sync_playwright
import importlib.util
spec = importlib.util.spec_from_file_location('shoot', __file__.rsplit('/', 1)[0] + '/shoot.py')

NOW = int(time.time() * 1000)
def seed(theme='garlic'):
    D = 86400000
    st = dict(settings=dict(onboarded=True, startedTs=NOW - 20 * D, unit=dict(id='hsp', singular='HSP', plural='HSPs', priceCents=1800), hourlyCents=2800, roastLevel='medium', bodyRoasts=False, weekStartsOn=1, goalName='', language='en', currency='AUD', showCents=False, roundSummaries=False, theme=theme, activeWalletId='main', notifyWish=True, notifyWeekly=False, adultConfirmed=False),
              wallets=[dict(id='main', name='Main', icon='hsp', color='#FFD23F', income=[], recurring=[], savingsWeeklyCents=0, budgetMode='manual', manualWeeklyCents=15000, createdTs=NOW - 20 * D)],
              purchases=[], wishes=[], shame=[], customCats=[], hiddenCats=[], recentRoasts=[], seenStickers=[])
    return json.dumps(dict(state=st, version=1))

theme = sys.argv[1] if len(sys.argv) > 1 else 'garlic'
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--no-sandbox'])
    ctx = b.new_context(viewport=dict(width=390, height=844), device_scale_factor=2, is_mobile=True, has_touch=True)
    ctx.add_init_script(f"if(!localStorage.getItem('__s')){{localStorage.setItem('brokey-v1', {json.dumps(seed(theme))});localStorage.setItem('__s','1');}}")
    page = ctx.new_page()
    logs = []
    page.on('console', lambda m: logs.append(f'{m.type}: {m.text}') if m.type in ('error',) else None)
    page.on('pageerror', lambda e: logs.append(f'pageerror: {e}'))
    page.goto('http://127.0.0.1:8099/log')
    page.wait_for_timeout(2000)
    page.screenshot(path='shots/log-1-what.png')
    page.get_by_text('HSP', exact=True).first.click()
    page.wait_for_timeout(1200)
    page.screenshot(path='shots/log-2-how.png')
    for k in ['1', '8']:
        page.get_by_role('button', name=k, exact=True).first.click(); page.wait_for_timeout(120)
    page.wait_for_timeout(500)
    page.screenshot(path='shots/log-3-typed.png')
    page.get_by_role('button', name='Feed Brokey').click()
    for i, ms in enumerate([500, 400, 400, 500, 700, 1200, 1800]):
        page.wait_for_timeout(ms)
        page.screenshot(path=f'shots/log-4-eat{i}.png')
    for l in logs[:10]: print(l)
    b.close()
