import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ModalStackParamList } from '@/navigation/types';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Radius, Spacing } from '@/constants/layout';
import HeroPortrait from '@/components/hero/HeroPortrait';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useHeroQuery } from '@/services/api/useHero';
import { levelToStage } from '@/utils/levelUtils';

type Props = NativeStackScreenProps<ModalStackParamList, 'LevelUp'>;

const { width: SW, height: SH } = Dimensions.get('window');
const BURST_SIZE = Math.max(SW, SH) * 2.6;

const DEFAULT_STAT_INCREASES = [
  { stat: 'FOCUS',      from: 74, to: 78, color: Colors.violet },
  { stat: 'WISDOM',     from: 61, to: 66, color: Colors.teal   },
  { stat: 'DISCIPLINE', from: 55, to: 58, color: Colors.gold   },
];

// ─── Spark particle ──────────────────────────────────────────────────────────

interface ParticleConfig { id: number; x: number; startY: number; delay: number; size: number }

function Particle({ x, startY, delay, size }: Omit<ParticleConfig, 'id'>) {
  const ty = useSharedValue(0);
  const op = useSharedValue(0);

  useEffect(() => {
    ty.value = withDelay(delay, withTiming(-(SH * 0.65 + Math.random() * 200), { duration: 1800 + Math.random() * 600 }));
    op.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0.8, { duration: 600 }),
        withTiming(0, { duration: 800 }),
      ),
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }],
    opacity: op.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: x,
          top: startY,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: Colors.gold,
        },
        style,
      ]}
    />
  );
}

// ─── Stat increase row ────────────────────────────────────────────────────────

