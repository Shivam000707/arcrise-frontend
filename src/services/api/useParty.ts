import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockGetParty, mockDealDamage } from '@/services/mock/party.mock';
import { Party } from '@/types/party';

export function usePartyQuery() {
  return useQuery<Party>({
    queryKey: ['party'],
    queryFn: mockGetParty,
  });
}

export function usePartyDamageMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ partyId, damage }: { partyId: string; damage: number }) =>
      mockDealDamage(partyId, damage),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['party'] }),
  });
}
