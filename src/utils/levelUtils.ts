import { LEVEL_THRESHOLDS, PORTRAIT_STAGE_BRACKETS } from '@/constants/xp';
import { PortraitStage } from '@/types/hero';

export function xpToLevel(totalXp: number): number {
  let accumulated = 0;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    accumulated += LEVEL_THRESHOLDS[i];
    if (totalXp < accumulated) return i + 1;
  }
  return LEVEL_THRESHOLDS.length + 1;
}

export function xpForNextLevel(level: number): number {
  return LEVEL_THRESHOLDS[level - 1] ?? 9999;
}

export function xpProgressInLevel(totalXp: number): { current: number; needed: number } {
  let accumulated = 0;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    const threshold = LEVEL_THRESHOLDS[i];
    if (totalXp < accumulated + threshold) {
      return { current: totalXp - accumulated, needed: threshold };
    }
    accumulated += threshold;
  }
  return { current: 0, needed: 9999 };
}

export function levelToStage(level: number): PortraitStage {
  for (const bracket of PORTRAIT_STAGE_BRACKETS) {
    if (level >= bracket.min && level <= bracket.max) return bracket.stage as PortraitStage;
  }
  return 1;
}
