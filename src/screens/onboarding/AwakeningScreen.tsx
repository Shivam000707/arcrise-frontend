import { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OnboardingStackParamList } from '@/navigation/types';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import GoldButton from '@/components/ui/GoldButton';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Awakening'>;

const { width: SW, height: SH } = Dimensions.get('window');

// Silhouette: larger to match reference (~64% screen width)
const SIL_W = SW * 0.64;
const SIL_H = SIL_W * 1.42;
const TRAVEL = SH * 0.52;

// Embers originate below the horizon line and rise upward through the composition
const EMBERS = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  x: 20 + Math.random() * (SW - 40),
  startY: SH * 0.63 + Math.random() * (SH * 0.22),
  size: 1.5 + Math.random() * 2.5,
  duration: 2800 + Math.random() * 2600,
  delay: Math.random() * 2800,
  color: [Colors.gold, Colors.violet, Colors.amber][i % 3],
}));

// ─── Ember particle ───────────────────────────────────────────────────────────

interface EmberProps {
  id: number; x: number; startY: number;
  size: number; duration: number; delay: number; color: string;
}

function EmberParticle({ x, startY, size, duration, delay, color }: EmberProps) {
  const ty = useSharedValue(0);
  const op = useSharedValue(0);

  useEffect(() => {
    ty.value = withDelay(
      delay,
      withRepeat(withTiming(-TRAVEL, { duration, easing: Easing.linear }), -1, false),
    );
    op.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.9,  { duration: duration * 0.25 }),
          withTiming(0.55, { duration: duration * 0.5  }),
          withTiming(0,    { duration: duration * 0.25 }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }],
    opacity: op.value,
  }));

  return (
    <Animated.View
      style={[
        { position: 'absolute', left: x, top: startY,
          width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        style,
      ]}
    />
  );
}

// ─── Horizon line ─────────────────────────────────────────────────────────────
// Full-width glowing line at the figure's hem — the "ground" of the cinematic world.

function HorizonLine() {
  return (
    <View pointerEvents="none" style={s.horizonWrap}>
      {/* Wide diffuse spread above the line */}
      <LinearGradient
        colors={['transparent', 'rgba(123,92,240,0.22)', 'rgba(244,197,66,0.35)', 'rgba(123,92,240,0.22)', 'transparent']}
        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
        style={s.horizonSpread}
      />
      {/* The bright 1.5px line */}
      <LinearGradient
        colors={['transparent', Colors.violet, Colors.gold, Colors.violet, 'transparent']}
        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
        style={s.horizonLine}
      />
      {/* Soft bleed below */}
      <LinearGradient
        colors={['transparent', 'rgba(123,92,240,0.12)', 'rgba(244,197,66,0.18)', 'rgba(123,92,240,0.12)', 'transparent']}
        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
        style={s.horizonBelow}
      />
    </View>
  );
}

// ─── Warrior silhouette ───────────────────────────────────────────────────────

// Hood: wide rounded dome. Body: shoulder pinch, cloak flares at hem (y=258).
const HOOD_AND_BODY = `
  M 100 16
  C 68 16, 36 40, 36 74
  C 36 90, 48 101, 53 114
  L 34 258
  L 166 258
  L 147 114
  C 152 101, 164 90, 164 74
  C 164 40, 132 16, 100 16
  Z
`;

