# ArcRise — Build Log

**Status:** MVP DEMO READY ✓

---

## Completed Steps

### Step 1 — Scaffold & Architecture
- 60 files across 24 directories created
- All packages installed (Expo 56, RN 0.85.3, Reanimated 4.3.1, React Navigation v7, Zustand v5, React Query v5, Cinzel font, react-native-svg, expo-linear-gradient)
- tsconfig paths alias configured (`@/*` → `./src/*`)
- app.json dark theme + Android PACKAGE_USAGE_STATS permission
- App.tsx with all providers wired (QueryClient, NavigationContainer, GestureHandlerRootView, SafeAreaProvider, fonts)
- expo export: 1,346 modules, zero errors

### Step 2 — AwakeningScreen.tsx
- 15 ember particles with Reanimated `withRepeat` + `withDelay`, rising from below horizon line
- Warrior silhouette SVG with two radial gradient glow ellipses (ground glow + backlight halo)
- Full-width horizon line via `expo-linear-gradient` (gold → violet → transparent)
- Cinzel typography with inline gold "NPCs" using nested `<Text>` — mixed-case rendering for two-scale visual
- Fade-in on mount via `useSharedValue(0)` → `withTiming(1, { duration: 1400 })`
- Navigates to ClassSelect on CTA tap

### Step 3 — ClassSelectScreen.tsx
- 5 class cards pulled from `constants/classes.ts` (HERO_CLASSES) — zero hardcoded class data
- Unique geometric SVG sigils per class: ascending bars (Builder), hexagon + circle (Athlete), hexagram (Creator), open book (Scholar), shield (Warrior)
- Reanimated `interpolate` for scale [1 → 1.025] and `interpolateColor` for border [30% → 100% violet] on selection
- Sigil box with `rgba(123,92,240,0.14)` bg → gold-tinted on selection
- Gold circle checkmark (SVG circle + tick path) on selected card
- CTA disabled + dimmed until selection; saves to `useOnboardingStore.setSelectedClass()` on confirm
- Navigates to HeroNamingScreen
- Flavor texts updated in `constants/classes.ts` to match design reference

### Step 4 — HeroNamingScreen.tsx + WarRoomScreen.tsx

**HeroNamingScreen.tsx**
- Large class sigil (80px) with 3-layer Reanimated pulsing violet glow rings
- TextInput: dark `#1A0533` bg, gold bottom border only, Cinzel font, centered
- Live preview: `THE [HERONAME] BEGINS.` updates as user types; defaults to `THE HERO BEGINS.`
- `KeyboardAvoidingView` + `ScrollView` — input always visible above keyboard
- Transition: violet circle (`CIRCLE_SIZE=80`) scales via Reanimated from screen center to `TARGET_SCALE` (covers all corners), `runOnJS(complete)()` fires on animation finish
- `complete()` updates Zustand `completed: true` → RootNavigator fades from onboarding to WarRoom
- Saves hero name to `useOnboardingStore.setHeroName()`

**WarRoomScreen.tsx**
- All data from React Query: `useHeroQuery()`, `useQuestsQuery()`, `usePartyQuery()` — zero hardcoded values
- Hero state (`thriving/fading/corrupted`) from `heroStateFromStats()`; portrait stage from `levelToStage()`
- XP progress bar: `hero.xp / xpForNextLevel(hero.level)`, clamped 0–1
- Level badge as violet pill: `# LVL {hero.level}`
- Status line from `generateJournalEntry({ type: 'streak' }, hero)` in italic Cinzel
- 3 `QuestRow` components (built inline — spec requires left-border-only + progress bar, differs from QuestCard stub)
- Quest accents: gold (daily), violet (weekly), dark gray (long-term)
- FOCUS widget: `ProgressRing` with `hero.stats.focus / 100` progress + large numeral inside
- Party widget (inline): party name, red boss HP bar, `getBossCountdown()` from `party.boss.endsAt`
- Full `ScrollView` wrapping all content above tab bar

---

### Step 5 — FocusScreen.tsx

