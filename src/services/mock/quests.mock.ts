import { Quest } from '@/types/quest';

export const MOCK_QUESTS: Quest[] = [
  {
    id: 'q-daily-1',
    type: 'daily',
    title: 'The Focus Gauntlet',
    description: 'Complete a 90-min deep work session.',
    xpReward: 120,
    progress: 0,
    target: 1,
  },
  {
    id: 'q-weekly-1',
    type: 'weekly',
    title: 'The Iron Trial',
    description: 'Log 4 workouts this week.',
    xpReward: 300,
    progress: 0,
    target: 4,
  },
  {
    id: 'q-longterm-1',
    type: 'longterm',
    title: 'Ship Something Real',
    description: 'Launch a project a stranger can use.',
    xpReward: 800,
    progress: 0,
    target: 1,
  },
];

export async function mockGetQuests(): Promise<Quest[]> {
  return MOCK_QUESTS;
}

export async function mockCompleteQuest(questId: string): Promise<Quest> {
  const quest = MOCK_QUESTS.find((q) => q.id === questId);
  if (!quest) throw new Error(`Quest ${questId} not found`);
  return { ...quest, completedAt: new Date().toISOString() };
}
