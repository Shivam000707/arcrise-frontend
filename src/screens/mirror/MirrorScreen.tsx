import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ModalStackParamList } from '@/navigation/types';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Radius, Spacing } from '@/constants/layout';
import HeroPortrait from '@/components/hero/HeroPortrait';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useAppStore } from '@/store/useAppStore';
import { useSessionStore } from '@/store/useSessionStore';
import { useHeroQuery, useUpdateHeroMutation } from '@/services/api/useHero';
import { useAddEntryMutation } from '@/services/api/useJournal';
import { levelToStage } from '@/utils/levelUtils';
import { generateJournalEntry } from '@/services/journal/generateJournalEntry';

type Props = NativeStackScreenProps<ModalStackParamList, 'Mirror'>;

const DOOMSCROLL_XP_COST = 47;

function formatFocusTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return 'less than a minute';
}

export default function MirrorScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const appName = route.params?.appName ?? 'this app';
  const heroName = useOnboardingStore((s) => s.heroName);
  const setMirrorActive = useAppStore((s) => s.setMirrorActive);
  const session = useSessionStore();
  const { data: hero } = useHeroQuery();
  const addEntry = useAddEntryMutation();
  const updateHero = useUpdateHeroMutation();

  const stage = hero ? levelToStage(hero.level) : 1;

  const focusElapsed = session.startedAt
    ? Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000)
    : 0;

  // Subtle portrait flicker for fading state
  const portraitOpacity = useSharedValue(1);
  const portraitStyle = useAnimatedStyle(() => ({ opacity: portraitOpacity.value }));
  useEffect(() => {
    portraitOpacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 1800 }),
        withTiming(1, { duration: 1200 }),
        withTiming(0.92, { duration: 900 }),
        withTiming(1, { duration: 600 }),
      ),
      -1,
      false,
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleProtect = () => {
    setMirrorActive(false);
    navigation.goBack();
  };

  const handleContinue = async () => {
    if (hero) {
      await updateHero.mutateAsync({
        xp: Math.max(0, hero.xp - DOOMSCROLL_XP_COST),
        stats: {
          ...hero.stats,
          focus: Math.max(10, hero.stats.focus - 4),
          discipline: Math.max(10, hero.stats.discipline - 2),
        },
      });
      await addEntry.mutateAsync({
        day: 1,
        type: 'doomscroll',
        prose: generateJournalEntry({ type: 'doomscroll' }, hero),
        isMilestone: false,
        createdAt: new Date().toISOString(),
      });
    }
    setMirrorActive(false);
    navigation.goBack();
  };

  const displayName = heroName || hero?.name || 'The Hero';

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />

      {/* Red vignette bleeding in from all edges */}
      <LinearGradient
        colors={['rgba(239,68,68,0.22)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFill, { height: 220, bottom: undefined }]}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(239,68,68,0.22)', 'transparent']}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={[StyleSheet.absoluteFill, { top: undefined, height: 200 }]}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(239,68,68,0.12)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[StyleSheet.absoluteFill, { width: 140, right: undefined }]}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(239,68,68,0.12)', 'transparent']}
        start={{ x: 1, y: 0.5 }}
        end={{ x: 0, y: 0.5 }}
        style={[StyleSheet.absoluteFill, { width: 140, left: undefined }]}
        pointerEvents="none"
      />

      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Portrait ──────────────────────────────────── */}
        <Animated.View style={[s.portraitWrap, portraitStyle]}>
          <HeroPortrait size={120} heroState="fading" stage={stage} />
        </Animated.View>

        {/* Hero info */}
        <Text style={s.heroName}>{displayName}</Text>
        <Text style={s.heroLevel}>
          {hero ? `Level ${hero.level}` : '—'}
        </Text>

        {/* ── Heading ───────────────────────────────────── */}
        <Text style={s.heading}>
          {'Is this the moment '}
          <Text style={s.headingName}>{displayName}</Text>
          {' wastes?'}
        </Text>

        {/* ── Body ──────────────────────────────────────── */}
        <Text style={s.body}>
          {`You have ${formatFocusTime(focusElapsed)} of focus built today. ${appName} will cost you ${DOOMSCROLL_XP_COST} XP.`}
        </Text>

        {/* ── CTA: Protect ──────────────────────────────── */}
        <TouchableOpacity style={s.protectBtn} onPress={handleProtect} activeOpacity={0.85}>
          <Svg width={15} height={15} viewBox="0 0 24 24" style={{ marginRight: 8 }}>
            <Path
              d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z"
              fill={Colors.gold}
            />
          </Svg>
          <Text style={s.protectText}>PROTECT MY ARC</Text>
        </TouchableOpacity>

        {/* ── Continue anyway (intentionally small) ─────── */}
        <TouchableOpacity onPress={handleContinue} hitSlop={{ top: 6, bottom: 6, left: 20, right: 20 }}>
          <Text style={s.continueLink}>Continue Anyway</Text>
        </TouchableOpacity>

        {/* ── Footer ────────────────────────────────────── */}
        <Text style={s.footer}>Every choice is written in your story.</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060606',
  },
  scroll: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },

  // Portrait
  portraitWrap: {
    marginBottom: Spacing.sm,
  },
  heroName: {
    fontFamily: FontFamily.heading,
    color: '#6B7280',
    fontSize: FontSize.base,
    letterSpacing: 2,
    marginBottom: 4,
    textAlign: 'center',
  },
  heroLevel: {
    color: '#4B5563',
    fontSize: FontSize.xs,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },

  // Heading
  heading: {
    fontFamily: FontFamily.headingBold,
    color: Colors.white,
    fontSize: FontSize['2xl'],
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  headingName: {
    color: Colors.violet,
  },

  // Body
  body: {
    color: '#6B7280',
    fontSize: FontSize.base,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing['2xl'],
    paddingHorizontal: Spacing.sm,
  },

  // Protect button
  protectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.gold,
    borderRadius: Radius.button,
    paddingVertical: Spacing.sm + 4,
    marginBottom: Spacing.lg,
  },
  protectText: {
    fontFamily: FontFamily.headingBold,
    color: Colors.gold,
    fontSize: FontSize.base,
    letterSpacing: 2,
  },

  // Continue link
  continueLink: {
    color: '#7F2222',
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
    opacity: 0.75,
  },

  // Footer
  footer: {
    color: '#374151',
    fontSize: FontSize.xs,
    fontStyle: 'italic',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
