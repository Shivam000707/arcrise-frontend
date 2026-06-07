# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project

**ArcRise** — a React Native/Expo productivity RPG. Users build a hero character whose stats reflect real-world habits. Doomscrolling detected apps trigger a "Mirror" intervention screen. Stats decay without activity.

Stack: Expo SDK 56 · React Native 0.85.3 · React 19.2.3 · TypeScript

---

## Commands

```bash
# Verify the bundle compiles with zero TypeScript errors (primary CI check)
npx expo export --platform android --no-minify

# Start dev server (Expo Go or dev build)
npm start

# Start on Android emulator
npm run android
```

There are no tests or linter configured. `npx expo export` is the only verification step — it runs Metro + tsc in full.

**Expo Go compatibility note:** The project must use `react-native-reanimated@~3.x` for Expo Go. Version 4.x requires a custom development build (`eas build --profile development`).

---

## EAS Build Profiles

Config in `eas.json` + `app.config.js` (reads `APP_VARIANT` env var set by EAS):

| Profile | App name on device | Package | Use for |
|---|---|---|---|
| `development` | ArcRise Dev | `com.arcrise.app.dev` | Daily dev testing, dev client, debug APK |
| `preview` | ArcRise Preview | `com.arcrise.app.preview` | Sharing / internal demo, release APK |
| `production` | ArcRise | `com.arcrise.app` | Play Store, AAB |

All three can be installed side-by-side. `app.json` holds base config; `app.config.js` overrides `name` and `android.package` per variant.

---

## Architecture

### Navigation tree

```
RootNavigator (NativeStack, fade)
├── OnboardingNavigator (NativeStack)     — while useOnboardingStore.completed = false
│   ├── AwakeningScreen
│   ├── ClassSelectScreen
│   └── HeroNamingScreen
└── ModalNavigator (NativeStack)          — after onboarding complete
    ├── AppNavigator (BottomTabs: WarRoom · Quests · Journal/Chronicle · Hero · Party)
    ├── FocusScreen         (fullScreenModal)
    ├── MirrorScreen        (fullScreenModal)
    ├── MirrorCorruptedScreen (fullScreenModal)
    └── LevelUpScreen       (fullScreenModal)
```

**Onboarding → app transition** is not a `navigate()` call. `useOnboardingStore.complete()` flips `completed`, which causes `RootNavigator` to swap navigators on re-render.

**Modal screens** (Focus, Mirror, LevelUp) are children of `ModalNavigator`, a sibling of `AppNavigator`. Navigating to them from inside the tab navigator uses parent traversal — `navigation.navigate('Mirror' as never, params as never)`.

**`AppGuard`** (invisible component rendered above the `Tab.Navigator` in `AppNavigator`) hosts `useStatDecay()` and `useMirrorTrigger()`. This pattern exists because these hooks need NavigationContainer context but shouldn't belong to any specific tab screen.

### State management

Two Zustand stores + React Query. Never mix them up:

| Store | Purpose |
|---|---|
| `useOnboardingStore` | Onboarding step, selected class, hero name, `completed` flag |
| `useAppStore` | Mirror active/corrupted/appName, level-up pending, blacklist + decay timestamps, `doomscrollDetectedToday` |
| React Query (`['hero']`, `['quests']`, `['journal']`, `['party']`) | All domain data |

Zustand is ephemeral UI/session state only — never put domain data there.

### Data layer and FastAPI migration path

```
src/services/api/use*.ts     ← React Query hooks (call mock functions)
src/services/mock/*.mock.ts  ← Typed async stubs returning Promise<T>
```

To migrate one endpoint to FastAPI: open the relevant `use*.ts` file and replace the `mock*` import with a `fetch()` call. The hook signature, query key, and all components remain untouched. This can be done one endpoint at a time.

`mockAddEntry` in `journal.mock.ts` pushes to the in-memory `MOCK_JOURNAL` array so journal entries appear in the screen during the same session.

### Background system — `useStatDecay`

On every app foreground transition (and on cold mount), `useStatDecay` runs two checks in sequence inside a single `checkingRef`-guarded async function:

1. **Blacklist check** — calls `checkBlacklistUsage(sinceMs)` from `UsageStatsService`. On `__DEV__`, 20% random trigger for testing. In prod, polls `NativeModules.UsageStatsModule` (stub — marked with `── NATIVE BRIDGE POINT ──` comments). On detection → `setMirrorActive(true, isCorrupted, appName)`.

2. **Daily decay check** — calls `applyDailyDecay(hero, doomscrollDetectedToday)` once per calendar day. `lastDecayCheck` is set in `useAppStore` *before* the async mutations to prevent double-apply on rapid foreground events. If any stat dropped → `updateHeroMutation` + `addEntryMutation` (type `stat_decay`).

