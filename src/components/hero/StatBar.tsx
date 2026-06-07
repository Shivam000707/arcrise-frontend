import { View, Text } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontSize } from '@/constants/typography';

interface StatBarProps {
  name: string;
  value: number;
  trend?: 'up' | 'down' | 'stable';
}

export default function StatBar({ name, value, trend = 'stable' }: StatBarProps) {
  const trendColor = trend === 'up' ? Colors.teal : trend === 'down' ? Colors.red : Colors.midGray;
  const trendSymbol = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 2 }}>
      <Text style={{ color: Colors.midGray, fontSize: FontSize.xs, width: 80, letterSpacing: 1 }}>
        {name.toUpperCase()}
      </Text>
      <Text style={{ color: Colors.white, fontSize: FontSize.base, fontVariant: ['tabular-nums'] }}>
        {value}
      </Text>
      <Text style={{ color: trendColor, fontSize: FontSize.sm }}>{trendSymbol}</Text>
    </View>
  );
}
