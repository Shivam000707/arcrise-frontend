import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  resetDoomscrollFlag: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
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
          ...(active ? { doomscrollDetectedToday: true } : {}),
        }),
      setLevelUpPending: (pending, level) => set({ levelUpPending: pending, pendingLevel: level ?? null }),
      setLastBlacklistCheck: (at) => set({ lastBlacklistCheck: at }),
      setLastDecayCheck: (at) => set({ lastDecayCheck: at, doomscrollDetectedToday: false }),
      resetDoomscrollFlag: () => set({ doomscrollDetectedToday: false }),
    }),
    {
      name: 'arcrise-app',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        lastBlacklistCheck: state.lastBlacklistCheck,
        lastDecayCheck: state.lastDecayCheck,
        doomscrollDetectedToday: state.doomscrollDetectedToday,
      }),
    },
  ),
);
