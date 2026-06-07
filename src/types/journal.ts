export type EntryType =
  | 'focus'
  | 'doomscroll'
  | 'quest'
  | 'levelup'
  | 'streak'
  | 'party'
  | 'milestone'
  | 'daily_status'
  | 'stat_increase'
  | 'stat_decay';

export interface JournalEntry {
  id: string;
  day: number;
  type: EntryType;
  prose: string;
  isMilestone: boolean;
  createdAt: string;
}
