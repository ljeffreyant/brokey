#!/usr/bin/env python3
"""Screenshot the web build in a phone-sized viewport with seeded data.

usage: shoot.py OUT.png ROUTE [--seed fresh|mid|broke|over] [--theme garlic|bbq|kebab|system] [--lang en] [--w 390 --h 844]
       [--click "text"]... [--wait ms] [--full]
"""
import argparse, json, sys, time
from playwright.sync_api import sync_playwright

NOW = int(time.time() * 1000)
H = 3600 * 1000
D = 24 * H

def purchase(i, hours_ago, cents, cat, merchant=None, method='tap', roast='', regret=None):
    p = dict(id=f'p{i}', walletId='main', ts=NOW - int(hours_ago * H), amountCents=cents, category=cat, method=method, roast=roast, source='manual')
    if merchant: p['merchant'] = merchant
    if regret: p['regret'] = regret; p['regretTs'] = NOW
    return p

def state(seed, theme, lang, mode='hsp'):
    settings = dict(onboarded=True, startedTs=NOW - 20 * D, unit=dict(id='hsp', singular='HSP', plural='HSPs', priceCents=1800), hourlyCents=2800, unitMode=mode, shiftHours=6,
                    roastLevel='medium', bodyRoasts=False, weekStartsOn=1, goalName='', language=lang, currency='AUD', showCents=False,
                    roundSummaries=False, theme=theme, activeWalletId='main', notifyWish=True, notifyWeekly=False, adultConfirmed=False)
    wallet = dict(id='main', name='Main', icon='hsp', color='#FFD23F', income=[], recurring=[], savingsWeeklyCents=0, budgetMode='manual', manualWeeklyCents=15000, createdTs=NOW - 20 * D)
    ps = []
    wishes = []
    shame = []
    if seed in ('mid', 'broke', 'over', 'subs'):
        ps = [
            purchase(1, 1.2, 650, 'coffee', 'Corner Cafe', 'tap', 'A flat white. Bold of you to call it a personality.'),
            purchase(2, 5, 1800, 'takeaway', 'Halal Bros', 'card', 'An actual HSP. Respect, and also: wow.', regret='worth'),
            purchase(3, 20, 4200, 'nightout', None, 'tap', 'A night out. Your liver sends its regards.', regret='nah'),
            purchase(4, 30, 2999, 'streaming', 'Streamflix', 'card', 'Another sub you will forget about.', regret='meh'),
            purchase(5, 52, 8900, 'clothes', 'Thrift Haul', 'card', 'New jacket. The old jacket is also fine.'),
        ]
    if seed == 'store':
        # a healthy, good-looking week for the App Store screenshots
        wallet['manualWeeklyCents'] = 22000
        ps = [
            purchase(1, 1.3, 650, 'coffee', 'Corner Cafe', 'tap', 'A flat white. Bold of you to call it a personality.'),
            purchase(2, 7, 1800, 'takeaway', 'Halal Bros', 'card', 'An actual HSP. Respect, and also: wow.', regret='worth'),
            purchase(3, 16, 1450, 'dineout', 'Uni Canteen', 'tap', 'Lunch again. At least it was not delivery.'),
            purchase(4, 27, 2200, 'transit', 'Myki top up', 'card', 'Public transport. Responsible, annoyingly.'),
        ]
        wishes = [dict(id='w1', walletId='main', label='Noise-cancelling headphones', amountCents=24900, category='headphones', createdTs=NOW - 10 * H, unlockTs=NOW + 38 * H, status='cooling'),
                  dict(id='w2', walletId='main', label='Sneakers', amountCents=17900, category='clothes', createdTs=NOW - 30 * H, unlockTs=NOW + 18 * H, status='cooling')]
        shame = [dict(id='s1', ts=NOW - 3 * D, label='Air fryer', amountCents=12900, category='homewares', source='manual', story='Used it twice.')]
    if seed == 'subs':
        ps += [purchase(10, 31 * 24 + 3, 1699, 'music', 'Tunebox', 'card'), purchase(11, 2, 1699, 'music', 'Tunebox', 'card'),
               purchase(12, 60 * 24, 5500, 'health', 'Fit Gym Co', 'card'), purchase(13, 30 * 24, 5500, 'health', 'Fit Gym Co', 'card'), purchase(14, 0.5 * 24, 5500, 'health', 'Fit Gym Co', 'card')]
    if seed == 'broke':
        ps.append(purchase(6, 2, 9000, 'tech', 'Gadget Hut', 'card', 'Tech. The spreadsheet is crying.'))
    if seed == 'over':
        ps.append(purchase(6, 2, 19000, 'tech', 'Gadget Hut', 'card', 'Tech.'))
    if seed in ('mid', 'broke', 'subs'):
        wishes = [dict(id='w1', walletId='main', label='Noise-cancelling headphones', amountCents=24900, category='headphones', createdTs=NOW - 10 * H, unlockTs=NOW + 38 * H, status='cooling')]
    if seed in ('mid', 'broke', 'subs'):
        shame = [dict(id='s1', ts=NOW - 3 * D, label='Air fryer', amountCents=12900, category='homewares', source='manual', story='Used it twice.')]
    return dict(state=dict(settings=settings, wallets=[wallet], purchases=ps, wishes=wishes, shame=shame, customCats=[], hiddenCats=[], recentRoasts=[], seenStickers=[]), version=1)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out'); ap.add_argument('route')
    ap.add_argument('--seed', default='mid'); ap.add_argument('--theme', default='garlic'); ap.add_argument('--lang', default='en')
    ap.add_argument('--w', type=int, default=390); ap.add_argument('--h', type=int, default=844)
    ap.add_argument('--click', action='append', default=[]); ap.add_argument('--wait', type=int, default=1800)
    ap.add_argument('--full', action='store_true'); ap.add_argument('--scale', type=float, default=2)
    ap.add_argument('--port', type=int, default=8099); ap.add_argument('--scroll', type=int, default=0); ap.add_argument('--mode', default='hsp')
    a = ap.parse_args()
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--no-sandbox'])
        ctx = b.new_context(viewport=dict(width=a.w, height=a.h), device_scale_factor=a.scale, is_mobile=True, has_touch=True)
        if a.seed != 'fresh':
            ctx.add_init_script(f"if(!localStorage.getItem('__seeded')){{localStorage.setItem('brokey-v1', {json.dumps(json.dumps(state(a.seed, a.theme, a.lang, a.mode)))});localStorage.setItem('__seeded','1');}}")
        page = ctx.new_page()
        logs = []
        page.on('console', lambda m: logs.append(f'{m.type}: {m.text}') if m.type in ('error', 'warning') else None)
        page.on('pageerror', lambda e: logs.append(f'pageerror: {e}'))
        page.goto(f'http://127.0.0.1:{a.port}{a.route}')
        page.wait_for_timeout(a.wait)
        for c in a.click:
            page.get_by_text(c, exact=False).first.click()
            page.wait_for_timeout(700)
        if a.scroll:
            page.evaluate("(y)=>{const els=[...document.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+40&&getComputedStyle(e).overflowY!=='visible'&&getComputedStyle(e).overflowY!=='hidden');const e=els.sort((x,y)=>y.scrollHeight-x.scrollHeight)[0];if(e)e.scrollTop=y;}", a.scroll)
            page.wait_for_timeout(900)
        page.screenshot(path=a.out, full_page=a.full)
        for l in logs[:12]: print(l)
        b.close()

main()
