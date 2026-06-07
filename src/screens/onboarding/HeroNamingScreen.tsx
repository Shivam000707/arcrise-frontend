import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Dimensions,
  Keyboard,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OnboardingStackParamList } from '@/navigation/types';
import { HERO_CLASSES } from '@/constants/classes';
import { HeroClass } from '@/types/hero';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Radius } from '@/constants/layout';
import GoldButton from '@/components/ui/GoldButton';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'HeroNaming'>;

const { width: SW, height: SH } = Dimensions.get('window');

// Violet circle starts at CIRCLE_SIZE and scales to cover every screen corner.
const CIRCLE_SIZE = 80;
const TARGET_SCALE =
  Math.ceil(Math.sqrt((SW / 2) ** 2 + (SH / 2) ** 2) / (CIRCLE_SIZE / 2)) + 2;

// ─── Sigil shapes ─────────────────────────────────────────────────────────────
// Duplicated here (same paths as ClassSelectScreen) at 80px display size.

const SZ = 80;

function ClassSigil({ classId, color }: { classId: HeroClass; color: string }) {
  switch (classId) {
    case 'builder':
      return (
        <Svg width={SZ} height={SZ} viewBox="0 0 48 48">
          <Path
            d="M 6 42 H 42 M 8 42 V 30 H 16 V 42 M 20 42 V 20 H 28 V 42 M 32 42 V 8 H 40 V 42"
            stroke={color} strokeWidth={2} fill="none"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </Svg>
      );
    case 'athlete':
      return (
        <Svg width={SZ} height={SZ} viewBox="0 0 48 48">
          <Path
            d="M 24 4 L 42 14 L 42 34 L 24 44 L 6 34 L 6 14 Z"
            stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round"
          />
          <Circle cx={24} cy={24} r={7} stroke={color} strokeWidth={2} fill="none" />
        </Svg>
      );
    case 'creator':
      return (
        <Svg width={SZ} height={SZ} viewBox="0 0 48 48">
          <Path d="M 24 5 L 43 37 L 5 37 Z"
            stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round" />
          <Path d="M 24 43 L 5 11 L 43 11 Z"
            stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round" />
        </Svg>
      );
    case 'scholar':
      return (
        <Svg width={SZ} height={SZ} viewBox="0 0 48 48">
          <Path d="M 24 12 L 8 16 L 8 38 L 24 34 Z"
            stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round" />
          <Path d="M 24 12 L 40 16 L 40 38 L 24 34 Z"
            stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round" />
          <Line x1={24} y1={12} x2={24} y2={34} stroke={color} strokeWidth={2} />
          <Line x1={11} y1={22} x2={21} y2={20.5} stroke={color} strokeWidth={1.2} strokeLinecap="round" />
          <Line x1={11} y1={28} x2={21} y2={26.5} stroke={color} strokeWidth={1.2} strokeLinecap="round" />
          <Line x1={27} y1={20.5} x2={37} y2={22} stroke={color} strokeWidth={1.2} strokeLinecap="round" />
          <Line x1={27} y1={26.5} x2={37} y2={28} stroke={color} strokeWidth={1.2} strokeLinecap="round" />
        </Svg>
      );
    case 'warrior':
      return (
        <Svg width={SZ} height={SZ} viewBox="0 0 48 48">
          <Path
            d="M 10 10 H 38 V 28 C 38 38 24 44 24 44 C 24 44 10 38 10 28 Z"
            stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round"
          />
          <Line x1={10} y1={22} x2={38} y2={22} stroke={color} strokeWidth={2} />
        </Svg>
      );
  }
}

// ─── Glowing sigil display ────────────────────────────────────────────────────
// Three concentric rings with a slow Reanimated pulse give the "soft violet glow."

