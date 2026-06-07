export const XP_REWARDS = {
  focusSessionComplete: 120,
  workoutLogged: 80,
  surrenderPenalty: -30,
  doomscrollPenalty: -47,
} as const;

// Level 1→2: 200 XP, grows ~15% per level. Index 0 = XP required to reach level 2.
export const LEVEL_THRESHOLDS: number[] = Array.from({ length: 100 }, (_, i) =>
  Math.floor(200 * Math.pow(1.15, i)),
);

export const PORTRAIT_STAGE_BRACKETS = [
  { min: 1, max: 10, stage: 1 },
  { min: 11, max: 25, stage: 2 },
  { min: 26, max: 45, stage: 3 },
  { min: 46, max: 70, stage: 4 },
  { min: 71, max: 100, stage: 5 },
] as const;
