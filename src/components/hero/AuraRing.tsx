import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { HeroState } from '@/types/hero';

interface AuraRingProps {
  size: number;
  color: string;
  heroState?: HeroState;
}

export default function AuraRing({ size, color, heroState = 'thriving' }: AuraRingProps) {
  const scale   = useSharedValue(1);
  const opacity = useSharedValue(0.75);

  useEffect(() => {
    if (heroState === 'thriving') {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 1200 }),
          withTiming(1.0,  { duration: 1200 }),
        ),
        -1, false,
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 1200 }),
          withTiming(0.8, { duration: 1200 }),
        ),
        -1, false,
      );
    } else if (heroState === 'fading') {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 2000 }),
          withTiming(1.0,  { duration: 1600 }),
        ),
        -1, false,
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.3,  { duration: 1000 }),
          withTiming(0.18, { duration: 700  }),
          withTiming(0.35, { duration: 800  }),
          withTiming(0.22, { duration: 600  }),
        ),
        -1, false,
      );
    } else {
      // corrupted — erratic flicker
      scale.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 280 }),
          withTiming(1.0,  { duration: 180 }),
          withTiming(1.04, { duration: 350 }),
          withTiming(0.98, { duration: 120 }),
          withTiming(1.0,  { duration: 220 }),
        ),
        -1, false,
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.12, { duration: 100 }),
          withTiming(0.5,  { duration: 80  }),
          withTiming(0.22, { duration: 200 }),
          withTiming(0.48, { duration: 280 }),
          withTiming(0.08, { duration: 90  }),
          withTiming(0.42, { duration: 450 }),
        ),
        -1, false,
      );
    }
  }, [heroState]); // eslint-disable-line react-hooks/exhaustive-deps

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const ringSize = size * 1.18;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: ringSize,
          height: ringSize,
          borderRadius: ringSize / 2,
          borderWidth: 2,
          borderColor: color,
        },
        ringStyle,
      ]}
    />
  );
}
