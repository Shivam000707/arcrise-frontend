import { JournalEntry } from '@/types/journal';

const d = (daysAgo: number) =>
  new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

export const MOCK_JOURNAL: JournalEntry[] = [
  {
    id: 'entry-18',
    day: 18,
    type: 'focus',
    prose: 'Arjun held the line for ninety minutes, unbroken. The Builder does not merely plan — he executes, and today the chronicle has proof.',
    isMilestone: false,
    createdAt: d(0),
  },
  {
    id: 'entry-17',
    day: 17,
    type: 'daily_status',
    prose: 'A quiet day. The work continued in silence. Not every entry demands fanfare — some days the arc advances one careful brick at a time.',
    isMilestone: false,
    createdAt: d(1),
  },
  {
    id: 'entry-16',
    day: 16,
    type: 'stat_decay',
    prose: 'The Aura dims when left untended. Arjun felt it — a hollowness where presence used to be. The chronicle marks the cost of absence.',
    isMilestone: false,
    createdAt: d(2),
  },
  {
    id: 'entry-14',
    day: 14,
    type: 'streak',
    prose: 'Fourteen days. The Forge remembers every one. What began as discipline has become identity. Arjun does not stop — he never stopped.',
    isMilestone: true,
    createdAt: d(4),
  },
  {
    id: 'entry-11',
    day: 11,
    type: 'doomscroll',
    prose: 'The Mirror appeared without warning. Arjun hesitated — and chose wrong. Forty-seven XP, gone. The chronicle records the slip without judgment, only truth.',
    isMilestone: false,
    createdAt: d(7),
  },
  {
    id: 'entry-7',
    day: 7,
    type: 'quest',
    prose: 'The Iron Trial: first two workouts logged before Wednesday. The Forge noticed. Priya challenged him to finish the set by Sunday.',
    isMilestone: true,
    createdAt: d(11),
  },
  {
    id: 'entry-3',
    day: 3,
    type: 'focus',
    prose: 'Sixty-two minutes — not the ninety he planned, but the Builder finished what he started. The ring closed. The XP was earned.',
    isMilestone: false,
    createdAt: d(15),
  },
  {
    id: 'entry-1',
    day: 1,
    type: 'milestone',
    prose: 'On the first day, Arjun stepped forward from the shadows of inertia and chose a different path. The arc had begun.',
    isMilestone: true,
    createdAt: d(17),
  },
];

export async function mockGetJournal(): Promise<JournalEntry[]> {
  return MOCK_JOURNAL;
}

export async function mockAddEntry(entry: Omit<JournalEntry, 'id'>): Promise<JournalEntry> {
  const newEntry = { ...entry, id: `entry-${Date.now()}` };
  MOCK_JOURNAL.unshift(newEntry);
  return newEntry;
}
