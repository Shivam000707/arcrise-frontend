import Svg, { Polygon } from 'react-native-svg';
import { Colors } from '@/constants/colors';

interface SigilProps { size?: number; color?: string }

// Stub — replace with commissioned geometric sigil in build phase.
export default function SigilBuilder({ size = 48, color = Colors.violet }: SigilProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Polygon points="24,4 44,44 4,44" fill="none" stroke={color} strokeWidth={2} />
    </Svg>
  );
}
