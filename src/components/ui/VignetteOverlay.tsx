import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

interface VignetteOverlayProps {
  intensity?: 'subtle' | 'strong';
}

// Stub — full radial gradient vignette implementation comes in Mirror screen build phase.
export default function VignetteOverlay({ intensity = 'subtle' }: VignetteOverlayProps) {
  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        {
          borderWidth: intensity === 'subtle' ? 40 : 80,
          borderColor: `${Colors.red}33`,
          borderRadius: 0,
        },
      ]}
    />
  );
}
