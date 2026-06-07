import { LEVEL_THRESHOLDS, PORTRAIT_STAGE_BRACKETS } from '@/constants/xp';
import { PortraitStage } from '@/types/hero';

export function xpToLevel(totalXp: number): number {
  // stub
  return 1;
}

export function xpForNextLevel(level: number): number {
  return LEVEL_THRESHOLDS[level - 1] ?? 9999;
}

export function xpProgressInLevel(totalXp: number): { current: number; needed: number } {
  // stub
  return { current: 0, needed: 200 };
}

export function levelToStage(level: number): PortraitStage {
  for (const bracket of PORTRAIT_STAGE_BRACKETS) {
    if (level >= bracket.min && level <= bracket.max) return bracket.stage as PortraitStage;
  }
  return 1;
}
