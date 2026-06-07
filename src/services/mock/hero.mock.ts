import { Hero } from '@/types/hero';

export const MOCK_HERO: Hero = {
  id: 'hero-1',
  name: 'The Unnamed',
  heroClass: 'scholar',
  level: 1,
  xp: 0,
  stats: {
    focus: 50,
    physique: 50,
    craft: 50,
    wisdom: 50,
    discipline: 50,
    aura: 50,
  },
  createdAt: new Date().toISOString(),
  lastActivityAt: new Date().toISOString(),
};

export async function mockGetHero(): Promise<Hero> {
  return MOCK_HERO;
}

export async function mockUpdateHero(patch: Partial<Hero>): Promise<Hero> {
  return { ...MOCK_HERO, ...patch };
}

export async function mockLevelUp(heroId: string): Promise<Hero> {
  return { ...MOCK_HERO, level: MOCK_HERO.level + 1 };
}
