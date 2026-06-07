import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockGetJournal, mockAddEntry } from '@/services/mock/journal.mock';
import { JournalEntry } from '@/types/journal';

export function useJournalQuery() {
  return useQuery<JournalEntry[]>({
    queryKey: ['journal'],
    queryFn: mockGetJournal,
  });
}

export function useAddEntryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entry: Omit<JournalEntry, 'id'>) => mockAddEntry(entry),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['journal'] }),
  });
}
