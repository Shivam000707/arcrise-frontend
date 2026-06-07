import { View } from 'react-native';
import { Colors } from '@/constants/colors';

interface BossHealthBarProps {
  percent: number; // 0–1
}

// Stub — Reanimated width animation implemented in build phase.
export default function BossHealthBar({ percent }: BossHealthBarProps) {
  return (
    <View
      style={{
        height: 6,
        backgroundColor: Colors.darkGray,
        borderRadius: 3,
        marginTop: 8,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${Math.round(percent * 100)}%`,
          height: '100%',
          backgroundColor: Colors.red,
          borderRadius: 3,
        }}
      />
    </View>
  );
}
