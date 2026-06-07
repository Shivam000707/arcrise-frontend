import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '@/constants/colors';

interface SigilProps { size?: number; color?: string }

export default function SigilScholar({ size = 48, color = Colors.violet }: SigilProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Circle cx="24" cy="24" r="18" fill="none" stroke={color} strokeWidth={2} />
      <Line x1="24" y1="6" x2="24" y2="42" stroke={color} strokeWidth={1.5} />
      <Line x1="6" y1="24" x2="42" y2="24" stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}
