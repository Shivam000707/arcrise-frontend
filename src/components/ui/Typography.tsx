import { Text, TextProps, TextStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

type TypographyProps = TextProps & { style?: TextStyle | TextStyle[] };

export function Heading({ style, ...props }: TypographyProps) {
  return (
    <Text
      style={[{ fontFamily: FontFamily.heading, color: Colors.white, letterSpacing: 2 }, style]}
      {...props}
    />
  );
}

export function HeadingBold({ style, ...props }: TypographyProps) {
  return (
    <Text
      style={[{ fontFamily: FontFamily.headingBold, color: Colors.white, letterSpacing: 2 }, style]}
      {...props}
    />
  );
}

export function Body({ style, ...props }: TypographyProps) {
  return (
    <Text style={[{ color: Colors.white, fontSize: FontSize.base }, style]} {...props} />
  );
}

export function Flavor({ style, ...props }: TypographyProps) {
  return (
    <Text
      style={[{ color: Colors.midGray, fontSize: FontSize.sm, fontStyle: 'italic' }, style]}
      {...props}
    />
  );
}

export function Label({ style, ...props }: TypographyProps) {
  return (
    <Text
      style={[{ color: Colors.midGray, fontSize: FontSize.xs, letterSpacing: 1 }, style]}
      {...props}
    />
  );
}
