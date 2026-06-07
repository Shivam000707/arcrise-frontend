import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Share,
  StyleSheet,
  ActivityIndicator,
  ListRenderItemInfo,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Line,
  Path,
  Rect,
  Defs,
  Pattern as SvgPattern,
} from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Radius, Spacing } from '@/constants/layout';
import { useJournalQuery } from '@/services/api/useJournal';
import { useHeroQuery } from '@/services/api/useHero';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { JournalEntry } from '@/types/journal';
import { HERO_CLASSES } from '@/constants/classes';

// ─── Parchment texture overlay ─────────────────────────────────────────────

function ParchmentTexture() {
  return (
    <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
      <Defs>
        <SvgPattern id="parch" patternUnits="userSpaceOnUse" width={24} height={24}>
          <Path d="M0 24 L24 0" stroke="rgba(244,197,66,0.028)" strokeWidth={1} />
        </SvgPattern>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#parch)" />
    </Svg>
  );
}

// ─── Gold ornamental divider ────────────────────────────────────────────────

function EntryDivider() {
  return (
    <View style={s.dividerWrap} pointerEvents="none">
      <Svg width="100%" height={20}>
        <Line x1="0" y1="10" x2="42%" y2="10" stroke="rgba(244,197,66,0.28)" strokeWidth={0.6} />
        <Path d="M50% 4 L53% 10 L50% 16 L47% 10 Z" fill="rgba(244,197,66,0.5)" />
        <Line x1="58%" y1="10" x2="100%" y2="10" stroke="rgba(244,197,66,0.28)" strokeWidth={0.6} />
      </Svg>
    </View>
  );
}

// ─── Single journal entry row ───────────────────────────────────────────────

function EntryRow({ entry, isFirst }: { entry: JournalEntry; isFirst: boolean }) {
  return (
    <View style={s.entryWrap}>
      {entry.isMilestone && (
        <View style={s.milestoneBadge}>
          <Text style={s.milestoneBadgeText}>MILESTONE</Text>
        </View>
      )}
      <View style={s.entryColumns}>
        <Text style={s.dayLabel}>DAY{'\n'}{entry.day}</Text>
        <Text style={[s.prose, { opacity: isFirst ? 1 : 0.7 }]}>{entry.prose}</Text>
      </View>
    </View>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const heroName = useOnboardingStore((s) => s.heroName);

  const { data: entries, isLoading } = useJournalQuery();
  const { data: hero } = useHeroQuery();

  const classDef = hero ? HERO_CLASSES.find((c) => c.id === hero.heroClass) : null;
  const className = classDef?.name.toUpperCase() ?? '';
  const displayName = heroName || hero?.name || 'The Hero';

  // Blinking cursor animation
  const cursorOpacity = useSharedValue(1);
  const cursorStyle = useAnimatedStyle(() => ({ opacity: cursorOpacity.value }));
  useEffect(() => {
    cursorOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 50 }),
        withTiming(0, { duration: 600 }),
        withTiming(0, { duration: 300 }),
        withTiming(1, { duration: 100 }),
      ),
      -1,
      false,
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleShare = useCallback(async () => {
    if (!entries?.length) return;
    const last3 = entries.slice(0, 3);
    const text = last3
      .map((e) => `DAY ${e.day}\n${e.prose}`)
      .join('\n\n— — —\n\n');
    await Share.share({
      message: `My ArcRise Chronicle\n\n${text}\n\n— Written in the ArcRise App`,
    });
  }, [entries]);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<JournalEntry>) => (
      <EntryRow entry={item} isFirst={index === 0} />
    ),
    [],
  );

  const keyExtractor = useCallback((item: JournalEntry) => item.id, []);

  const ListHeader = (
    <View style={s.header}>
      {/* Title */}
      <Text style={s.title}>THE CHRONICLE</Text>
      <Text style={s.subtitle}>
        {displayName}
        {className ? `  ·  ${className}` : ''}
      </Text>
      {/* Gold divider */}
      <View style={s.headerDivider} />
    </View>
  );

  if (isLoading) {
    return (
      <View style={s.loading}>
        <ActivityIndicator color={Colors.violet} size="large" />
      </View>
    );
  }

  const floatingCardHeight = 76;

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <ParchmentTexture />

      <FlatList
        data={entries ?? []}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ItemSeparatorComponent={EntryDivider}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyText}>The chronicle has not yet been written.</Text>
            <Text style={s.emptySubText}>Complete your first focus session to begin your story.</Text>
          </View>
        }
        contentContainerStyle={[
          s.listContent,
          { paddingBottom: tabBarHeight + floatingCardHeight + Spacing.md },
        ]}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating "today in progress" card */}
      <View style={[s.floatingCard, { bottom: tabBarHeight }]}>
        <View style={s.cardLeft}>
          <Text style={s.todayLabel}>TODAY</Text>
          <View style={s.cursorRow}>
            <Text style={s.inProgressText}>Today's entry being written</Text>
            <Animated.Text style={[s.cursor, cursorStyle]}>|</Animated.Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleShare} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={s.shareBtn}>SHARE YOUR ARC ↗</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loading: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // List
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontFamily: FontFamily.headingBold,
    color: Colors.gold,
    fontSize: FontSize['2xl'],
    letterSpacing: 8,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.violet,
    fontSize: FontSize.xs,
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  headerDivider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(244,197,66,0.35)',
  },

  // Divider
  dividerWrap: {
    marginVertical: Spacing.sm,
  },

  // Entry
  entryWrap: {
    paddingVertical: Spacing.sm + 2,
  },
  milestoneBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(244,197,66,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244,197,66,0.4)',
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 8,
  },
  milestoneBadgeText: {
    fontFamily: FontFamily.heading,
    color: Colors.gold,
    fontSize: 9,
    letterSpacing: 2,
  },
  entryColumns: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  dayLabel: {
    fontFamily: FontFamily.heading,
    color: Colors.gold,
    fontSize: FontSize.xs,
    letterSpacing: 1,
    width: 38,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 16,
  },
  prose: {
    flex: 1,
    color: Colors.white,
    fontStyle: 'italic',
    fontSize: FontSize.sm,
    lineHeight: 23,
  },

  // Empty state
  empty: {
    alignItems: 'center',
    paddingTop: Spacing['2xl'],
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    fontFamily: FontFamily.heading,
    color: Colors.midGray,
    fontSize: FontSize.base,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  emptySubText: {
    color: Colors.darkGray,
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // Floating card
  floatingCard: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(26,5,51,0.95)',
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: 'rgba(123,92,240,0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
  },
  cardLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  todayLabel: {
    fontFamily: FontFamily.heading,
    color: Colors.violet,
    fontSize: 9,
    letterSpacing: 3,
    marginBottom: 4,
    opacity: 0.7,
  },
  cursorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inProgressText: {
    fontFamily: FontFamily.heading,
    fontStyle: 'italic',
    color: Colors.violet,
    fontSize: FontSize.xs,
    letterSpacing: 0.5,
    opacity: 0.75,
  },
  cursor: {
    color: Colors.violet,
    fontSize: FontSize.sm,
    marginLeft: 1,
    opacity: 0.9,
  },
  shareBtn: {
    fontFamily: FontFamily.heading,
    color: Colors.gold,
    fontSize: FontSize.xs,
    letterSpacing: 1.5,
    textAlign: 'right',
  },
});
