import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  size: number;
  strokeWidth?: number;
  progress: number; // 0–1
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
}

export default function ProgressRing({
  size,
  strokeWidth = 6,
  progress,
  color = Colors.violet,
  trackColor,
  children,
}: ProgressRingProps) {
  const r = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;

  const animOffset = useSharedValue(circumference);

  useEffect(() => {
    animOffset.value = withTiming(circumference * (1 - progress), { duration: 500 });
  }, [progress, circumference]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: animOffset.value,
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg
        width={size}
        height={size}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
      >
        {/* Track ring */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={trackColor ?? 'rgba(123,92,240,0.2)'}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated progress ring */}
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
        />
      </Svg>
      {children}
    </View>
  );
}
