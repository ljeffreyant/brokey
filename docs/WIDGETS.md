# Home screen widget: feasibility (checked 20 October 2026)

**Decision: not in version 1.0. Plan it for 1.1, after the first App Store approval, and build it on a real iPhone.**

## What exists

Expo has an official library, `expo-widgets`, for iOS home screen widgets and Live Activities. Its docs exist for SDK 57 (the SDK this app uses) with recommended version `~57.0.26`, and the SDK 57 page carries no alpha or beta label.
Sources: [SDK 57 docs](https://docs.expo.dev/versions/v57.0.0/sdk/widgets/), [npm](https://www.npmjs.com/package/expo-widgets).

How it works, from those docs:

- A widget is a React component with a `'widget'` directive, built from `@expo/ui/swift-ui` components (SwiftUI under the hood) and registered with `createWidget('Name', Component)`.
- The widget runs in an isolated runtime: no hooks, no state, no async work, no imports, nothing declared outside the component.
- The app pushes data with `Widget.updateSnapshot(props)` (or `updateTimeline`). Images go in a shared folder, `widgetsDirectory`, and the widget refers to them by path.
- It needs an App Group (defaults to `group.<bundle id>`), a config plugin entry in `app.json`, and a **development build**. It does not run in Expo Go.
- Interactive and configurable widgets need iOS 17 or later.

## Why not now

1. **I cannot build or run it here.** There is no Xcode, no iOS simulator and no iPhone in this environment, so I could add native configuration but not prove it works. A wrong widget entry in `app.json` can break the whole iOS build, which is the build you submit this week.
2. **Parts the docs do not cover.** The SDK 57 page does not document tapping a widget to open a screen in the app (only Live Activities have a documented URL), and it gives no example of drawing an image from `widgetsDirectory`. The mascot would need pre-rendered PNGs, so that is real work with no documented recipe.
3. **The review risk is not worth it.** A widget that renders blank or crashes is worse than no widget. The settings screen for widgets stays hidden behind `WIDGETS_AVAILABLE = false` in `src/config.ts`, so the app has no "coming soon" screen (App Store guideline 2.1).

## Plan for 1.1

1. `npx expo install expo-widgets @expo/ui` (match the SDK; check the Expo UI docs for the `@expo/ui` version).
2. Add the plugin to `app.json`:
   ```json
   ["expo-widgets", { "widgets": [{ "name": "SafeToSpend", "displayName": "Safe to spend", "description": "How much you can spend today", "ios": { "supportedFamilies": ["systemSmall"] } }] }]
   ```
3. Widget content, small size only to start: the **safe-to-spend number for today in HSPs**, fries left (0 to 9) and the mood name. Plain text first, mascot picture later.
4. Add a hook beside `useSmartAlerts` that calls `SafeToSpend.updateSnapshot(...)` whenever the budget numbers change.
5. Mascot pictures: render five mood PNGs with the existing `scripts/render-art.ts`, write them into `widgetsDirectory` on first launch, and show them with a SwiftUI image once the docs or a test build confirm how.
6. Build a development build with EAS, install it on an iPhone, add the widget, and test: logging a buy updates it, a new day resets it, dark mode, and the privacy lock (the widget should show nothing sensitive when the app lock is on; decide that before building).
7. Only then flip `WIDGETS_AVAILABLE` to true and write the settings copy.

Estimated effort: half a day if the first build works, a day if it does not.
