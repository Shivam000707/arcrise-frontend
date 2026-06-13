# ArcRise — Known Issues

> Status: MVP Demo Ready  
> These are non-blocking for the demo. Fix in next sprint.

---

## High Priority (fix before first user testing)

| # | File | Issue |
|---|---|---|
| H1 | `useOnboardingStore` / `useAppStore` | Persistence added but no migration strategy — if the store shape changes, old AsyncStorage data will cause a parse error. Add a `version` + `migrate` function to the persist config before any schema change. |
| H2 | `UsageStatsService.ts:60` | `hasUsagePermission()` stubs to `return true`. Wire the real `NativeModules.UsageStatsModule.hasUsagePermission()` call before connecting the native bridge. |
| H3 | `UsageStatsService.ts:98` | `__DEV__` 20% random Mirror trigger should be gated behind `APP_VARIANT === 'development'` (via `expo-constants`) so internal preview builds behave like production. |

---

## Medium Priority (fix before public release)

| # | File | Issue |
|---|---|---|
| M1 | `useSessionStore.ts` / `useCountdownTimer.ts` | Timer uses `Date.now()` wall-clock delta. Device clock changes mid-session can reset or skip the timer. Switch elapsed tracking to `performance.now()` for monotonic accuracy. |
| M2 | `useSessionStore.ts:22` | `startedAt` is fully client-controlled in-memory. On rooted devices, Zustand state can be manipulated to backdate `startedAt` and earn XP instantly. Requires server-side XP validation when backend lands. |
| M3 | `HeroNamingScreen.tsx` | Hero name only gets `.trim()` before storage. Strip RTL override characters and control characters before saving. When the LLM journal upgrade ships, name must be passed as a structured param, not interpolated into the prompt string. |
| M4 | `FocusScreen.tsx:64` | `completedRef` is a local `useRef` that resets on screen remount. If the user navigates away mid-session and returns, the completion handler can double-fire. Move completion state into `useSessionStore`. |
| M5 | `useFocusSession.ts` | Hook is entirely stub (5 empty no-op functions). Either implement it and use it in `FocusScreen`, or delete it. Currently dead code. |

---

## Low Priority / Polish

| # | File | Issue |
|---|---|---|
| L1 | `useSessionStore.ts:7` | `elapsed` field in the store is always `0` — it's tracked externally by `useCountdownTimer` and never written back. Either remove the field or wire it up. |
| L2 | `PartyScreen.tsx:17` | `stage={2}` hardcoded for all party members. Add a `level` or `stage` field to `PartyMember` type to reflect real member progression. |
| L3 | `WarRoomScreen.tsx:102` | `generateJournalEntry` (write-path service) is used for a read-only display string. Fine for MVP; extract a pure `generateStatusLine()` utility before the LLM upgrade. |
| L4 | `generateJournalEntry.ts:269` | `STAT_INCREASE_TEMPLATES` index 2 is `(n, day) =>` — takes only 2 args, silently drops the stat name. Add `stat` as the third parameter. |
| L5 | Entire app | No React `ErrorBoundary` component. Unexpected render errors produce a white screen with no recovery. Wrap `RootNavigator` in an `ErrorBoundary`. |
| L6 | `FocusScreen.tsx:127` | `handleSurrender` `mutateAsync` not in a try/catch. Failed mutation throws an unhandled promise rejection. Wrap in try/catch with a user-facing error state. |
| L7 | `app.json:20` | `PACKAGE_USAGE_STATS` in `android.permissions` adds the manifest tag but does NOT auto-grant the permission (it requires manual user grant via Settings). Add a comment so future devs don't assume it's automatic. |