function GlowingSigil({ classId }: { classId: HeroClass }) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.92, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.55 + (pulse.value - 0.92) * 0.6,
  }));

  return (
    <View style={s.sigilContainer}>
      {/* Outer ambient ring */}
      <Animated.View style={[s.ring3, ringStyle]} />
      {/* Mid ring */}
      <Animated.View style={[s.ring2, ringStyle]} />
      {/* Inner ring */}
      <View style={s.ring1} />
      {/* The sigil SVG on top */}
      <ClassSigil classId={classId} color={Colors.violet} />
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HeroNamingScreen(_: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');

  const selectedClass = useOnboardingStore((s) => s.selectedClass);
  const setHeroName   = useOnboardingStore((s) => s.setHeroName);
  const complete      = useOnboardingStore((s) => s.complete);

  const classDef = selectedClass
    ? HERO_CLASSES.find((c) => c.id === selectedClass)
    : undefined;

  // ── Transition circle ──────────────────────────────────────────────────────
  // Stays at scale 0 (invisible) until the CTA is tapped.
  // complete() is called after the circle covers the whole screen.
  // RootNavigator then fades from this violet-filled screen to WarRoom.
  const circleScale = useSharedValue(0);

  const circleAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
  }));

  const doComplete = () => complete();

  const handleBegin = () => {
    Keyboard.dismiss();
    setHeroName(name.trim() || 'Hero');
    circleScale.value = withTiming(
      TARGET_SCALE,
      { duration: 1400, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(doComplete)();
      },
    );
  };

  // Real-time preview: "THE ALEXEI BEGINS." — falls back to "THE HERO BEGINS."
  const previewName = name.trim() ? name.trim().toUpperCase() : 'HERO';

  return (
    <View style={s.root}>

      {/* ── Content + keyboard handling ── */}
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={s.flex}
          contentContainerStyle={[s.scroll, { paddingTop: insets.top + 32 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ① Sigil + class identity */}
          {selectedClass && (
            <View style={s.identity}>
              <GlowingSigil classId={selectedClass} />
              <Text style={s.className}>
                {classDef?.name.toUpperCase() ?? ''}
              </Text>
              <Text style={s.classFlavorText}>{classDef?.flavorText ?? ''}</Text>
            </View>
          )}

          {/* ── Divider ── */}
          <View style={s.divider} />

          {/* ② Name input */}
          <View style={s.inputSection}>
            <View style={s.inputWrap}>
              <TextInput
                style={s.input}
                value={name}
                onChangeText={setName}
                placeholder="Name your Hero..."
                placeholderTextColor={Colors.darkGray}
                maxLength={24}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>

            {/* ③ Live preview line */}
            <Text style={s.preview}>{`THE ${previewName} BEGINS.`}</Text>
          </View>

          {/* Spacer so content doesn't crowd the CTA */}
          <View style={s.spacer} />
        </ScrollView>

        {/* ── Fixed CTA — inside KAV so it clears the keyboard on iOS ── */}
        <View style={[s.bottomWrap, { paddingBottom: insets.bottom + 16 }]}>
          <GoldButton
            label="BEGIN THE ARC  →"
            onPress={handleBegin}
            style={s.ctaStretch}
          />
        </View>
      </KeyboardAvoidingView>

      {/* ── Full-screen violet transition circle (absolute, starts invisible at scale 0) ── */}
      <Animated.View
        pointerEvents="none"
        style={[s.transitionCircle, circleAnimStyle]}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const RING1 = SZ + 16;
const RING2 = SZ + 44;
const RING3 = SZ + 80;

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: { flex: 1 },

  // ── Scroll ──
  scroll: {
    paddingHorizontal: 28,
    paddingBottom: 24,
    alignItems: 'center',
  },

  // ── Identity section ──
  identity: {
    alignItems: 'center',
    marginBottom: 8,
  },
  // Three-layer glow rings behind the sigil
  sigilContainer: {
    width: RING3,
    height: RING3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  ring3: {
    position: 'absolute',
    width: RING3,
    height: RING3,
    borderRadius: RING3 / 2,
    backgroundColor: 'rgba(123,92,240,0.05)',
  },
  ring2: {
    position: 'absolute',
    width: RING2,
    height: RING2,
    borderRadius: RING2 / 2,
    backgroundColor: 'rgba(123,92,240,0.1)',
  },
  ring1: {
    position: 'absolute',
    width: RING1,
    height: RING1,
    borderRadius: RING1 / 2,
    backgroundColor: 'rgba(123,92,240,0.18)',
  },
  className: {
    fontFamily: FontFamily.heading,
    color: Colors.gold,
    fontSize: FontSize.xs,
    letterSpacing: 4,
    marginBottom: 8,
  },
  classFlavorText: {
    fontStyle: 'italic',
    color: Colors.violet,
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },

  // ── Divider ──
  divider: {
    width: 48,
    height: 1,
    backgroundColor: Colors.darkGray,
    marginVertical: 28,
    opacity: 0.6,
  },

  // ── Input section ──
  inputSection: {
    width: '100%',
    alignItems: 'center',
  },
  inputWrap: {
    width: '100%',
    // Gold bottom border only — no side or top borders
    borderBottomWidth: 2,
    borderBottomColor: Colors.gold,
    marginBottom: 22,
  },
  input: {
    backgroundColor: Colors.deepPurple,
    borderRadius: Radius.card,
    paddingHorizontal: 20,
    paddingVertical: 16,
    color: Colors.white,
    fontFamily: FontFamily.heading,
    fontSize: FontSize.xl,
    textAlign: 'center',
    letterSpacing: 2,
  },
  preview: {
    fontFamily: FontFamily.headingBold,
    fontStyle: 'italic',
    color: Colors.gold,
    fontSize: FontSize.base,
    letterSpacing: 2,
    textAlign: 'center',
  },

  // ── Spacer ──
  spacer: { height: 32 },

  // ── Bottom CTA ──
  bottomWrap: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.darkGray,
  },
  ctaStretch: { width: '100%' },

  // ── Transition circle ──
  // Positioned exactly at screen center. scale 0 → TARGET_SCALE fills every corner.
  transitionCircle: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: Colors.violet,
    left: SW / 2 - CIRCLE_SIZE / 2,
    top: SH / 2 - CIRCLE_SIZE / 2,
  },
});