`doomscrollDetectedToday` is set to `true` inside `setMirrorActive` when `active = true`. This allows the FOCUS decay rule (+3 penalty) to fire when a doomscroll app was detected on the same day.

`useMirrorTrigger` (also in `AppGuard`) watches `mirrorActive` and imperatively navigates. `triggeredRef` prevents double-navigation.

### Stat decay rules (`utils/statDecay.ts`)

| Stat | Threshold | Decay | Condition |
|---|---|---|---|
| FOCUS | >24h | −3 | Only if `doomscrollDetectedToday` |
| PHYSIQUE | >24h | −2 | Always |
| CRAFT | >48h | −2 | Always |
| WISDOM | >48h | −2 | Always |
| DISCIPLINE | >36h | −4 | Always |
| AURA | >72h | −1 | Always |

Floor: 10. Cap per day per stat: 5. Time reference: `hero.lastActivityAt`.

### Hero visual system

`heroStateFromStats(stats, lastActivityAt)` → `'thriving' | 'fading' | 'corrupted'`:
- avg > 65 → thriving
- 40–65 → fading
- avg < 40 OR any stat < 25 → corrupted

`HeroPortrait` (in `src/components/hero/`) renders fully procedurally — no image assets. It accepts `stage: PortraitStage` (1–5, derived from level via `levelToStage`), optional `heroState` (computed from `stats` if omitted), and `size`. Each `HeroState` maps to different SVG fill colors, a gray desaturation overlay, and an `AuraRing` animation mode. `CrackOverlay` (5 SVG fracture paths) is shown only in `corrupted` state.

`PortraitStage` is derived from level via `PORTRAIT_STAGE_BRACKETS` in `constants/xp.ts`.

### Journal prose engine

`generateJournalEntry(event: JournalEvent, hero: Hero): string` in `src/services/journal/generateJournalEntry.ts` is the **single LLM swap point**. Replace its body with an API call to upgrade from templates to AI prose. The signature must not change.

Template selection uses `pick(arr, day, classIdx)` — deterministic: same hero + day always returns the same template, varies by class.

Supported `EntryType` values: `focus` · `doomscroll` · `quest` · `levelup` · `streak` · `party` · `milestone` · `daily_status` · `stat_increase` · `stat_decay`

---

## Design system

All tokens in `src/constants/`. Never hardcode colors, spacing, or font names in screen files.

| Constant | Key values |
|---|---|
| `Colors` | `background #0A0A0A`, `deepPurple #1A0533`, `violet #7B5CF0`, `gold #F4C542`, `teal #14B8A6`, `red #EF4444`, `midGray #9CA3AF`, `darkGray #374151` |
| `FontFamily` | `heading` (Cinzel_400Regular), `headingBold` (Cinzel_700Bold) |
| `FontSize` | xs:11 sm:13 base:15 lg:17 xl:20 2xl:24 3xl:30 4xl:36 |
| `Radius` | `button:8`, `card:12`, `full:9999` |
| `Spacing` | xs:4 sm:8 md:16 lg:24 xl:32 2xl:48 3xl:64 |

Cinzel is capitals-only — lowercase renders as small caps. Use mixed case intentionally for two-scale headings.

### Reanimated patterns

All animations use Reanimated 3 (`react-native-reanimated@~3.x`). Patterns in use:
- `useSharedValue` + `useAnimatedStyle` for View transforms/opacity
- `useAnimatedProps` + `Animated.createAnimatedComponent(Circle)` for SVG `strokeDashoffset` (ProgressRing)
- `withRepeat(withSequence(withTiming(...), withTiming(...)), -1)` for continuous loops
- Each self-contained animated particle/node is a separate component with its own `useSharedValue` — never share animation values across siblings

### SVG

`react-native-svg` is used for: hero silhouettes, aura rings, crack overlays, progress rings, radar charts, ornamental dividers, sigil assets. Sigil geometry is inlined per screen (not imported from `src/assets/svgs/`) — deliberate decision to avoid asset import complexity.

---

## Path alias

`@/*` → `./src/*` — configured in `tsconfig.json` and resolved by `babel-preset-expo`. Use it everywhere.

---

## Constraints

- **Dark theme only.** `userInterfaceStyle: "dark"` enforced in `app.json`.
- **Android-first.** `UsageStatsService` has iOS stubs returning 0. Mirror screens are Android-only in practice.
- **No backend.** All data is mock. FastAPI + PostgreSQL deferred. See migration path above.
- **No image assets.** All visuals are procedural (Reanimated + SVG).
- **`npx expo export --platform android --no-minify`** is the authoritative build check.
