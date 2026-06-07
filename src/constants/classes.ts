import { HeroClass, HeroStats } from '@/types/hero';

export interface HeroClassDefinition {
  id: HeroClass;
  name: string;
  flavorText: string;
  sigilKey: string;
  primaryStats: (keyof HeroStats)[];
}

export const HERO_CLASSES: HeroClassDefinition[] = [
  {
    id: 'builder',
    name: 'The Builder',
    flavorText: 'You see systems where others see chaos.',
    sigilKey: 'builder',
    primaryStats: ['craft', 'focus', 'discipline'],
  },
  {
    id: 'athlete',
    name: 'The Athlete',
    flavorText: 'Your body is your first project.',
    sigilKey: 'athlete',
    primaryStats: ['physique', 'discipline', 'focus'],
  },
  {
    id: 'creator',
    name: 'The Creator',
    flavorText: 'The world needs what only you can make.',
    sigilKey: 'creator',
    primaryStats: ['craft', 'aura', 'wisdom'],
  },
  {
    id: 'scholar',
    name: 'The Scholar',
    flavorText: 'Knowledge is the only weapon that compounds.',
    sigilKey: 'scholar',
    primaryStats: ['wisdom', 'focus', 'craft'],
  },
  {
    id: 'warrior',
    name: 'The Warrior',
    flavorText: 'You are not building a career. You are forging a character.',
    sigilKey: 'warrior',
    primaryStats: ['discipline', 'physique', 'aura'],
  },
];