**FocusScreen.tsx**
- `useCountdownTimer` hook: real implementation with pause accumulation tracking via refs, 500ms tick interval
- `ProgressRing` component: upgraded from stub to animated SVG — `Animated.createAnimatedComponent(Circle)` + `useAnimatedProps` for `strokeDashoffset`, `withTiming(500ms)` on progress changes, `-90deg` rotation so arc starts at top
- Background: `#1A0533 → #0D0020 → #0A0A0A` LinearGradient simulating energy-field radial glow
- Top: Reanimated pulsing green dot (`withRepeat`/`withSequence`) + `FOCUS SESSION ACTIVE` in gold Cinzel + quest name pulled from `useQuestsQuery()[0].title`
- Center: `ProgressRing` (size 240, strokeWidth 8, violet) with `HH:MM:SS` / `MM:SS` countdown inside; `PAUSED` badge shown when paused
- Below ring: `HeroPortrait` (size 64, thriving) with LinearGradient gold glow ellipse underneath
- Stat chips: `+0.4/min FOCUS` in teal, `{xpEarned} XP EARNED` in gold (calculated at 2 XP/min)
- Pause/Resume button toggles `useSessionStore.pause()` / `resume()`
- Surrender: dim warning text + intentionally small dim-red `Surrender` link → bottom sheet Modal with `Keep Going` (violet) and `Surrender` (dim red) — confirm deducts 30 XP via `useUpdateHeroMutation`, adds `doomscroll` journal entry, calls `session.end()`
- Session complete: `withSequence` gold flash overlay (opacity 0 → 0.85 → 0) showing `SESSION COMPLETE` + XP earned, then journal entry added + `session.end()` + `navigation.goBack()` after 2.8s
- Auto-starts session on mount if `session.active === false`
- Build: 1480 modules, zero errors

---

### Step 6 — MirrorScreen.tsx + MirrorCorruptedScreen.tsx

- `ModalStackParamList` updated: `Mirror` and `MirrorCorrupted` now accept `{ appName?: string }` route param
- Both screens: `#060606` background, `expo-linear-gradient` red vignette from all 4 edges (4 absolute overlays), `HeroPortrait` with Reanimated flicker, gold-bordered `PROTECT MY ARC` button with SVG shield, intentionally tiny dim-red `Continue Anyway` link
- `Continue Anyway` handler: deducts `DOOMSCROLL_XP_COST = 47 XP`, decrements focus/discipline/aura stats, adds `doomscroll` journal entry via `useAddEntryMutation`, calls `setMirrorActive(false)`, navigates back
- `PROTECT MY ARC`: calls `setMirrorActive(false)`, navigates back — no XP penalty
- Focus time displayed: computed from `useSessionStore.startedAt` at render time
- **MirrorScreen** (fading state): subtle slow flicker (4-keyframe `withRepeat`), violet hero name in heading, body text in dim gray, footer: `'Every choice is written in your story.'`
- **MirrorCorruptedScreen** (corrupted state): aggressive fast flicker (8-keyframe withRepeat with 80–120ms intervals), red vignette ~2× stronger, hero name in dim red `#B22222`, dark-red warning box showing live FOCUS stat + "dropping ↓" + "DISCIPLINE STREAK: at risk", extra stat damage on continue (focus −6, discipline −4, aura −2), footer last line brightened: `'Every. Single. One.'`
- Build: zero errors

---

### Step 7 — JournalScreen.tsx

- `TabParamList` updated: added `Journal: undefined`
- `AppNavigator.tsx` updated: added `Journal` tab (title: 'Chronicle') between Quests and Hero
- `ParchmentTexture` component: SVG `Pattern` with diagonal lines at `rgba(244,197,66,0.028)` — ultra-subtle gold crosshatch layered over background
- Gold ornamental `EntryDivider`: SVG with two `Line` segments and a diamond `Path` at center, rendered as `ItemSeparatorComponent`
- `EntryRow`: `DAY XX` in stacked gold Cinzel (38px fixed column) + italic prose in flex-1 column; `MILESTONE` badge (gold bordered pill) shown above row when `entry.isMilestone === true`; most recent entry (index 0) at full opacity, all others at 70%
- `FlatList` with `ListHeaderComponent`: centered `THE CHRONICLE` in gold Cinzel (letterSpacing 8), hero name + class in violet, thin gold `hairlineWidth` divider
- Empty state: dim gray Cinzel heading + italic subtext
- Floating card (absolute, positioned above tab bar via `useBottomTabBarHeight`): dim violet bg with violet border, `TODAY` label + italic "Today's entry being written" + Reanimated blinking cursor (`withRepeat` on opacity), `SHARE YOUR ARC ↗` in gold
- Share handler: formats last 3 entries as `DAY X\n{prose}` separated by `— — —`, shares via `React Native Share API`
- FlatList bottom padding accounts for floating card height + tab bar height
- Build: zero errors

