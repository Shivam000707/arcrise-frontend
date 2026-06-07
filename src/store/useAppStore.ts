import { create } from 'zustand';

interface AppState {
  mirrorActive: boolean;
  mirrorCorrupted: boolean;
  detectedAppName: string | null;
  levelUpPending: boolean;
  pendingLevel: number | null;
  lastBlacklistCheck: string | null;
  lastDecayCheck: string | null;
  doomscrollDetectedToday: boolean;
  setMirrorActive: (active: boolean, corrupted?: boolean, appName?: string | null) => void;
  setLevelUpPending: (pending: boolean, level?: number) => void;
  setLastBlacklistCheck: (at: string) => void;
  setLastDecayCheck: (at: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  mirrorActive: false,
  mirrorCorrupted: false,
  detectedAppName: null,
  levelUpPending: false,
  pendingLevel: null,
  lastBlacklistCheck: null,
  lastDecayCheck: null,
  doomscrollDetectedToday: false,
  setMirrorActive: (active, corrupted = false, appName = null) =>
    set({
      mirrorActive: active,
      mirrorCorrupted: corrupted,
      detectedAppName: appName,
      // Record doomscroll detection so the decay system can apply the FOCUS penalty.
      ...(active ? { doomscrollDetectedToday: true } : {}),
    }),
  setLevelUpPending: (pending, level) => set({ levelUpPending: pending, pendingLevel: level ?? null }),
  setLastBlacklistCheck: (at) => set({ lastBlacklistCheck: at }),
  setLastDecayCheck: (at) => set({ lastDecayCheck: at }),
}));
