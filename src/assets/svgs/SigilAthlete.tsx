import Svg, { Polygon } from 'react-native-svg';
import { Colors } from '@/constants/colors';

interface SigilProps { size?: number; color?: string }

export default function SigilAthlete({ size = 48, color = Colors.violet }: SigilProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Polygon points="24,4 44,18 44,30 24,44 4,30 4,18" fill="none" stroke={color} strokeWidth={2} />
    </Svg>
  );
}