function WarriorSilhouette() {
  return (
    <Svg width={SIL_W} height={SIL_H} viewBox="0 0 200 280">
      <Defs>
        {/* Ground glow: gold at centre, violet spreading outward at the hem */}
        <RadialGradient id="hglow" cx="50%" cy="95%" rx="78%" ry="26%">
          <Stop offset="0%"   stopColor={Colors.gold}       stopOpacity={0.75} />
          <Stop offset="25%"  stopColor={Colors.amber}      stopOpacity={0.55} />
          <Stop offset="55%"  stopColor={Colors.violet}     stopOpacity={0.38} />
          <Stop offset="80%"  stopColor={Colors.deepPurple} stopOpacity={0.18} />
          <Stop offset="100%" stopColor={Colors.background} stopOpacity={0}    />
        </RadialGradient>
        {/* Upper backlight halo behind the torso and hood */}
        <RadialGradient id="bglow" cx="50%" cy="54%" rx="50%" ry="34%">
          <Stop offset="0%"   stopColor="#A07AFF"           stopOpacity={0.52} />
          <Stop offset="40%"  stopColor="#4A22A0"           stopOpacity={0.28} />
          <Stop offset="75%"  stopColor="#1A0533"           stopOpacity={0.12} />
          <Stop offset="100%" stopColor={Colors.background} stopOpacity={0}    />
        </RadialGradient>
      </Defs>

      {/* Ground glow — sits at the hem, fans outward */}
      <Ellipse cx={100} cy={265} rx={162} ry={55} fill="url(#hglow)" />

      {/* Violet backlight behind upper figure */}
      <Ellipse cx={100} cy={155} rx={92} ry={78} fill="url(#bglow)" />

      {/* Silhouette path — #0A0A0A fill cuts out the glow inside the shape;
          violet stroke gives a luminous edge-backlight effect */}
      <Path
        d={HOOD_AND_BODY}
        fill={Colors.background}
        stroke={Colors.violet}
        strokeWidth={3}
        strokeOpacity={0.65}
      />
    </Svg>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AwakeningScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useSharedValue(0);

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) });
  }, []);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: fadeAnim.value }));

  return (
    <View style={s.root}>

      {/* Embers — behind everything, no pointer events */}
      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        {EMBERS.map((e) => <EmberParticle key={e.id} {...e} />)}
      </View>

      <Animated.View style={[StyleSheet.absoluteFillObject, fadeStyle]}>

        {/* ① Eyebrow */}
        <View style={[s.eyebrowRow, { top: insets.top + 20 }]}>
          <Text style={s.eyebrow}>YOUR STORY BEGINS</Text>
        </View>

        {/* ② Heading + italic — "LIVE AS NPCs IN" on line 2, "THEIR OWN STORY." on line 3 */}
        <View style={[s.textBlock, { top: insets.top + 64 }]}>
          <Text style={s.heading}>
            {'MOST PEOPLE\nLIVE AS '}
            <Text style={s.headingGold}>NPCs</Text>
            {' IN\nTHEIR OWN STORY.'}
          </Text>
          <Text style={s.subtext}>But you opened this app.</Text>
        </View>

        {/* ③ Warrior silhouette with embedded glow gradients */}
        <View style={s.silhouetteWrap}>
          <WarriorSilhouette />
        </View>

        {/* ④ Horizon line — at the figure's hem, spans full width */}
        <HorizonLine />

        {/* ⑤ CTA + disclaimer */}
        <View style={[s.bottomWrap, { paddingBottom: insets.bottom + 20 }]}>
          <GoldButton
            label="BEGIN YOUR ARC  →"
            onPress={() => navigation.navigate('ClassSelect')}
            style={s.ctaStretch}
          />
          <Text style={s.disclaimer}>No account needed. Just your ambition.</Text>
        </View>

      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ① eyebrow
  eyebrowRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: FontFamily.heading,
    color: Colors.gold,
    fontSize: FontSize.xs,
    letterSpacing: 4,
  },

  // ② heading
  textBlock: {
    position: 'absolute',
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  heading: {
    fontFamily: FontFamily.headingBold,
    fontSize: 30,                 // up from 28 — matches reference scale
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 42,
    letterSpacing: 0.5,
  },
  headingGold: {
    color: Colors.gold,
    fontFamily: FontFamily.headingBold,
  },
  subtext: {
    fontStyle: 'italic',
    color: Colors.violet,
    fontSize: FontSize.base,
    marginTop: 14,
    textAlign: 'center',
  },

  // ③ silhouette — pulled up (bottom: '28%') so figure sits closer to the text
  silhouetteWrap: {
    position: 'absolute',
    bottom: '28%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  // ④ horizon line — positioned at the figure's hem level
  // hem is ~92% from SVG top → SVG bottom + 8% of SIL_H above silhouette bottom
  horizonWrap: {
    position: 'absolute',
    bottom: '30%',                // just above silhouette bottom, at cloak hem
    left: 0,
    right: 0,
  },
  horizonSpread: {
    height: 22,
    width: '100%',
  },
  horizonLine: {
    height: 1.5,
    width: '100%',
  },
  horizonBelow: {
    height: 12,
    width: '100%',
  },

  // ⑤ bottom CTA
  bottomWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  ctaStretch: {
    width: '100%',
  },
  disclaimer: {
    color: Colors.midGray,
    fontSize: 11,
    marginTop: 10,
    textAlign: 'center',
    opacity: 0.65,
  },
});
