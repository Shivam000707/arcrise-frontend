import { create } from 'zustand';

interface SessionState {
  active: boolean;
  startedAt: string | null;
  pausedAt: string | null;
  elapsed: number;
  targetDuration: number;
  start: (targetDuration: number) => void;
  pause: () => void;
  resume: () => void;
  end: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  active: false,
  startedAt: null,
  pausedAt: null,
  elapsed: 0,
  targetDuration: 90 * 60,
  start: (targetDuration) =>
    set({ active: true, startedAt: new Date().toISOString(), pausedAt: null, elapsed: 0, targetDuration }),
  pause: () => set({ pausedAt: new Date().toISOString() }),
  resume: () => set({ pausedAt: null }),
  end: () => set({ active: false, startedAt: null, pausedAt: null, elapsed: 0 }),
}));
