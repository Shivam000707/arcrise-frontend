import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OnboardingStackParamList } from '@/navigation/types';
import { HERO_CLASSES, HeroClassDefinition } from '@/constants/classes';
import { HeroClass } from '@/types/hero';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Radius } from '@/constants/layout';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ClassSelect'>;

// ─── Sigils ───────────────────────────────────────────────────────────────────
// Each is a unique geometric SVG shape — no emoji, pure paths.

const SZ = 44; // sigil canvas size

function ClassSigil({ classId, color }: { classId: HeroClass; color: string }) {
  switch (classId) {
    // BUILDER — three ascending bars with baseline: growth, stacking, construction.
    case 'builder':
      return (
        <Svg width={SZ} height={SZ} viewBox="0 0 48 48">
          <Path
            d="M 6 42 H 42
               M 8 42 V 30 H 16 V 42
               M 20 42 V 20 H 28 V 42
               M 32 42 V 8 H 40 V 42"
            stroke={color} strokeWidth={2} fill="none"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </Svg>
      );

    // ATHLETE — hexagon (strength) with inner circle (the core / the body's engine).
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

    // CREATOR — two overlapping triangles (Star of David): forces converging to create something new.
    case 'creator':
      return (
        <Svg width={SZ} height={SZ} viewBox="0 0 48 48">
          <Path
            d="M 24 5 L 43 37 L 5 37 Z"
            stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round"
          />
          <Path
            d="M 24 43 L 5 11 L 43 11 Z"
            stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round"
          />
        </Svg>
      );

    // SCHOLAR — open book with spine and ruled text lines: accumulated knowledge.
    case 'scholar':
      return (
        <Svg width={SZ} height={SZ} viewBox="0 0 48 48">
          {/* Left page */}
          <Path
            d="M 24 12 L 8 16 L 8 38 L 24 34 Z"
            stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round"
          />
          {/* Right page */}
          <Path
            d="M 24 12 L 40 16 L 40 38 L 24 34 Z"
            stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round"
          />
          {/* Spine */}
          <Line x1={24} y1={12} x2={24} y2={34} stroke={color} strokeWidth={2} />
          {/* Text lines — left */}
          <Line x1={11} y1={22} x2={21} y2={20.5} stroke={color} strokeWidth={1.2} strokeLinecap="round" />
          <Line x1={11} y1={28} x2={21} y2={26.5} stroke={color} strokeWidth={1.2} strokeLinecap="round" />
          {/* Text lines — right */}
          <Line x1={27} y1={20.5} x2={37} y2={22} stroke={color} strokeWidth={1.2} strokeLinecap="round" />
          <Line x1={27} y1={26.5} x2={37} y2={28} stroke={color} strokeWidth={1.2} strokeLinecap="round" />
        </Svg>
      );

    // WARRIOR — shield with horizontal belt: protection, discipline, readiness.
    case 'warrior':
      return (
        <Svg width={SZ} height={SZ} viewBox="0 0 48 48">
          <Path
            d="M 10 10 H 38 V 28 C 38 38 24 44 24 44 C 24 44 10 38 10 28 Z"
            stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round"
          />
          {/* Belt line */}
          <Line x1={10} y1={22} x2={38} y2={22} stroke={color} strokeWidth={2} />
        </Svg>
      );
  }
}

// ─── Class Card ───────────────────────────────────────────────────────────────

interface CardProps {
  cls: HeroClassDefinition;
  isSelected: boolean;
  onPress: () => void;
}

