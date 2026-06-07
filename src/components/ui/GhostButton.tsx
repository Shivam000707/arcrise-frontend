import { TouchableOpacity, Text, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontSize } from '@/constants/typography';

interface GhostButtonProps {
  label: string;
  onPress: () => void;
  color?: string;
  style?: ViewStyle;
}

export default function GhostButton({
  label,
  onPress,
  color = Colors.red,
  style,
}: GhostButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[{ padding: 12, alignItems: 'center' }, style]} activeOpacity={0.5}>
      <Text style={{ color, fontSize: FontSize.sm, opacity: 0.6 }}>{label}</Text>
    </TouchableOpacity>
  );
}
