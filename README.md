# Brokey

A budgeting app that roasts you. Every price is in halal snack packs (HSPs). Made in Melbourne for broke uni students.

- **iOS first** (Expo SDK 57, React Native 0.86, TypeScript). Runs in the App Store version of Expo Go.
- **Local-first.** All data stays on the phone. No accounts, no ads, no analytics in this version.
- **Hand-drawn feel.** The mascot, icons and wordmark are generated from code (seeded geometry), so every screen is original art, not a stock icon pack.

## Run it

```bash
npm install
npx expo start          # scan the QR with Expo Go (SDK 57) on your iPhone
npm test                # 121 tests: budget maths, roasts, icons, languages, exports
npm run typecheck
npm run preflight       # App Store checks (fails until you fill in src/config.ts)
```

**"Project is incompatible with this version of Expo Go"?** The App Store's Expo Go only runs the newest SDK, and it updates a few times a year. Check the SDK number in the error, then upgrade: `npx expo install expo@^NN.0.0 --fix` (NN is that number), run `npm run typecheck && npm test`, and try again. For a long-term setup, make a TestFlight build with EAS instead of using Expo Go.

Web preview for quick looks: `npx expo export --platform web`, then `python3 scripts/serve.py 8099`.

## What is in it

| Feature | Where |
| --- | --- |
| Home: safe to spend today, mascot mood, fries left | `src/app/(tabs)/home.tsx`, `src/ui/Brokey.tsx` |
| Build-your-own-HSP logging (what, how much, when, where, how paid) | `src/app/log.tsx` |
| Roasts at Mild / Medium / Unhinged (18+ gate) | `src/core/roasts*.ts` |
| Cooling-off fridge ("I want this", 24 / 48 / 72 hours) and regret check-ins | `src/app/want.tsx`, `src/core/cooldown.ts`, `regret.ts` |
| Shame shelf, stickers, streaks | `src/app/(tabs)/shelf.tsx`, `src/core/stickers.ts` |
| Week view, HSP pie, sauce-bottle bars | `src/app/(tabs)/week.tsx`, `src/ui/charts/` |
| About 100 category icons, custom categories with an icon picker | `src/art/icons/`, `src/app/settings/categories.tsx` |
| Wallets, all-wallets overview, currencies, decimals and rounding options | `src/core/budget.ts`, `src/app/settings/wallets.tsx`, `money.tsx` |
| English, Chinese, Indonesian, Spanish | `src/i18n/` |
| Themes: Garlic (light), BBQ (dark), 3AM Kebab Shop (neon) | `src/theme/` |
| Export: spreadsheet (8 sheets, live formulas), PDF report, shareable HSP receipt | `src/export/`, `src/app/export.tsx`, `receipt.tsx` |
| Apple Pay auto-log guide (Shortcuts deep link) | `src/app/settings/shortcut.tsx` |
| Optional accounts (Supabase), off by default | `src/auth/`, `supabase/` |

## Switches (`src/config.ts`)

| Flag | Default | Meaning |
| --- | --- | --- |
| `BODY_ROASTS_AVAILABLE` | `false` | Body-related roast lines. Keep off for the App Store. |
| `AUTH_ENABLED` | `false` | Accounts and sync. Needs a Supabase project (`supabase/schema.sql`, `delete-account` function). |
| `SUPPORT_EMAIL`, `PRIVACY_URL`, `TERMS_URL`, `SUPPORT_URL` | placeholders | **Fill these in** before submitting. |

## Ship it

1. Fill in `src/config.ts` (deploy the pages from `npm run site` first).
2. `npm run preflight`, then follow **`docs/APP_STORE.md`** (listing text, age rating, privacy label, review notes, cost list).
3. `eas build --platform ios --profile production`, then `eas submit`.
4. Launch plan, creator programme and money plan: **`docs/MARKETING.md`**.
5. Poster: `npx tsx scripts/make-poster.ts <app store link>` writes `poster/poster-A3.pdf` and `poster-A4.pdf`.

## Art pipeline

`scripts/render-logo.ts` (icon, splash, wordmark), `render-art.ts` (mascot sheet), `render-icons.ts` (icon sheet), `bake-glyphs.ts` (wordmark letters from Bricolage Grotesque). The icon is flattened to opaque RGB on purpose: Apple rejects icons with an alpha channel.

## Roadmap

- **1.1** Brokey Plus (one in-app purchase), App Store link in the receipt footer, share button on roasts.
- **Home screen widgets** (safe-to-spend, Brokey mood). Needs a native widget target; the settings page already explains the plan.
- **Bank sync** (Basiq or similar in Australia) to replace manual and Shortcuts logging.
- **Friends and shared budgets** (v2): invite by link, shared wallet, group roast. Needs accounts on.
- **Chrome extension**: price on the page becomes HSPs, "put it in the fridge" button.
- **Android** (the code is already React Native; it needs testing and Play listing).
