import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HeroClass } from '@/types/hero';

interface OnboardingState {
  step: number;
  selectedClass: HeroClass | null;
  heroName: string;
  completed: boolean;
  setStep: (step: number) => void;
  setSelectedClass: (heroClass: HeroClass) => void;
  setHeroName: (name: string) => void;
  complete: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      step: 0,
      selectedClass: null,
      heroName: '',
      completed: false,
      setStep: (step) => set({ step }),
      setSelectedClass: (selectedClass) => set({ selectedClass }),
      setHeroName: (heroName) => set({ heroName }),
      complete: () => set({ completed: true }),
      reset: () => set({ step: 0, selectedClass: null, heroName: '', completed: false }),
    }),
    {
      name: 'arcrise-onboarding',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
