import { Hero, HeroStats } from '@/types/hero';

const STAT_MIN = 10;
const MAX_DECAY_PER_DAY = 5;

function hoursSince(isoDate: string): number {
  return (Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60);
}

// Per-stat decay rules. FOCUS only decays when a doomscroll app was detected today.
export function computeDecay(
  stat: keyof HeroStats,
  currentValue: number,
  lastActivityAt: string,
  doomscrollDetected = false,
): number {
  const hours = hoursSince(lastActivityAt);
  let decay = 0;

  switch (stat) {
    case 'focus':
      if (hours > 24 && doomscrollDetected) decay = 3;
      break;
    case 'physique':
      if (hours > 24) decay = 2;
      break;
    case 'craft':
      if (hours > 48) decay = 2;
      break;
    case 'wisdom':
      if (hours > 48) decay = 2;
      break;
    case 'discipline':
      if (hours > 36) decay = 4;
      break;
    case 'aura':
      if (hours > 72) decay = 1;
      break;
  }

  return Math.max(STAT_MIN, currentValue - Math.min(decay, MAX_DECAY_PER_DAY));
}

export function applyDailyDecay(hero: Hero, doomscrollDetected = false): HeroStats {
  const { stats, lastActivityAt } = hero;
  return {
    focus:      computeDecay('focus',      stats.focus,      lastActivityAt, doomscrollDetected),
    physique:   computeDecay('physique',   stats.physique,   lastActivityAt),
    craft:      computeDecay('craft',      stats.craft,      lastActivityAt),
    wisdom:     computeDecay('wisdom',     stats.wisdom,     lastActivityAt),
    discipline: computeDecay('discipline', stats.discipline, lastActivityAt),
    aura:       computeDecay('aura',       stats.aura,       lastActivityAt),
  };
}

// Returns the stat keys where value actually dropped after decay.
export function decayedStats(original: HeroStats, updated: HeroStats): Array<keyof HeroStats> {
  return (Object.keys(original) as Array<keyof HeroStats>).filter(
    (k) => updated[k] < original[k],
  );
}
