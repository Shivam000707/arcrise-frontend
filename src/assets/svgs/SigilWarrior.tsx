import Svg, { Polygon, Line } from 'react-native-svg';
import { Colors } from '@/constants/colors';

interface SigilProps { size?: number; color?: string }

export default function SigilWarrior({ size = 48, color = Colors.violet }: SigilProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Polygon points="24,4 44,14 44,34 24,44 4,34 4,14" fill="none" stroke={color} strokeWidth={2} />
      <Line x1="24" y1="4" x2="24" y2="44" stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}
