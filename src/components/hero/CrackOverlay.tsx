import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import CrackOverlaySvg from '@/assets/svgs/CrackOverlaySvg';

interface CrackOverlayProps {
  size: number;
  visible: boolean;
}

// Cracks shimmer faintly when visible to reinforce the corrupted flicker.
export default function CrackOverlay({ size, visible }: CrackOverlayProps) {
  const opacity = useSharedValue(visible ? 1 : 0);

  React.useEffect(() => {
    if (!visible) {
      opacity.value = 0;
      return;
    }
    opacity.value = withRepeat(
      withSequence(
        withTiming(1.0,  { duration: 400 }),
        withTiming(0.65, { duration: 200 }),
        withTiming(0.9,  { duration: 300 }),
        withTiming(0.75, { duration: 180 }),
      ),
      -1, false,
    );
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!visible) return null;

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, style]}>
      <CrackOverlaySvg size={size} />
    </Animated.View>
  );
}
