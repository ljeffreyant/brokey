# Brokey: App Store submission pack

Everything you need to get from this folder to "Waiting for Review". Run `npm run preflight` before every build. It fails on anything Apple would bounce.

## 0. What is already handled in the code

| Apple rule | What Brokey does |
| --- | --- |
| 1.1 Objectionable content | Roasts are about spending, not bodies. Body roasts are off (`BODY_ROASTS_AVAILABLE = false`). Brand names are scrubbed from roast copy (a test enforces it). The Unhinged level needs an in-app "I am 18+" confirmation. |
| 2.1 Completeness | No placeholder text in the app. Preflight blocks the build while support/privacy/terms links are still `brokey.example`. |
| 4.2 Minimum functionality | A full native app: logging, budgeting maths, cooling-off timers, notifications, exports, widgets path. Not a wrapped website. |
| 5.1.1 Data collection | Everything is stored on the device. No accounts, no analytics, no ads, no tracking. |
| 5.1.1(v) Account deletion | Accounts are off by default (`AUTH_ENABLED = false`). If you ever turn them on, in-app deletion and the `delete-account` Supabase function are already written, and preflight checks the function exists. |
| Privacy manifest | Declared in `app.json` (`ios.privacyManifests`): no tracking, no collected data, required-reason APIs listed. |
| Export compliance | `ITSAppUsesNonExemptEncryption = false` (only standard HTTPS, no custom crypto). |
| Icon | 1024 x 1024, no alpha channel (preflight checks). |
| Devices | iPhone only (`supportsTablet = false`), so no iPad screenshots. |

## 1. You must do these (I cannot)

1. **Join the Apple Developer Program** (US$99 per membership year, charged in local currency where available). Use the same Apple ID you want as the seller name.
2. **Host the website**. Run `npm run site`, deploy the `site/` folder (Cloudflare Pages or GitHub Pages are free and allow commercial use), then put the three URLs and your support email into `src/config.ts`.
3. **Pick a final bundle id** if `com.nel.brokey` is not what you want (it cannot change after the first upload).
4. **Take screenshots** on a real build (6.9 inch iPhone is the one Apple requires; the rest are scaled). Suggested five: Home with Brokey, the log flow, Chill (cooling-off), Week with sauce bottles, HSP receipt.
5. **Test on a real iPhone** through TestFlight for at least a couple of days. Apple rejects crashes first.

## 2. Build and submit (EAS)

```bash
npm i -g eas-cli
eas login
eas build:configure          # accept defaults, iOS only
eas build --platform ios --profile production
eas submit --platform ios    # uploads to App Store Connect
```

Free EAS accounts use a slower queue (can be 90+ minutes at peak). That is fine for a launch week.

## 3. App Store Connect answers

**Name** (30 chars): `Brokey: Roast Your Spending`
**Subtitle** (30): `Budget in halal snack packs`
**Category**: Finance (primary), Lifestyle (secondary)
**Keywords** (100): `budget,spending,tracker,expense,student,money,saving,roast,meme,wishlist,impulse,habit,aud`
**Promotional text**: `Every price in HSPs. Every buy gets roasted. Big wants cool off first.`
**Description**:
> Brokey is a halal snack pack with opinions about your money.
> Log a buy in a few taps and Brokey roasts you for it. Every price is shown in HSPs, so a $180 jacket is not "$180", it is ten snack packs.
> - Safe to spend today: one number, no spreadsheets
> - The cooling-off fridge: tap "I want this", wait 24 hours, see if you still do
> - Regret check-ins and a shame shelf for your dumbest buys
> - Sauce-bottle charts and an HSP pie for the week
> - Wallets, currencies, four languages, three themes
> - Export a month as a spreadsheet, PDF report or shareable HSP receipt
> Your data stays on your phone. No bank login, no ads, no trackers.
> Brokey is not a bank and does not give financial advice.

