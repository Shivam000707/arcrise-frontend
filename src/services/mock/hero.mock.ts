import { Hero } from '@/types/hero';

const CREATED_AT = new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(); // 18 days ago

export const MOCK_HERO: Hero = {
  id: 'hero-1',
  name: 'Arjun',
  heroClass: 'builder',
  level: 12,
  xp: 847,
  stats: {
    focus: 74,
    physique: 61,
    craft: 68,
    wisdom: 55,
    discipline: 70,
    aura: 48,
  },
  createdAt: CREATED_AT,
  // aura is close to 72h decay threshold — makes the fading state visible in demo
  lastActivityAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
};

export async function mockGetHero(): Promise<Hero> {
  return MOCK_HERO;
}

export async function mockUpdateHero(patch: Partial<Hero>): Promise<Hero> {
  Object.assign(MOCK_HERO, patch);
  return { ...MOCK_HERO };
}

export async function mockLevelUp(heroId: string): Promise<Hero> {
  return { ...MOCK_HERO, level: MOCK_HERO.level + 1 };
}
