import { HeroStats, HeroState } from '@/types/hero';

export function heroStateFromStats(stats: HeroStats, _lastActivityAt: string): HeroState {
  const values = Object.values(stats);
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  const anyBelow25 = values.some((v) => v < 25);
  if (avg < 40 || anyBelow25) return 'corrupted';
  if (avg <= 65) return 'fading';
  return 'thriving';
}

export function auraColorFromState(state: HeroState): string {
  switch (state) {
    case 'thriving': return '#7B5CF0';
    case 'fading': return '#4B3A8A';
    case 'corrupted': return '#EF4444';
  }
}

export function saturationFromState(state: HeroState): number {
  switch (state) {
    case 'thriving': return 1;
    case 'fading': return 0.6;
    case 'corrupted': return 0.2;
  }
}