---

### Step 8 — LevelUpScreen.tsx

- `ModalStackParamList.LevelUp` updated: accepts `newLevel`, `className?`, `statIncreases?`, `talentUnlock?`
- `Particle` sub-component: each of 24 particles manages own `useSharedValue` pair (translateY + opacity), `withDelay` + `withTiming` on mount — positions randomized via `useMemo` so they don't re-seed on re-render
- `StatRow` sub-component: slides up from 20px + fades in via `withDelay(700 + i*200ms, ...)`
- Violet radial burst: single large `Animated.View` circle (2.6× screen diagonal) scales `0 → 1` over 600ms (`Easing.out(Easing.cubic)`), opacity fades 0.65 → 0.45 → 0
- Gold light rays: 12-spoke SVG `Line` array from screen center, rendered in `Animated.View`, fade in at 350ms delay then fade out over 1.8s total
- 'LEVEL UP' label: `withRepeat` shimmer on opacity 0.55 → 1.0 → 0.55 cycling at 700ms each
- 'LVL X' at 72px: two stacked `Text` elements — violet glow layer (opacity 0.4, `position: 'absolute'`) + white text on top with `textShadowColor: gold, textShadowRadius: 18`
- Main content in `Animated.View` with `withDelay(400ms)` fade-in so it appears after burst settles
- HeroPortrait (size 100, thriving) with gold LinearGradient glow ellipse
- Optional `talentUnlock` banner: gold-bordered card with title + gray italic description
- CTA 'CONTINUE THE ARC →': gold-bordered button, `navigation.goBack()`
- Build: zero errors

---

### Step 9 — HeroPortrait procedural visual states

**heroVisuals.ts** — `heroStateFromStats` implemented: avg > 65 = thriving, 40–65 = fading, < 40 or any stat < 25 = corrupted

**AuraRing.tsx** — replaced stub:
- `heroState` prop drives animation style
- Thriving: smooth scale 1→1.08→1 + opacity 0.8→0.4→0.8 at 1.2s each
- Fading: slower drift (2s) + erratic 4-keyframe opacity flicker at lower range (0.18–0.35)
- Corrupted: rapid erratic scale jitter (120–350ms keyframes) + heavy opacity flicker (0.08–0.5)
- Ring sized at `size × 1.18` so it halos clearly around portrait

**CrackOverlaySvg.tsx** — 5 real fracture paths in 120×120 viewBox: main crack (top-left through center), branching sub-crack, right-side crack, lower horizontal crack, hairline top-center — each at decreasing opacity/weight (0.78 → 0.34)

**CrackOverlay.tsx** — replaced stub: wraps `CrackOverlaySvg` in `Animated.View` with shimmer `withRepeat` (opacity 0.65↔1.0 with irregular cadence) to reinforce corrupted flicker; returns null when `visible=false`

**HeroPortrait.tsx** — replaced stub:
- `heroState` is now optional; if omitted, computed from `stats` prop via `heroStateFromStats`
- 5 SVG silhouette paths (120×120 viewBox): Stage 1 = amorphous blob → Stage 5 = strong cloak shape
- Stage 5 adds 3 gold accent lines (opacity 0.65) tracing cloak/hood edges
- Circular clip via `overflow: 'hidden'` + `borderRadius` on wrapping `View` — no SVG ClipPath needed
- Background color per state: thriving `#2D1B5E` → fading `#1C1230` → corrupted `#181818`
- Silhouette fill per state: thriving `#4B2F8A` → fading `#2E2240` → corrupted `#222222`
- Desaturation via gray overlay: fading = `rgba(100,100,100,0.42)`, corrupted = `rgba(100,100,100,0.72)`
- Aura color per state: violet → dim violet `#4B3A8A` → dark red `#7F2222`
- CrackOverlay shown only when heroState = 'corrupted'
- Build: zero errors

