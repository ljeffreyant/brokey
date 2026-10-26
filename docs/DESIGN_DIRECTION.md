# Brokey design direction (Oct 2026)

Short version: keep the structure of the app, swap in the 3D mascot, and restyle the UI to match its soft clay material. Five other directions are kept as mockups. Recommendation and what shipped at the bottom.

## 1. Mascot

The mascot is now the 3D clay-style HSP box (white clamshell, loaded chips, three sauces, red shoes, green piggy bank). The hand-built SVG mascots were dropped; the generated ones are far better.

Assets (all transparent PNG with a white sticker outline):

- `social/mascot3d/moods/` 35 poses, about 300px each. Fine up to roughly 120pt in the app.
- `social/mascot3d/stickers/` 8 big poses, about 800px, plus the app tile.
- `social/mascot3d/icon/` three icon crops (`icon-a-full.png` reads best at small sizes).
- `social/mascot3d/moods-sheet.png` labelled contact sheet.
- Rebuild from the source sheets with `python3 scripts/mascot3d/moods.py` and `export.py`.

App mood to pose:

| App mood | Poses |
| --- | --- |
| happy | wave-happy, wave, joy |
| ok | neutral, content |
| sideeye | hips-smirk, smug |
| sad | sad, shrug-sad, cry |
| broke | broke, shrug-meh, panic-run |
| shock | shock, gasp |
| proud | shades-coin, thumbs-up, coins-happy |
| tempted | cheeky, hungry-fork, puzzled |
| extras | nervous (pace warning), calc-worry (log), angry-red and shout (unhinged roast), sleepy (late night), party (new sticker), piggy-hug and piggy-calm (Chill, saved), juggle (Week), peekaboo (shame shelf), kiss and kiss-heart (thanks) |

Known gaps:

- The art reads closer to loaded fries or poutine than a real HSP: the chips are thin and the doner is small. Thick-cut chips, a bigger heap of shaved doner and white garlic sauce as the dominant sauce would fix it. Prompt tweak for the image model: "thick-cut chips, a generous mound of shaved doner kebab meat covering the chips, garlic sauce, chilli sauce and BBQ sauce drizzled in zig-zags, white foam clamshell box".
- The 35-pose sheet is a slightly different box design from the big hero poses (no open lid). Pick one box design and regenerate the rest so the set is consistent.
- Source resolution is low. Regenerate the 6 to 8 poses you actually ship at 2048px.
- Wired into the app (see section 6). The raster art cannot show the fry count, so the budget pile moved to the chip meter in the Home hero.

## 2. UI directions (mockups in `social/mockups/`)

The HTML files are committed with the sheets and overview renders. Their `img/` (mood PNGs upscaled 2x from `social/mascot3d/moods`) and `fonts/` (copies from `node_modules/@expo-google-fonts`) folders are not, so recreate them before re-rendering with `python3 scripts/mockups/render.py`.

All five use the real screens and copy (Home, Log, Roast, Chill, Week). Open `social/mockups/<name>.html` for the live HTML, `png/` for renders.

| | Direction | Idea | Best for |
| --- | --- | --- | --- |
| A | Op Shop | Paper, hang tags, Dymo labels, receipt line items, red price sticker | Share cards, the HSP receipt export |
| B | Wheatpaste | Gig poster: black, yellow, Anton, torn paper, halftone | Social and launch content |
| C | The 96 | Tram stop board: amber LED panel, tram window with the mascot | A fun alt theme for locals |
| D | 3AM Kebab | Neon sign, menu board, shop counter, fridge | The dark theme (the app already has "3AM Kebab Shop") |
| E | Clay Toy | Soft 3D buttons and cards, same material as the mascot | The default light UI |

## 3. Naarmcore

Researched earlier. The label is contested: Clothing the Gaps and First Nations creators have asked people to stop using it, so do not use "Naarmcore" or "Naarm" as a brand, hashtag or caption. Borrow only the visual language that is just Melbourne: black wardrobe, op-shop texture, trams, laneways, brick, wheatpaste gig posters, graffiti lettering, screen print. Directions A to D draw on that; E is the friendly default.

## 4. Will Melbourne people use it?

Reasons it can work:

- Money is tight for students. A June 2026 piece from University of Wollongong researchers reports about one in three surveyed students struggling financially, 51% food insecure and 74% relying on paid work to cover living costs (survey of nearly 900 students; the article does not say which universities).
- Gen Z dislikes credit cards: 56% say they give them "the ick" and 38% could not cover an $800 emergency (Afterpay and Morning Consult, April 2025; the 56% may be a global Gen Z figure).
- Personality-led budgeting has proven demand: Cleo reports 1.5M monthly active users and A$254M revenue in 2025.
- A very local joke (HSP as the unit, Melbourne roast lines) is hard for a generic app to copy.

