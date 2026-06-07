export type OnboardingStackParamList = {
  Awakening: undefined;
  ClassSelect: undefined;
  HeroNaming: undefined;
};

export type TabParamList = {
  WarRoom: undefined;
  Quests: undefined;
  Journal: undefined;
  Hero: undefined;
  Party: undefined;
};

export type ModalStackParamList = {
  App: undefined;
  Focus: undefined;
  Mirror: { appName?: string };
  MirrorCorrupted: { appName?: string };
  LevelUp: {
    newLevel: number;
    className?: string;
    statIncreases?: Array<{ stat: string; from: number; to: number; color: string }>;
    talentUnlock?: { name: string; description: string };
  };
};

export type RootStackParamList = {
  Onboarding: undefined;
  Modal: undefined;
};
