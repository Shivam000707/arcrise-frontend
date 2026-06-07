import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { useHeroQuery, useUpdateHeroMutation } from '@/services/api/useHero';
import { useAddEntryMutation } from '@/services/api/useJournal';
import { heroStateFromStats } from '@/utils/heroVisuals';
import { applyDailyDecay, decayedStats } from '@/utils/statDecay';
import { generateJournalEntry } from '@/services/journal/generateJournalEntry';
import {
  checkBlacklistUsage,
  requestUsagePermissionIfNeeded,
} from '@/services/usageStats/UsageStatsService';

function isDecayDueToday(lastDecayCheck: string | null): boolean {
  if (!lastDecayCheck) return true;
  const last = new Date(lastDecayCheck);
  const now = new Date();
  return (
    last.getFullYear() !== now.getFullYear() ||
    last.getMonth() !== now.getMonth() ||
    last.getDate() !== now.getDate()
  );
}

// Listens for app foreground events, runs two background checks on each transition:
// 1. Blacklist usage check → triggers Mirror screen if a doomscroll app is detected.
// 2. Daily decay check → reduces hero stats once per calendar day and logs a journal entry.
// Must be called from inside NavigationContainer (via AppGuard in AppNavigator).
export function useStatDecay(): void {
  const setMirrorActive         = useAppStore((s) => s.setMirrorActive);
  const lastBlacklistCheck      = useAppStore((s) => s.lastBlacklistCheck);
  const setLastBlacklistCheck   = useAppStore((s) => s.setLastBlacklistCheck);
  const lastDecayCheck          = useAppStore((s) => s.lastDecayCheck);
  const setLastDecayCheck       = useAppStore((s) => s.setLastDecayCheck);
  const doomscrollDetectedToday = useAppStore((s) => s.doomscrollDetectedToday);

  const { data: hero } = useHeroQuery();
  const updateHero     = useUpdateHeroMutation();
  const addEntry       = useAddEntryMutation();

  const appStateRef   = useRef<AppStateStatus>(AppState.currentState);
  const checkingRef   = useRef(false);

  // Keep refs current so the stable useEffect closure always reads latest values.
  const heroRef                    = useRef(hero);
  const lastDecayCheckRef          = useRef(lastDecayCheck);
  const doomscrollDetectedTodayRef = useRef(doomscrollDetectedToday);
  const updateHeroRef              = useRef(updateHero);
  const addEntryRef                = useRef(addEntry);
  heroRef.current                    = hero;
  lastDecayCheckRef.current          = lastDecayCheck;
  doomscrollDetectedTodayRef.current = doomscrollDetectedToday;
  updateHeroRef.current              = updateHero;
  addEntryRef.current                = addEntry;

  useEffect(() => {
    const runCheck = async () => {
      if (checkingRef.current) return;
      checkingRef.current = true;

      try {
        // ── Blacklist check ────────────────────────────────────────────────
        const permissionGranted = await requestUsagePermissionIfNeeded();
        if (permissionGranted || __DEV__) {
          const sinceMs = lastBlacklistCheck
            ? new Date(lastBlacklistCheck).getTime()
            : Date.now() - 60 * 60 * 1000;

          const result = await checkBlacklistUsage(sinceMs);
          setLastBlacklistCheck(new Date().toISOString());

          if (result.detected && result.appName) {
            const currentHero = heroRef.current;
            const isCorrupted = currentHero
              ? heroStateFromStats(currentHero.stats, currentHero.lastActivityAt) === 'corrupted'
              : false;
            setMirrorActive(true, isCorrupted, result.appName);
          }
        }

        // ── Daily decay check ──────────────────────────────────────────────
        const currentHero = heroRef.current;
        if (currentHero && isDecayDueToday(lastDecayCheckRef.current)) {
          const updatedStats = applyDailyDecay(currentHero, doomscrollDetectedTodayRef.current);
          const changed      = decayedStats(currentHero.stats, updatedStats);

          // Mark decay as done for today before the async mutations to prevent
          // a second foreground event from double-applying.
          setLastDecayCheck(new Date().toISOString());

          if (changed.length > 0) {
            await updateHeroRef.current.mutateAsync({ stats: updatedStats });
            const day = Math.max(
              1,
              Math.floor(
                (Date.now() - new Date(currentHero.createdAt).getTime()) /
                  (1000 * 60 * 60 * 24),
              ) + 1,
            );
            await addEntryRef.current.mutateAsync({
              day,
              type: 'stat_decay',
              prose: generateJournalEntry(
                { type: 'stat_decay', detail: { stats: changed } },
                { ...currentHero, stats: updatedStats },
              ),
              isMilestone: false,
              createdAt: new Date().toISOString(),
            });
          }
        }
      } catch {
        // Background checks are silent — never block the user
      } finally {
        checkingRef.current = false;
      }
    };

    // Run immediately on mount (covers cold-start foreground)
    runCheck();

    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      const wasBackground = appStateRef.current.match(/inactive|background/);
      if (wasBackground && next === 'active') {
        runCheck();
      }
      appStateRef.current = next;
    });

    return () => sub.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
