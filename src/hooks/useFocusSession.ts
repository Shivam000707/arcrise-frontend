export interface FocusSessionActions {
  start: (targetMinutes: number) => void;
  pause: () => void;
  resume: () => void;
  surrender: () => void;
  complete: () => void;
}

export function useFocusSession(): FocusSessionActions {
  // stub
  return {
    start: () => {},
    pause: () => {},
    resume: () => {},
    surrender: () => {},
    complete: () => {},
  };
}
