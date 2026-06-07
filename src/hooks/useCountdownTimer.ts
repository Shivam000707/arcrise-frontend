import { useState, useEffect, useRef } from 'react';

export interface CountdownTimer {
  elapsed: number;
  remaining: number;
  percent: number;
  isComplete: boolean;
}

export function useCountdownTimer(
  startedAt: string | null,
  targetDuration: number,
  paused: boolean,
): CountdownTimer {
  const [elapsed, setElapsed] = useState(0);
  const pauseAccumRef = useRef(0);
  const pauseStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (paused) {
      if (pauseStartRef.current === null) {
        pauseStartRef.current = Date.now();
      }
      return;
    }

    if (pauseStartRef.current !== null) {
      pauseAccumRef.current += (Date.now() - pauseStartRef.current) / 1000;
      pauseStartRef.current = null;
    }

    if (!startedAt) {
      setElapsed(0);
      pauseAccumRef.current = 0;
      return;
    }

    const startMs = new Date(startedAt).getTime();

    const tick = () => {
      const raw = (Date.now() - startMs) / 1000 - pauseAccumRef.current;
      setElapsed(Math.min(Math.max(0, Math.floor(raw)), targetDuration));
    };

    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [startedAt, paused, targetDuration]);

  const remaining = Math.max(0, targetDuration - elapsed);
  const percent = targetDuration > 0 ? Math.min(1, elapsed / targetDuration) : 0;
  const isComplete = startedAt !== null && elapsed >= targetDuration && targetDuration > 0;

  return { elapsed, remaining, percent, isComplete };
}
