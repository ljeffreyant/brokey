"""Splash and Android adaptive icon from the in-app mascot pose. usage: python3 scripts/mascot3d/appicons.py [pose]"""
import os, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
pose = sys.argv[1] if len(sys.argv) > 1 else 'wave-happy'
mascot = Image.open(f'{ROOT}/assets/brokey/{pose}.webp').convert('RGBA')
FONT = f'{ROOT}/node_modules/@expo-google-fonts/bricolage-grotesque/800ExtraBold/BricolageGrotesque_800ExtraBold.ttf'

def fit(im, h):
    return im.resize((round(im.width * h / im.height), h), Image.LANCZOS)

def shadow(canvas, box, blur=14, alpha=90):
    """a soft ground shadow under the feet"""
    x0, y0, x1, y1 = box
    sh = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).ellipse(box, fill=(60, 25, 0, alpha))
    canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(blur)))

# splash: mascot over a wordmark, on transparent (app.json gives the dark background)
splash = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
m = fit(mascot, 600)
mx, my = (1024 - m.width) // 2, 130
shadow(splash, (mx + m.width * 0.2, my + m.height - 26, mx + m.width * 0.8, my + m.height + 26), 12, 130)
splash.alpha_composite(m, (mx, my))
d = ImageDraw.Draw(splash)
f = ImageFont.truetype(FONT, 170)
tw = d.textlength('Brokey', font=f)
d.text(((1024 - tw) / 2 + 0, 770 + 6), 'Brokey', font=f, fill=(0, 0, 0, 110))
d.text(((1024 - tw) / 2, 770), 'Brokey', font=f, fill=(255, 210, 63, 255))
splash.save(f'{ROOT}/assets/splash-icon.png')

# adaptive: Android crops to a circle or squircle, so keep him inside the middle 66%
ad = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
m = fit(mascot, 600)
ax, ay = (1024 - m.width) // 2, (1024 - m.height) // 2 - 10
shadow(ad, (ax + m.width * 0.2, ay + m.height - 30, ax + m.width * 0.8, ay + m.height + 18), 12, 120)
ad.alpha_composite(m, (ax, ay))
ad.save(f'{ROOT}/assets/adaptive-icon.png')
print('wrote splash-icon.png and adaptive-icon.png from', pose)