function StatRow({
  stat, from, to, color, delay,
}: { stat: string; from: number; to: number; color: string; delay: number }) {
  const ty  = useSharedValue(20);
  const op  = useSharedValue(0);

  useEffect(() => {
    ty.value = withDelay(delay, withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) }));
    op.value = withDelay(delay, withTiming(1, { duration: 400 }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }],
    opacity: op.value,
  }));

  return (
    <Animated.View style={[s.statRow, style]}>
      <Text style={[s.statText, { color }]}>
        {stat}{' '}
        <Text style={s.statArrow}>↑</Text>
        {'  '}{from}
        <Text style={s.statArrow}> → </Text>
        {to}
      </Text>
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LevelUpScreen({ navigation, route }: Props) {
  const insets  = useSafeAreaInsets();
  const heroName = useOnboardingStore((s) => s.heroName);
  const { data: hero } = useHeroQuery();

  const {
    newLevel,
    className: paramClass,
    statIncreases = DEFAULT_STAT_INCREASES,
    talentUnlock,
  } = route.params;

  const stage       = hero ? levelToStage(newLevel) : 1;
  const displayClass = paramClass ?? (hero ? hero.heroClass.toUpperCase() : 'HERO');

  // ── Burst ──────────────────────────────────────────────────────────────────
  const burstScale  = useSharedValue(0);
  const burstOp     = useSharedValue(0.65);
  const burstStyle  = useAnimatedStyle(() => ({
    transform: [{ scale: burstScale.value }],
    opacity: burstOp.value,
  }));

  // ── Light rays ─────────────────────────────────────────────────────────────
  const raysOp     = useSharedValue(0);
  const raysStyle  = useAnimatedStyle(() => ({ opacity: raysOp.value }));

  // ── Shimmer on 'LEVEL UP' label ────────────────────────────────────────────
  const shimmer    = useSharedValue(0.55);
  const shimmerStyle = useAnimatedStyle(() => ({ opacity: shimmer.value }));

  // ── Content fade in ────────────────────────────────────────────────────────
  const contentOp  = useSharedValue(0);
  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOp.value }));

  useEffect(() => {
    // Burst expands over 600ms
    burstScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    burstOp.value    = withSequence(
      withTiming(0.45, { duration: 350 }),
      withTiming(0, { duration: 700 }),
    );

    // Rays appear after burst peak, then fade
    raysOp.value = withSequence(
      withDelay(350, withTiming(0.65, { duration: 300 })),
      withTiming(0.35, { duration: 1000 }),
      withTiming(0, { duration: 800 }),
    );

    // Content fades in after burst settles
    contentOp.value = withDelay(400, withTiming(1, { duration: 500 }));

    // Shimmer loops
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: 700 }),
        withTiming(0.55, { duration: 700 }),
      ),
      -1,
      false,
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Particles ──────────────────────────────────────────────────────────────
  const particles = useMemo<ParticleConfig[]>(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: Math.random() * SW,
        startY: SH * 0.45 + Math.random() * (SH * 0.35),
        delay: 200 + Math.random() * 900,
        size: 2 + Math.random() * 4,
      })),
    [],
  );

  // ── Light ray positions ─────────────────────────────────────────────────────
  const rayAngles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  const cx = SW / 2;
  const cy = SH / 2;
  const rayLen = Math.max(SW, SH) * 0.9;

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />

      {/* ── Violet radial burst ─────────────────────────── */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            width: BURST_SIZE,
            height: BURST_SIZE,
            borderRadius: BURST_SIZE / 2,
            backgroundColor: Colors.violet,
            left: SW / 2 - BURST_SIZE / 2,
            top: SH / 2 - BURST_SIZE / 2,
          },
          burstStyle,
        ]}
      />

      {/* ── Gold light rays ─────────────────────────────── */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, raysStyle]}>
        <Svg width={SW} height={SH}>
          {rayAngles.map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <Line
                key={deg}
                x1={cx}
                y1={cy}
                x2={cx + Math.cos(rad) * rayLen}
                y2={cy + Math.sin(rad) * rayLen}
                stroke="rgba(244,197,66,0.55)"
                strokeWidth={1.5}
              />
            );
          })}
        </Svg>
      </Animated.View>

      {/* ── Spark particles ─────────────────────────────── */}
      {particles.map((p) => (
        <Particle key={p.id} x={p.x} startY={p.startY} delay={p.delay} size={p.size} />
      ))}

      {/* ── Main content ────────────────────────────────── */}
      <Animated.View style={[StyleSheet.absoluteFill, contentStyle]} pointerEvents="box-none">
        <ScrollView
          contentContainerStyle={[
            s.scroll,
            { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* LEVEL UP shimmer */}
          <Animated.Text style={[s.levelUpLabel, shimmerStyle]}>LEVEL UP</Animated.Text>

          {/* LVL X — stacked for inner glow effect */}
          <View style={s.levelNumWrap}>
            <Text style={s.levelNumGlow}>LVL {newLevel}</Text>
            <Text style={s.levelNum}>LVL {newLevel}</Text>
          </View>

          {/* Class ascends */}
          <Text style={s.classAscends}>{displayClass} ASCENDS</Text>

          {/* Portrait with gold glow */}
          <View style={s.portraitSection}>
            <LinearGradient
              colors={['transparent', 'rgba(244,197,66,0.22)', 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={s.portraitGlow}
              pointerEvents="none"
            />
            <HeroPortrait size={100} heroState="thriving" stage={stage} />
          </View>

          {/* Stat increases */}
          <View style={s.statsSection}>
            {statIncreases.map((row, i) => (
              <StatRow
                key={row.stat}
                stat={row.stat}
                from={row.from}
                to={row.to}
                color={row.color}
                delay={700 + i * 200}
              />
            ))}
          </View>

          {/* Optional talent unlock banner */}
          {talentUnlock && (
            <View style={s.talentBanner}>
              <Text style={s.talentTitle}>TALENT UNLOCKED: {talentUnlock.name}</Text>
              <Text style={s.talentDesc}>{talentUnlock.description}</Text>
            </View>
          )}

          {/* CTA */}
          <TouchableOpacity
            style={s.ctaBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Text style={s.ctaText}>CONTINUE THE ARC →</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scroll: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },

  // 'LEVEL UP' shimmer label
  levelUpLabel: {
    fontFamily: FontFamily.heading,
    color: Colors.gold,
    fontSize: FontSize.sm,
    letterSpacing: 8,
    marginBottom: Spacing.sm,
  },

  // Level number stacked glow
  levelNumWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  levelNumGlow: {
    position: 'absolute',
    fontFamily: FontFamily.headingBold,
    color: Colors.violet,
    fontSize: 72,
    letterSpacing: 6,
    opacity: 0.4,
  },
  levelNum: {
    fontFamily: FontFamily.headingBold,
    color: Colors.white,
    fontSize: 72,
    letterSpacing: 6,
    textShadowColor: Colors.gold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },

  // Class ascends
  classAscends: {
    fontFamily: FontFamily.heading,
    color: Colors.gold,
    fontSize: FontSize.base,
    letterSpacing: 4,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },

  // Portrait
  portraitSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  portraitGlow: {
    position: 'absolute',
    width: 200,
    height: 28,
    bottom: -8,
    borderRadius: 14,
  },

  // Stats
  statsSection: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statRow: {
    alignItems: 'center',
  },
  statText: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.base,
    letterSpacing: 2,
  },
  statArrow: {
    opacity: 0.7,
  },

  // Talent banner
  talentBanner: {
    width: '100%',
    backgroundColor: 'rgba(244,197,66,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(244,197,66,0.35)',
    borderRadius: Radius.card,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: 6,
  },
  talentTitle: {
    fontFamily: FontFamily.headingBold,
    color: Colors.gold,
    fontSize: FontSize.sm,
    letterSpacing: 2,
    textAlign: 'center',
  },
  talentDesc: {
    color: Colors.midGray,
    fontSize: FontSize.xs,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 18,
  },

  // CTA
  ctaBtn: {
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.gold,
    backgroundColor: 'rgba(244,197,66,0.08)',
    borderRadius: Radius.button,
    paddingVertical: Spacing.sm + 4,
    alignItems: 'center',
  },
  ctaText: {
    fontFamily: FontFamily.headingBold,
    color: Colors.gold,
    fontSize: FontSize.base,
    letterSpacing: 3,
  },
});
