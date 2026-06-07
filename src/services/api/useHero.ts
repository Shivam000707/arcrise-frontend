import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockGetHero, mockUpdateHero, mockLevelUp } from '@/services/mock/hero.mock';
import { Hero } from '@/types/hero';

export function useHeroQuery() {
  return useQuery<Hero>({
    queryKey: ['hero'],
    queryFn: mockGetHero,
  });
}

export function useUpdateHeroMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Hero>) => mockUpdateHero(patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hero'] }),
  });
}

export function useLevelUpMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (heroId: string) => mockLevelUp(heroId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hero'] }),
  });
}
