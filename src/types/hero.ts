export type HeroClass = 'builder' | 'athlete' | 'creator' | 'scholar' | 'warrior';
export type HeroState = 'thriving' | 'fading' | 'corrupted';
export type PortraitStage = 1 | 2 | 3 | 4 | 5;

export interface HeroStats {
  focus: number;
  physique: number;
  craft: number;
  wisdom: number;
  discipline: number;
  aura: number;
}

export interface Hero {
  id: string;
  name: string;
  heroClass: HeroClass;
  level: number;
  xp: number;
  stats: HeroStats;
  createdAt: string;
  lastActivityAt: string;
}
