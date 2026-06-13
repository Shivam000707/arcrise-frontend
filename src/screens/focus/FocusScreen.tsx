import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ModalStackParamList } from '@/navigation/types';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Radius, Spacing } from '@/constants/layout';
import ProgressRing from '@/components/ui/ProgressRing';
import HeroPortrait from '@/components/hero/HeroPortrait';
import { useSessionStore } from '@/store/useSessionStore';
import { useHeroQuery, useUpdateHeroMutation } from '@/services/api/useHero';
import { useQuestsQuery } from '@/services/api/useQuests';
import { useAddEntryMutation } from '@/services/api/useJournal';
import { useCountdownTimer } from '@/hooks/useCountdownTimer';
import { heroStateFromStats } from '@/utils/heroVisuals';
import { levelToStage } from '@/utils/levelUtils';
import { generateJournalEntry } from '@/services/journal/generateJournalEntry';
import { XP_REWARDS } from '@/constants/xp';

type Props = NativeStackScreenProps<ModalStackParamList, 'Focus'>;

const XP_PER_MIN = 2;
const DEFAULT_DURATION = 90 * 60;

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function FocusScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const session = useSessionStore();
  const { data: hero } = useHeroQuery();
  const { data: quests } = useQuestsQuery();
  const addEntry = useAddEntryMutation();
  const updateHero = useUpdateHeroMutation();

  const [surrenderVisible, setSurrenderVisible] = useState(false);
  const completedRef = useRef(false);

  // Auto-start session if not already running
  useEffect(() => {
    if (!session.active) {
      session.start(DEFAULT_DURATION);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isPaused = session.pausedAt !== null;
  const timer = useCountdownTimer(session.startedAt, session.targetDuration, isPaused);
  const xpEarned = Math.floor((timer.elapsed / 60) * XP_PER_MIN);

  // Gold flash on session complete
  const flashOpacity = useSharedValue(0);
  const flashStyle = useAnimatedStyle(() => ({ opacity: flashOpacity.value }));

  // Green pulsing dot
  const dotOpacity = useSharedValue(1);
  const dotStyle = useAnimatedStyle(() => ({ opacity: dotOpacity.value }));
  useEffect(() => {
    dotOpacity.value = withRepeat(
      withSequence(
        withTiming(0.25, { duration: 700 }),
        withTiming(1, { duration: 700 }),
      ),
      -1,
      false,
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Session complete handler
  useEffect(() => {
    if (timer.isComplete && !completedRef.current) {
      completedRef.current = true;
      flashOpacity.value = withSequence(
        withTiming(0.85, { duration: 300 }),
        withDelay(2000, withTiming(0, { duration: 400 })),
      );
      setTimeout(async () => {
        if (hero) {
          const focusGain = Math.min(5, Math.round(timer.elapsed / 60 / 18));
          const day = Math.max(
            1,
            Math.floor((Date.now() - new Date(hero.createdAt).getTime()) / 86400000) + 1,
          );
          await updateHero.mutateAsync({
            xp: hero.xp + xpEarned,
            stats: {
              ...hero.stats,
              focus: Math.min(100, hero.stats.focus + focusGain),
            },
            lastActivityAt: new Date().toISOString(),
          });
          addEntry.mutate({
            day,
            type: 'focus',
            prose: generateJournalEntry(
              { type: 'focus', detail: { duration: Math.floor(timer.elapsed / 60) } },
              hero,
            ),
            isMilestone: false,
            createdAt: new Date().toISOString(),
          });
        }
        session.end();
        navigation.goBack();
      }, 2800);
    }
  }, [timer.isComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePauseResume = () => {
    if (isPaused) session.resume();
    else session.pause();
  };

  const handleSurrender = async () => {
    setSurrenderVisible(false);
    if (hero) {
      const day = Math.max(
        1,
        Math.floor((Date.now() - new Date(hero.createdAt).getTime()) / 86400000) + 1,
      );
      await updateHero.mutateAsync({ xp: Math.max(0, hero.xp + XP_REWARDS.surrenderPenalty) });
      await addEntry.mutateAsync({
        day,
        type: 'focus',
        prose: `${hero.name} faced the trial and chose to withdraw. The chronicle notes the cost: ${Math.abs(XP_REWARDS.surrenderPenalty)} XP and the weight of an unfinished arc.`,
        isMilestone: false,
        createdAt: new Date().toISOString(),
      });
    }
    session.end();
    navigation.goBack();
  };

  const questName = quests?.[0]?.title ?? 'Focus Session';
  const heroState = hero ? heroStateFromStats(hero.stats, hero.lastActivityAt) : 'thriving';
  const stage = hero ? levelToStage(hero.level) : 1;
  const displayName = hero?.name || 'The Hero';

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />

      {/* Dark-energy radial background */}
      <LinearGradient
        colors={['#1A0533', '#0D0020', '#0A0A0A']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.85 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top header ──────────────────────────────────── */}
        <View style={s.header}>
          <Animated.View style={[s.dot, dotStyle]} />
          <Text style={s.activeLabel}>FOCUS SESSION ACTIVE</Text>
        </View>
        <Text style={s.questName}>{questName}</Text>

        {/* ── Progress ring + countdown ────────────────────── */}
        <View style={s.ringSection}>
          <ProgressRing
            size={240}
            strokeWidth={8}
            progress={timer.percent}
            color={Colors.violet}
          >
            <Text style={s.timerText}>{formatTime(timer.remaining)}</Text>
            {isPaused && <Text style={s.pausedBadge}>PAUSED</Text>}
          </ProgressRing>
        </View>

        {/* ── Hero portrait + gold glow ────────────────────── */}
        <View style={s.portraitSection}>
          <LinearGradient
            colors={['transparent', 'rgba(244,197,66,0.28)', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={s.portraitGlow}
          />
          <HeroPortrait size={64} heroState={heroState} stage={stage} />
        </View>

        {/* ── Stat chips ──────────────────────────────────── */}
        <View style={s.chips}>
          <View style={s.chip}>
            <Text style={[s.chipValue, { color: Colors.teal }]}>+0.4/min</Text>
            <Text style={s.chipLabel}>FOCUS</Text>
          </View>
          <View style={s.chipDivider} />
          <View style={s.chip}>
            <Text style={[s.chipValue, { color: Colors.gold }]}>{xpEarned} XP</Text>
            <Text style={s.chipLabel}>XP EARNED</Text>
          </View>
        </View>

        {/* ── Pause / Resume ──────────────────────────────── */}
        <TouchableOpacity style={s.pauseBtn} onPress={handlePauseResume} activeOpacity={0.75}>
          <Text style={s.pauseIcon}>{isPaused ? '▶' : '⏸'}</Text>
          <Text style={s.pauseBtnText}>{isPaused ? 'RESUME' : 'PAUSE'}</Text>
        </TouchableOpacity>

        {/* ── Surrender section ───────────────────────────── */}
        <Text style={s.surrenderWarning}>
          Surrendering ends the quest and costs 30 XP.
        </Text>
        <TouchableOpacity
          onPress={() => setSurrenderVisible(true)}
          hitSlop={{ top: 6, bottom: 6, left: 16, right: 16 }}
        >
          <Text style={s.surrenderLink}>Surrender</Text>
        </TouchableOpacity>

        {/* ── Motto ──────────────────────────────────────── */}
        <Text style={s.motto}>{displayName} does not stop. Neither do you.</Text>
      </ScrollView>

      {/* Gold completion flash + XP summary */}
      <Animated.View
        style={[StyleSheet.absoluteFill, s.flash, flashStyle]}
        pointerEvents="none"
      >
        <View style={s.xpSummaryWrap}>
          <Text style={s.xpSummaryLabel}>SESSION COMPLETE</Text>
          <Text style={s.xpSummaryValue}>+{xpEarned} XP</Text>
        </View>
      </Animated.View>

      {/* Surrender confirmation bottom sheet */}
      <Modal
        visible={surrenderVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setSurrenderVisible(false)}
      >
        <Pressable style={s.backdrop} onPress={() => setSurrenderVisible(false)}>
          <Pressable
            style={[s.sheet, { paddingBottom: insets.bottom + Spacing.md }]}
            onPress={() => {}}
          >
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>Are you sure?</Text>
            <Text style={s.sheetBody}>
              This costs 30 XP and fails the quest.
            </Text>
            <TouchableOpacity style={s.keepGoingBtn} onPress={() => setSurrenderVisible(false)}>
              <Text style={s.keepGoingText}>KEEP GOING</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.surrenderConfirmRow} onPress={handleSurrender}>
              <Text style={s.surrenderConfirmText}>Surrender</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.teal,
  },
  activeLabel: {
    fontFamily: FontFamily.heading,
    color: Colors.gold,
    fontSize: FontSize.xs,
    letterSpacing: 3,
  },
  questName: {
    color: Colors.violet,
    fontSize: FontSize.sm,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },

  // Ring
  ringSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  timerText: {
    fontFamily: FontFamily.headingBold,
    color: Colors.white,
    fontSize: FontSize['4xl'],
    letterSpacing: 2,
  },
  pausedBadge: {
    fontFamily: FontFamily.heading,
    color: Colors.violet,
    fontSize: FontSize.xs,
    letterSpacing: 3,
    marginTop: 6,
    opacity: 0.8,
  },

  // Portrait
  portraitSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  portraitGlow: {
    position: 'absolute',
    width: 160,
    height: 24,
    bottom: -8,
    borderRadius: 12,
  },

  // Chips
  chips: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.deepPurple,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.darkGray,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    width: '100%',
  },
  chip: {
    flex: 1,
    alignItems: 'center',
  },
  chipValue: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.lg,
    letterSpacing: 1,
    marginBottom: 3,
  },
  chipLabel: {
    color: Colors.midGray,
    fontSize: FontSize.xs,
    letterSpacing: 2,
  },
  chipDivider: {
    width: StyleSheet.hairlineWidth,
    height: 36,
    backgroundColor: Colors.darkGray,
  },

  // Pause button
  pauseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.darkGray,
    borderRadius: Radius.button,
    paddingVertical: Spacing.sm + 4,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  pauseIcon: {
    color: Colors.white,
    fontSize: FontSize.base,
  },
  pauseBtnText: {
    fontFamily: FontFamily.heading,
    color: Colors.white,
    fontSize: FontSize.base,
    letterSpacing: 2,
  },

  // Surrender
  surrenderWarning: {
    color: Colors.midGray,
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  surrenderLink: {
    color: '#7F2222',
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },

  // Motto
  motto: {
    fontFamily: FontFamily.heading,
    fontStyle: 'italic',
    color: Colors.violet,
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
    marginTop: Spacing.md,
  },

  // Gold flash overlay
  flash: {
    backgroundColor: 'rgba(244,197,66,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpSummaryWrap: {
    alignItems: 'center',
  },
  xpSummaryLabel: {
    fontFamily: FontFamily.heading,
    color: Colors.background,
    fontSize: FontSize.xl,
    letterSpacing: 4,
    marginBottom: Spacing.sm,
  },
  xpSummaryValue: {
    fontFamily: FontFamily.headingBold,
    color: Colors.background,
    fontSize: FontSize['5xl'],
    letterSpacing: 2,
  },

  // Bottom sheet modal
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.deepPurple,
    borderTopLeftRadius: Radius.card,
    borderTopRightRadius: Radius.card,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.darkGray,
    alignItems: 'center',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.darkGray,
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    fontFamily: FontFamily.headingBold,
    color: Colors.white,
    fontSize: FontSize.xl,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  sheetBody: {
    color: Colors.midGray,
    fontSize: FontSize.base,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  keepGoingBtn: {
    width: '100%',
    backgroundColor: Colors.violet,
    borderRadius: Radius.button,
    paddingVertical: Spacing.sm + 4,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  keepGoingText: {
    fontFamily: FontFamily.headingBold,
    color: Colors.white,
    fontSize: FontSize.base,
    letterSpacing: 2,
  },
  surrenderConfirmRow: {
    paddingVertical: Spacing.sm,
    width: '100%',
    alignItems: 'center',
  },
  surrenderConfirmText: {
    color: Colors.red,
    fontSize: FontSize.sm,
    opacity: 0.65,
  },
});