function ClassCard({ cls, isSelected, onPress }: CardProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(isSelected ? 1 : 0, { damping: 18, stiffness: 220 });
  }, [isSelected]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.value, [0, 1], [1, 1.025]) }],
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      ['rgba(123,92,240,0.28)', 'rgba(123,92,240,1.0)'],
    ),
    borderWidth: interpolate(progress.value, [0, 1], [1, 1.5]),
  }));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Animated.View style={[s.card, animStyle]}>

        {/* Sigil box — rounded square container, gold-tinted when selected */}
        <View style={s.sigilWrap}>
          <View style={[s.sigilBox, isSelected && s.sigilBoxSelected]}>
            <ClassSigil
              classId={cls.id}
              color={isSelected ? Colors.gold : Colors.violet}
            />
          </View>
        </View>

        {/* Name + flavor */}
        <View style={s.cardText}>
          <Text style={s.cardName}>{cls.name.toUpperCase()}</Text>
          <Text style={s.cardFlavor}>{cls.flavorText}</Text>
        </View>

        {/* Checkmark — gold circle with tick inside; reserved width avoids layout shift */}
        <View style={s.checkWrap}>
          {isSelected && (
            <Svg width={26} height={26} viewBox="0 0 26 26">
              <Circle cx={13} cy={13} r={11} stroke={Colors.gold} strokeWidth={1.5} fill="none" />
              <Path
                d="M 8 13 L 11.5 16.5 L 18 9.5"
                stroke={Colors.gold}
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          )}
        </View>

      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ClassSelectScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [selectedClass, setSelectedClass] = useState<HeroClass | null>(null);
  const setClassInStore = useOnboardingStore((st) => st.setSelectedClass);

  const handleCta = () => {
    if (!selectedClass) return;
    setClassInStore(selectedClass);
    navigation.navigate('HeroNaming');
  };

  return (
    <View style={s.root}>

      {/* ── Fixed header ── */}
      <View style={[s.header, { paddingTop: insets.top + 24 }]}>
        <Text style={s.eyebrow}>CHOOSE YOUR CLASS</Text>
        {/* Mixed-case Cinzel: uppercase letters full-height, lowercase as small caps */}
        <Text style={s.title}>{'What are\nYou Becoming?'}</Text>
      </View>

      {/* ── Scrollable card list ── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[
          s.scrollContent,
          // Extra bottom padding so the last card clears the fixed CTA
          { paddingBottom: insets.bottom + 130 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {HERO_CLASSES.map((cls) => (
          <ClassCard
            key={cls.id}
            cls={cls}
            isSelected={selectedClass === cls.id}
            onPress={() => setSelectedClass(cls.id)}
          />
        ))}
      </ScrollView>

      {/* ── Fixed bottom CTA with warm glow behind it ── */}
      <View style={[s.bottomWrap, { paddingBottom: insets.bottom + 16 }]}>
        {/* Ambient amber glow rising behind the button */}
        <LinearGradient
          colors={['transparent', 'rgba(244,197,66,0.07)', 'rgba(244,197,66,0.03)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
        <TouchableOpacity
          onPress={handleCta}
          disabled={!selectedClass}
          activeOpacity={0.8}
          style={[s.ctaButton, !selectedClass && s.ctaDisabled]}
        >
          <Text style={[s.ctaLabel, !selectedClass && s.ctaLabelDimmed]}>
            THIS IS MY ARC  →
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Header ──
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.darkGray,
  },
  eyebrow: {
    fontFamily: FontFamily.heading,
    color: Colors.gold,
    fontSize: FontSize.xs,
    letterSpacing: 4,
    marginBottom: 10,
  },
  title: {
    fontFamily: FontFamily.headingBold,
    color: Colors.white,
    fontSize: 32,          // larger to match reference
    textAlign: 'center',
    lineHeight: 44,
    letterSpacing: 1,
  },

  // ── Scroll ──
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // ── Card ──
  card: {
    backgroundColor: Colors.deepPurple,
    borderRadius: Radius.card,
    borderWidth: 1,                          // overridden by animStyle
    borderColor: 'rgba(123,92,240,0.28)',    // overridden by animStyle
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sigilWrap: {
    flexShrink: 0,
    marginRight: 4,
  },
  // Rounded-square container behind each sigil icon
  sigilBox: {
    width: 54,
    height: 54,
    borderRadius: 10,
    backgroundColor: 'rgba(123,92,240,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(123,92,240,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Gold-tinted when the card is selected
  sigilBoxSelected: {
    backgroundColor: 'rgba(244,197,66,0.12)',
    borderColor: 'rgba(244,197,66,0.35)',
  },
  cardText: {
    flex: 1,
    paddingLeft: 4,
    paddingRight: 8,
  },
  cardName: {
    fontFamily: FontFamily.headingBold,
    color: Colors.white,
    fontSize: FontSize.base,
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  cardFlavor: {
    color: Colors.midGray,
    fontSize: FontSize.sm,
    fontStyle: 'italic',
    lineHeight: 19,
  },
  checkWrap: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // ── Bottom CTA ──
  bottomWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.darkGray,
  },
  ctaButton: {
    borderWidth: 1.5,
    borderColor: Colors.gold,
    borderRadius: Radius.button,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaDisabled: {
    borderColor: Colors.darkGray,
    opacity: 0.4,
  },
  ctaLabel: {
    fontFamily: FontFamily.headingBold,
    color: Colors.gold,
    fontSize: FontSize.base,
    letterSpacing: 3,
  },
  ctaLabelDimmed: {
    color: Colors.midGray,
  },
});