**Age rating questionnaire**: answer honestly and let Apple compute the result (current tiers are 4+, 9+, 13+, 16+, 18+). Apple counts **insult-based humor** under "Profanity or crude humor", which is exactly what a roast is. Mild and Medium roasts are "infrequent"; the opt-in Unhinged level is stronger, so if you keep it in the build answer "frequent" and expect **13+ or higher**. Alcohol references (the "Night out" category) are "infrequent". Everything else (violence, sexual content, gambling, medical, user-generated content, unrestricted web) is none. If you want a lower tier, delete the Unhinged level before submitting. Do not try to force a rating.
**Price**: Free.
**Copyright**: `2026 Lionel Jeffreyanto`

**App Privacy (nutrition label)**: choose **Data Not Collected**. That is accurate because nothing leaves the device. If you ever turn accounts on, change to Contact Info (email) and User Content, linked to the user, not used for tracking.

**Review notes** (paste into App Review Information):
> Brokey is a local-first budgeting app. No account or login is needed; every feature is available on first launch. To see the main flow: finish the short onboarding, tap the red + button, pick a category, type an amount and save. A roast appears. The "Chill" tab holds the 24 hour cooling-off timers (tap + then "Not yet"). Roast text is comedic and is about spending habits only. The strongest roast level ("Unhinged") is hidden until the user confirms they are 18 or older. The app does not connect to bank accounts. The optional Apple Pay shortcut is a guide for the user's own Shortcuts app and sends nothing off the device.
No demo account is needed while `AUTH_ENABLED = false`.

**Support URL / Privacy URL / Marketing URL**: the pages from `npm run site`.

## 4. Likely rejection reasons and the fix

| Reason | Fix |
| --- | --- |
| 2.1 dead or placeholder URLs | Fill `src/config.ts`, redeploy the site, check the links open. |
| 1.1 "offensive" roasts | Keep body roasts off, keep Unhinged behind the 18+ gate, mention the gate in review notes. |
| 4.3 spam / copycat | Brokey is original art and concept. Do not use brand names in screenshots. |
| 5.1.2 data | Label says Data Not Collected. Do not add analytics SDKs without updating the label and manifest. |
| Crash on launch | Test the release build from TestFlight, not only Expo Go. |

## 5. Cost list (all figures checked October 2026, USD unless noted)

| Item | Needed to launch? | Cost |
| --- | --- | --- |
| Apple Developer Program | Yes | **US$99 per year** (local price shown at enrolment) |
| Expo EAS Free plan (cloud iOS builds, submit) | Yes | **$0** (low-priority queue, up to 15 iOS builds of credit) |
| Domain name for the website and support email | Strongly recommended | about **$15 to $25 per year** |
| Website hosting (Cloudflare Pages / GitHub Pages) | Yes | **$0** |
| Supabase | Only if accounts or sync are turned on | **$0** Free (2 projects, 50,000 MAU, pauses after 1 week idle) or $25 per month Pro |
| Vercel | Not needed | Hobby is **$0 but personal, non-commercial only**; Pro is $20 per month. Use Cloudflare/GitHub Pages for the store pages instead |
| Expo EAS Starter (optional, faster builds) | No | $19 per month plus usage |
| RevenueCat (only when you add paid features) | Later | Free until $2,500 monthly tracked revenue, then 1% |
| Apple's cut on future in-app purchases | Later | **15%** under the Small Business Program (proceeds up to US$1m) |

**Launch budget: about US$115 to $125** (Apple + domain). A comfortable cap is **US$300**: add one month of EAS Starter ($19), one month of Supabase Pro ($25) if you turn accounts on, printing the campus posters and stickers, and about $100 of creator payments.

## 6. After approval

- Release manually the day you want the TikTok burst, not automatically.
- Put the App Store link and a QR code on the poster and in the receipt footer (see `docs/MARKETING.md`).
- Reply to every review in the first two weeks.
