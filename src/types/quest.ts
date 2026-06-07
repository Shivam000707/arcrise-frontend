export type QuestType = 'daily' | 'weekly' | 'longterm';

export interface Quest {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  target: number;
  completedAt?: string;
}
