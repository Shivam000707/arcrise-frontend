import { JournalEntry } from '@/types/journal';

export const MOCK_JOURNAL: JournalEntry[] = [
  {
    id: 'entry-1',
    day: 1,
    type: 'milestone',
    prose:
      'On the first day, the Scholar stepped forward from the shadows of inertia and chose a different path. The arc had begun.',
    isMilestone: true,
    createdAt: new Date().toISOString(),
  },
];

export async function mockGetJournal(): Promise<JournalEntry[]> {
  return MOCK_JOURNAL;
}

export async function mockAddEntry(entry: Omit<JournalEntry, 'id'>): Promise<JournalEntry> {
  const newEntry = { ...entry, id: `entry-${Date.now()}` };
  MOCK_JOURNAL.push(newEntry);
  return newEntry;
}