---

### Step 10 — Android Usage Stats Integration

- `useAppStore` updated: added `detectedAppName: string | null`; `setMirrorActive` now accepts optional `appName` param and writes all three fields atomically
- **`UsageStatsService.ts`** — full implementation:
  - `BLACKLISTED_APPS` array (7 packages) + `APP_DISPLAY_NAMES` map for human-readable names
  - `getRecentUsage(pkg, sinceMs)`: iOS returns 0; dev returns random; prod = native bridge stub (comment marks swap point for `NativeModules.UsageStatsModule.getRecentUsage`)
  - `hasUsagePermission()` + `requestUsagePermissionIfNeeded()`: iOS skip; prod = native bridge stub; shows `Alert` with "Open Settings" → `Linking.sendIntent('android.settings.USAGE_ACCESS_SETTINGS')`
  - `checkBlacklistUsage(sinceMs)`: iOS returns `detected: false`; **dev = 20% random trigger** (random package, 5–45 min) for testing Mirror flow; prod = sequential getRecentUsage calls (batch native call stub noted for optimization)
  - Threshold: 5+ minutes triggers detection
- **`useStatDecay.ts`** — replaced stub with real AppState listener:
  - `AppState.addEventListener('change')` fires `runCheck()` on every `background/inactive → active` transition
  - Also fires on mount (cold start coverage)
  - `checkingRef` prevents overlapping concurrent checks
  - On detection: computes `isCorrupted` from live hero stats, calls `setMirrorActive(true, isCorrupted, appName)`
  - All failures silent — never blocks the user
- **`useMirrorTrigger.ts`** (new hook): watches `mirrorActive` → imperatively calls `navigation.navigate('Mirror' | 'MirrorCorrupted', { appName })` via React Navigation parent traversal; `triggeredRef` prevents double-navigation on re-renders
- **`AppNavigator.tsx`** — added `AppGuard` component (renders null) that calls both `useStatDecay()` and `useMirrorTrigger()` inside the NavigationContainer context; wrapped Tab.Navigator in Fragment
- Build: zero errors

---

### Step 11 — generateJournalEntry Template Engine

- `EntryType` updated: added `'daily_status'` and `'stat_increase'`
- **45 templates** across 9 event types — all pure offline string functions, zero async
- `pick(arr, day, classIdx)` helper: deterministic selection via `(day + classIdx) % arr.length` — same hero+day always returns the same template, but rotates across days and varies by class
- `name` resolution: uses `hero.name` unless it's still the default 'The Unnamed', in which case falls back to `CLASS_TITLE`

| Type | Templates | Variant logic |
|---|---|---|
| `focus` | 8 (2×4 buckets) | `detail.duration` → <30min / 30–60 / 60–90 / 90+ |
| `doomscroll` | 6 (2×3 buckets) | `detail.duration` → <15min / 15–45 / 45+ |
| `quest` | 5 | `detail.questType` → daily(2) / weekly(2) / longterm(1) |
| `levelup` | 4 | interpolates `hero.level` |
| `streak` | 4 | `detail.streakDays` → 7 / 14 / 30 / 60+ |
| `party` | 4 (2×2) | `detail.outcome` → victory / defeat |
| `milestone` | 4 | rotation only |
| `daily_status` | 6 | rotation only — used by WarRoom home card |
| `stat_increase` | 4 | `detail.statName` interpolated |

- Prose style: third person, past/present tense alternating, tone varies (triumphant / contemplative / grim / matter-of-fact)
- LLM upgrade path: swap `generateJournalEntry` body only — signature unchanged
- Build: zero errors

---

---

### Step 12 — Stat Decay System

