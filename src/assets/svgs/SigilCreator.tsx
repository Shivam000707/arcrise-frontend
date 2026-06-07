import Svg, { Rect } from 'react-native-svg';
import { Colors } from '@/constants/colors';

interface SigilProps { size?: number; color?: string }

export default function SigilCreator({ size = 48, color = Colors.violet }: SigilProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Rect x="10" y="10" width="28" height="28" fill="none" stroke={color} strokeWidth={2} transform="rotate(45 24 24)" />
    </Svg>
  );
}
