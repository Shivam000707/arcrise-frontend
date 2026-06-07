import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockGetQuests, mockCompleteQuest } from '@/services/mock/quests.mock';
import { Quest } from '@/types/quest';

export function useQuestsQuery() {
  return useQuery<Quest[]>({
    queryKey: ['quests'],
    queryFn: mockGetQuests,
  });
}

export function useCompleteQuestMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (questId: string) => mockCompleteQuest(questId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quests'] }),
  });
}