- `EntryType` updated: added `'stat_decay'`
- **`generateJournalEntry.ts`** — added 4 `STAT_DECAY_TEMPLATES` + `stat_decay` case; detail key `stats` is `string[]` of stat names; rendered as uppercased comma list in prose
- **`utils/statDecay.ts`** — full implementation (replaced stub):
  - `computeDecay(stat, currentValue, lastActivityAt, doomscrollDetected?)` — per-stat rules:
    - FOCUS: >24h + doomscroll detected today → −3
    - PHYSIQUE: >24h → −2; CRAFT/WISDOM: >48h → −2; DISCIPLINE: >36h → −4; AURA: >72h → −1
    - Floor: 10. Cap: 5 per day per stat.
  - `applyDailyDecay(hero, doomscrollDetected?)` → full `HeroStats` (calls `computeDecay` for all 6 stats)
  - `decayedStats(original, updated)` → `Array<keyof HeroStats>` (only stats that actually dropped)
- **`useAppStore.ts`** — added `lastDecayCheck: string | null`, `setLastDecayCheck`, `doomscrollDetectedToday: boolean`; `setMirrorActive` now sets `doomscrollDetectedToday = true` when `active = true` (FOCUS penalty tracking)
- **`useStatDecay.ts`** — added daily decay check alongside existing blacklist check in `runCheck()`:
  - `isDecayDueToday(lastDecayCheck)` guards against double-applying within the same calendar day
  - `setLastDecayCheck` fires *before* the async mutations to prevent race on double foreground events
  - If any stats decayed: `updateHeroMutation.mutateAsync({ stats })` → `addEntryMutation.mutateAsync({ type: 'stat_decay', ... })`
  - All values read through refs (heroRef, lastDecayCheckRef, doomscrollDetectedTodayRef) so the stable `[]`-dep effect always reads latest Zustand state
- **`journal.mock.ts`** — `mockAddEntry` now pushes to `MOCK_JOURNAL` array so decay entries appear in journal screen
- Build: zero errors

---

---

### Step 14 — Remaining Tab Screens

- `src/types/party.ts` — added `focusStat: number` to `PartyMember`; added `healthPercent: number` to `Party`
- `src/services/mock/party.mock.ts` — updated to 4-member party ("The Forge"): Scholar/Priya/Rohan/Kavya with focusStat 74/68/55/51; boss HP 1200/656 (544 damage dealt); 3-day countdown
- **QuestsScreen.tsx** — full implementation:
  - Three sections (Daily / Weekly / Long-Term) each with a type label + violet count badge
  - `QuestCard`: title, description, violet progress bar, progress fraction, gold XP reward; completed cards at 50% opacity with gold ✓
  - Completed section at bottom with dim badge
  - Empty state: italic violet text when no active quests
- **HeroScreen.tsx** — full implementation:
  - 120px HeroPortrait (stage computed from `levelToStage`), hero name/class/level, XP progress bar
  - SVG hexagonal radar chart (260×260 viewBox): 3 grid rings at 33/66/100%, 6 spoke lines, violet polygon fill + stroke at stat values, gold dots at each stat vertex, stat labels outside the hexagon
  - Talent tree: primary stats (from `HERO_CLASSES.primaryStats`) rendered as unlocked nodes (violet border + gold values); secondary stats as locked nodes (dim gray); first locked node has a Reanimated `withRepeat(withSequence)` scale pulse at 900ms
- **PartyScreen.tsx** — full implementation:
  - Empty state: centered Cinzel heading + gold CTA button
  - Party view: party name (gold), full-width party health bar (teal), boss countdown card (red accents + dashed border + boss HP bar + damage dealt text), member list with HeroPortrait(40)/name/class/FOCUS stat/XP today; member with highest `focusStat` gets gold VANGUARD badge
- Build: zero errors

---

### Step 15 — Navigation QA + Polish Pass

