import { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useHeroQuery } from '@/services/api/useHero';
import { HERO_CLASSES } from '@/constants/classes';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Radius, Spacing } from '@/constants/layout';
import { xpForNextLevel, levelToStage } from '@/utils/levelUtils';
import { HeroStats } from '@/types/hero';
import HeroPortrait from '@/components/hero/HeroPortrait';

// ─── Radar chart constants ────────────────────────────────────────────────────

const CX = 130, CY = 130, MAX_R = 92;
const LABEL_R = MAX_R + 22;
const STAT_KEYS:   (keyof HeroStats)[] = ['focus', 'physique', 'craft', 'wisdom', 'discipline', 'aura'];
const STAT_LABELS  = ['FOCUS', 'PHYSIQUE', 'CRAFT', 'WISDOM', 'DISCIPLINE', 'AURA'];
const GRID_LEVELS  = [0.33, 0.66, 1.0];

function radarPt(i: number, r: number): { x: number; y: number } {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / 6;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}

function hexPoints(r: number): string {
  return STAT_KEYS.map((_, i) => {
    const p = radarPt(i, r);
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(' ');
}

function statPoints(stats: HeroStats): string {
  return STAT_KEYS.map((stat, i) => {
    const r = (stats[stat] / 100) * MAX_R;
    const p = radarPt(i, r);
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(' ');
}

// ─── Talent tree ──────────────────────────────────────────────────────────────

function PulsingNode({ label, value }: { label: string; value: number }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 900 }), withTiming(1.0, { duration: 900 })),
      -1,
      false,
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[styles.talentNode, styles.talentNodeNext, animStyle]}>
      <Text style={styles.talentNodeLabel}>{label}</Text>
      <Text style={styles.talentNodeValue}>{value}</Text>
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HeroScreen() {
  const insets           = useSafeAreaInsets();
  const { data: hero }   = useHeroQuery();

  if (!hero) return <View style={styles.root} />;

  const xpNeeded    = xpForNextLevel(hero.level);
  const xpPct       = Math.min(1, hero.xp / xpNeeded);
  const stage       = levelToStage(hero.level);
  const classDef    = HERO_CLASSES.find((c) => c.id === hero.heroClass);
  const primarySet  = new Set(classDef?.primaryStats ?? []);
  const secondary   = STAT_KEYS.filter((k) => !primarySet.has(k));

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}>

        {/* Portrait */}
        <View style={styles.portraitRow}>
          <HeroPortrait stage={stage} stats={hero.stats} size={120} />
        </View>

        {/* Identity */}
        <Text style={styles.heroName}>{hero.name}</Text>
        <Text style={styles.heroClass}>{classDef?.name.toUpperCase() ?? hero.heroClass.toUpperCase()}</Text>
        <Text style={styles.heroLevel}>LEVEL {hero.level}</Text>

        {/* XP bar */}
        <View style={styles.xpRow}>
          <Text style={styles.xpLabel}>{hero.xp} / {xpNeeded} XP</Text>
        </View>
        <View style={styles.xpTrack}>
          <View style={[styles.xpFill, { width: `${Math.round(xpPct * 100)}%` as `${number}%` }]} />
        </View>

        <View style={styles.divider} />

        {/* Radar chart */}
        <Text style={styles.sectionTitle}>STATS</Text>
        <View style={styles.chartWrap}>
          <Svg width={260} height={260} viewBox="0 0 260 260">
            {/* Grid rings */}
            {GRID_LEVELS.map((level, li) => (
              <Polygon key={li} points={hexPoints(level * MAX_R)} fill="none" stroke={Colors.darkGray} strokeWidth={0.8} />
            ))}
            {/* Spokes */}
            {STAT_KEYS.map((_, i) => {
              const p = radarPt(i, MAX_R);
              return <Line key={i} x1={CX} y1={CY} x2={p.x} y2={p.y} stroke={Colors.darkGray} strokeWidth={0.8} />;
            })}
            {/* Stat polygon */}
            <Polygon
              points={statPoints(hero.stats)}
              fill={`${Colors.violet}40`}
              stroke={Colors.violet}
              strokeWidth={1.5}
            />
            {/* Gold dots at stat vertices */}
            {STAT_KEYS.map((stat, i) => {
              const r = (hero.stats[stat] / 100) * MAX_R;
              const p = radarPt(i, r);
              return <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={Colors.gold} />;
            })}
            {/* Labels */}
            {STAT_LABELS.map((label, i) => {
              const p    = radarPt(i, LABEL_R);
              const anchor = p.x < CX - 4 ? 'end' : p.x > CX + 4 ? 'start' : 'middle';
              return (
                <SvgText
                  key={i}
                  x={p.x}
                  y={p.y + 4}
                  textAnchor={anchor}
                  fontSize={8}
                  fontFamily={FontFamily.headingBold}
                  fill={Colors.midGray}
                  letterSpacing={1}
                >
                  {label}
                </SvgText>
              );
            })}
          </Svg>
        </View>

        <View style={styles.divider} />

        {/* Talent tree */}
        <Text style={styles.sectionTitle}>TALENTS</Text>
        <Text style={styles.talentSubtitle}>{classDef?.name ?? hero.heroClass} — Primary Disciplines</Text>

        {/* Unlocked row */}
        <View style={styles.talentRow}>
          {(classDef?.primaryStats ?? []).map((stat) => (
            <View key={stat} style={[styles.talentNode, styles.talentNodeUnlocked]}>
              <Text style={styles.talentNodeLabel}>{stat.toUpperCase()}</Text>
              <Text style={[styles.talentNodeValue, { color: Colors.gold }]}>{hero.stats[stat]}</Text>
            </View>
          ))}
        </View>

        {/* Locked row — first node pulses */}
        <View style={styles.talentConnector} />
        <View style={styles.talentRow}>
          {secondary.map((stat, idx) =>
            idx === 0 ? (
              <PulsingNode key={stat} label={stat.toUpperCase()} value={hero.stats[stat]} />
            ) : (
              <View key={stat} style={[styles.talentNode, styles.talentNodeLocked]}>
                <Text style={[styles.talentNodeLabel, { color: Colors.darkGray }]}>{stat.toUpperCase()}</Text>
                <Text style={[styles.talentNodeValue, { color: Colors.darkGray }]}>{hero.stats[stat]}</Text>
              </View>
            )
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: Colors.background },
  content:      { padding: Spacing.md, alignItems: 'center' },
  portraitRow:  { marginTop: Spacing.md, marginBottom: Spacing.md },
  heroName: {
    fontFamily:    FontFamily.headingBold,
    fontSize:      FontSize['2xl'],
    color:         Colors.white,
    letterSpacing: 3,
    textAlign:     'center',
  },
  heroClass: {
    fontFamily:    FontFamily.heading,
    fontSize:      FontSize.sm,
    color:         Colors.violet,
    letterSpacing: 3,
    textAlign:     'center',
    marginTop:     4,
  },
  heroLevel: {
    fontFamily:    FontFamily.heading,
    fontSize:      FontSize.xs,
    color:         Colors.midGray,
    letterSpacing: 2,
    textAlign:     'center',
    marginTop:     4,
    marginBottom:  Spacing.sm,
  },
  xpRow: {
    flexDirection:   'row',
    justifyContent:  'flex-end',
    width:           '100%',
    paddingHorizontal: Spacing.xs,
    marginBottom:    4,
  },
  xpLabel: {
    fontFamily: FontFamily.heading,
    fontSize:   FontSize.xs,
    color:      Colors.midGray,
    letterSpacing: 1,
  },
  xpTrack: {
    width:           '100%',
    height:          6,
    backgroundColor: Colors.darkGray,
    borderRadius:    Radius.full,
    overflow:        'hidden',
    marginBottom:    Spacing.md,
  },
  xpFill: {
    height:          '100%',
    backgroundColor: Colors.violet,
    borderRadius:    Radius.full,
  },
  divider: {
    width:           '100%',
    height:          1,
    backgroundColor: Colors.darkGray,
    marginVertical:  Spacing.lg,
  },
  sectionTitle: {
    fontFamily:    FontFamily.headingBold,
    fontSize:      FontSize.xs,
    color:         Colors.gold,
    letterSpacing: 3,
    textAlign:     'center',
    marginBottom:  Spacing.md,
  },
  chartWrap:    { alignItems: 'center', width: '100%' },
  talentSubtitle: {
    fontFamily:  FontFamily.heading,
    fontSize:    FontSize.xs,
    color:       Colors.midGray,
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  talentRow: {
    flexDirection: 'row',
    gap:           Spacing.sm,
    justifyContent: 'center',
  },
  talentConnector: {
    width:           1,
    height:          Spacing.md,
    backgroundColor: Colors.darkGray,
    alignSelf:       'center',
    marginVertical:  Spacing.xs,
  },
  talentNode: {
    width:          90,
    paddingVertical:  Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius:   Radius.card,
    borderWidth:    1,
    alignItems:     'center',
  },
  talentNodeUnlocked: {
    backgroundColor: Colors.deepPurple,
    borderColor:     Colors.gold,
  },
  talentNodeNext: {
    backgroundColor: Colors.deepPurple,
    borderColor:     Colors.violet,
    borderStyle:     'dashed',
  },
  talentNodeLocked: {
    backgroundColor: Colors.background,
    borderColor:     Colors.darkGray,
  },
  talentNodeLabel: {
    fontFamily:    FontFamily.headingBold,
    fontSize:      8,
    color:         Colors.midGray,
    letterSpacing: 1,
    marginBottom:  2,
  },
  talentNodeValue: {
    fontFamily: FontFamily.headingBold,
    fontSize:   FontSize.base,
    color:      Colors.violet,
  },
});
