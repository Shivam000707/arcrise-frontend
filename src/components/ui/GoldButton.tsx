import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { Radius } from '@/constants/layout';
import { FontFamily, FontSize } from '@/constants/typography';

interface GoldButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
}

export default function GoldButton({ label, onPress, style }: GoldButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          borderWidth: 1.5,
          borderColor: Colors.gold,
          borderRadius: Radius.button,
          paddingVertical: 16,
          alignItems: 'center',
        },
        style,
      ]}
      activeOpacity={0.75}
    >
      <Text
        style={{
          fontFamily: FontFamily.headingBold,
          color: Colors.gold,
          fontSize: FontSize.base,
          letterSpacing: 2,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