- `levelUtils.ts` — implemented `xpToLevel` and `xpProgressInLevel` (were stubs; hero was permanently Level 1)
- `WarRoomScreen` — XP bar now uses `xpProgressInLevel` (within-level progress); status line type corrected `streak` → `daily_status`
- `FocusScreen` — completion now calls `updateHero` to award XP + FOCUS stat gain; journal entry passes real `duration`; surrender uses `XP_REWARDS.surrenderPenalty` constant and correct `focus` journal type; `day` computed from `hero.createdAt` everywhere
- `MirrorScreen` / `MirrorCorruptedScreen` — `day: 1` hardcode fixed; `useOnboardingStore` heroName removed, uses `hero?.name`
- `LevelUpScreen` / `JournalScreen` — same heroName fix; removed stale `useOnboardingStore` imports
- `useAppStore` — `setLastDecayCheck` now resets `doomscrollDetectedToday` at day boundary; added `resetDoomscrollFlag`; added `persist` middleware (AsyncStorage) for `lastBlacklistCheck`, `lastDecayCheck`, `doomscrollDetectedToday`
- `useOnboardingStore` — added `persist` middleware (AsyncStorage); onboarding no longer replays on cold start
- `useStatDecay` — fixed stale closure: `lastBlacklistCheck` now read through `lastBlacklistCheckRef` like all other values
- `mockUpdateHero` — now mutates `MOCK_HERO` in-place; XP/stat changes persist within the session
- `types/party.ts` — `heroClass: string` → `heroClass: HeroClass` (union type safety)
- Build: 3.7MB bundle, zero errors

### Step 16 — Mock Data Polish

- `hero.mock.ts` — Arjun · Builder · Level 12 · 847 XP · FOCUS 74, PHYSIQUE 61, CRAFT 68, WISDOM 55, DISCIPLINE 70, AURA 48; `createdAt` 18 days ago; `lastActivityAt` 1h ago (AURA approaching decay threshold for demo)
- `quests.mock.ts` — Iron Trial progress 2/4 to show partial weekly progress in demo
- `party.mock.ts` — hero name updated to Arjun (Vanguard)
- `journal.mock.ts` — 8 pre-written RPG prose entries across 18 days: Day 1 (milestone/start), Day 3 (focus session), Day 7 (quest milestone), Day 11 (doomscroll slip), Day 14 (14-day streak milestone), Day 16 (stat decay), Day 17 (daily status), Day 18 (today's focus complete); `mockAddEntry` now uses `unshift` so new entries appear at top
- Build: zero errors

### Step 17 — Demo Build

- `npx expo export --platform android --no-minify` — 3.7MB bundle, zero TypeScript errors, zero warnings
- `DEMO_SCRIPT.md` created — 9-screen walkthrough with what to tap, what to say, what to highlight, known limitations to mention proactively
- `KNOWN_ISSUES.md` created — 3 HIGH, 5 MEDIUM, 7 LOW items; all non-blocking for demo
- BUILDLOG status updated to **MVP DEMO READY**

**APK build command:**
```bash
eas build --profile preview --platform android
```

## Up Next

Post-MVP (see workflow.md Step 18+):
- Step 18 — FastAPI backend (swap mock base URL)
- Step 19 — Real Android native module (UsageStats bridge)
- Step 20 — LLM journal entries (swap `generateJournalEntry` body)
- Step 21 — Push notifications
- Step 22 — Play Store submission

---

## Known Decisions

- **Intercept:** Android Usage Stats poller, within-app Mirror flow, iOS honor system
- **Portraits:** Procedural via Reanimated — no image assets
- **Journal:** Template engine MVP, LLM upgrade = swap `generateJournalEntry()` body only
- **Data:** React Query → mock layer, FastAPI migration = base URL swap only
- **Zustand:** UI/session state only — no domain data
- **Navigation:** React Navigation (not Expo Router) — full-screen modal overlays require stack above tab bar
- **Sigils:** Inline SVG geometry in each screen file — not imported from `assets/svgs/` stubs

---

## Design Reference

- All screen designs from Claude Design prototype
- Color palette: `#0A0A0A` bg · `#1A0533` deep purple · `#7B5CF0` violet · `#F4C542` gold · `#14B8A6` teal · `#EF4444` red
- Font: Cinzel (`Cinzel_400Regular`, `Cinzel_700Bold`) for all headings, system sans-serif for body
- Border radius: 12px cards · 8px buttons
- Dark theme only
