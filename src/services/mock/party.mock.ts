import { Party } from '@/types/party';

export const MOCK_PARTY: Party = {
  id: 'party-1',
  name: 'The Forge',
  healthPercent: 82,
  members: [
    { id: 'm-1', heroName: 'Arjun',  heroClass: 'builder', role: 'vanguard', dailyFocusXp: 120, focusStat: 74 },
    { id: 'm-2', heroName: 'Priya',  heroClass: 'warrior', role: 'guardian', dailyFocusXp: 80,  focusStat: 68 },
    { id: 'm-3', heroName: 'Rohan',  heroClass: 'builder', role: 'rogue',    dailyFocusXp: 40,  focusStat: 55 },
    { id: 'm-4', heroName: 'Kavya',  heroClass: 'creator', role: 'rogue',    dailyFocusXp: 0,   focusStat: 51 },
  ],
  boss: {
    name: 'The Distraction Wraith',
    maxHp: 1200,
    currentHp: 656,
    endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
};

export async function mockGetParty(): Promise<Party> {
  return MOCK_PARTY;
}

export async function mockDealDamage(partyId: string, damage: number): Promise<Party> {
  return {
    ...MOCK_PARTY,
    boss: { ...MOCK_PARTY.boss, currentHp: Math.max(0, MOCK_PARTY.boss.currentHp - damage) },
  };
}