Reasons to be careful:

- Budgeting apps are hard to keep alive. Pocketbook had 435,000 users by January 2018 and was still shut down by its owner in 2022.
- Cleo's money comes from cash-advance fees (about 62% of revenue) and subscriptions, not from the roasting. Brokey has no equivalent revenue line, so treat the 500 installs goal as a learning goal, not a business.
- Manual logging is the retention risk. Logging has to take under five seconds, and the weekly receipt and Chill tab are the loops worth shipping first.

500 installs by 31 Dec is realistic through local, niche distribution (uni clubs and groups, Melbourne food TikTok, the teaser posts). Track day-7 retention more than installs.

## 5. Recommendation

1. Ship E (Clay Toy) as the default UI, with the 3D mascot. It matches the mascot's material, is the most legible, and screenshots well for the App Store.
2. Ship D as the dark theme, named "3AM Kebab Shop" (it already exists in the app).
3. Use A for the HSP receipt and share cards, and B for launch posters and socials.
4. Use `icon-a-full.png` as the app icon.

## 6. What shipped: the clay restyle

The app keeps its layout and every screen. The art style now matches the mascot: soft 3D clay instead of black outlines and hard offset shadows.

Material (`src/ui/clay.ts`, used by `src/ui/kit.tsx`):

- `Slab` / `PressSlab` are a face on a darker lip with a soft ground shadow, a bright inner top edge and a shaded bottom (`boxShadow` strings, drawn over the children). Buttons, round buttons and the tab bar add a small gloss highlight. Pressing sinks the face into its lip.
- `puff(p, fill, depth)` gives any small view the same look in one style spread (badges, icon tiles, pills). `dent(p)` is the pressed-in version (fields, toggle groove, tracks).
- `Meter` is the progress bar: a groove with a glossy fill. Used by the savings ladder, Chill, Week.
- `lipOf` makes the underside colour from any fill, so every theme (light and dark) gets matching clay without per-theme art.

Mascot:

- `src/ui/Brokey.tsx` keeps the same props and now draws the 3D poses (`src/art/poses.ts`, `src/art/moodPoses.ts`). Each mood has two to four poses, and poking him hops and flips to the next one. Idle bob, squash and sway pivot at his feet, he has a soft ground shadow, and a chip flies off his head when a fry is lost. Reduce Motion turns the idle loops off.
- Moments can name a pose directly with `pose=`: party (celebrate), piggy-hug and piggy-calm (Chill, Account), peekaboo (lock), worried (crash).
- `FryMeter` (nine clay chips) replaces the fry count that used to be drawn on the old mascot.

Home hero: clay lip under the colour field instead of the black edge, spotlight behind the mascot, soft clay sun and clouds, embossed number that counts up to its value, dark clay pills.

Regenerating the art:

- `python3 scripts/mascot3d/appassets.py --model EDSR_x2.pb` sharpens the 35 cut-out moods with EDSR x2 and writes `assets/brokey/*.webp`, `src/art/poses.ts` and `src/art/poseThumbs.ts` (inline thumbnails for the PDF). Needs opencv-contrib 4.x for `dnn_superres` (the 5.x wheels ship it empty). `--fast` skips the model for quick iteration.
- `python3 scripts/mascot3d/appicons.py` rebuilds `splash-icon.png` and `adaptive-icon.png`.

Still to do:

- Check the shadows on a real iPhone. They use RN `boxShadow` (new architecture, iOS and Android 9+, inset on Android 10+); only the web build was verified here.
- Regenerate the poses you ship at 2048px. Hero size on a 3x phone needs about 700px, the moods are 600px after sharpening.
- Pick one box design (closed or open lid). The app icon is the open-lid art, the in-app poses are the closed box.

## Sources

- [UOW: "Every day I think about money" (June 2026)](https://www.uow.edu.au/media/2026/every-day-i-think-about-money-how-can-we-support-uni-students-who-struggle-financially.php)
- [UOW: Many Australian uni students are worried about food (University of Tasmania figures: 53% food insecure in 2024)](https://www.uow.edu.au/media/2025/many-australian-uni-students-are-worried-about-food.php)
- [Afterpay: Gen Z credit card "ick" report](https://newsroom.afterpay.com/updates/most-gen-zs-say-credit-cards-give-them-the-ick-as-study-reveals-more-aussies-ditching-credit-cards)
- [Pocketbook (Wikipedia)](https://en.wikipedia.org/wiki/Pocketbook_(application))
- [Cleo (Sacra)](https://sacra.com/c/cleo)
