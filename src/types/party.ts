import { HeroClass } from '@/types/hero';

export type PartyRole = 'vanguard' | 'guardian' | 'rogue';

export interface PartyMember {
  id: string;
  heroName: string;
  heroClass: HeroClass;
  role: PartyRole;
  dailyFocusXp: number;
  focusStat: number;
}

export interface Boss {
  name: string;
  maxHp: number;
  currentHp: number;
  endsAt: string;
}

export interface Party {
  id: string;
  name: string;
  healthPercent: number;
  members: PartyMember[];
  boss: Boss;
}
