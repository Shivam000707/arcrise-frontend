import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeroQuery } from '@/services/api/useHero';
import { useQuestsQuery } from '@/services/api/useQuests';
import { usePartyQuery } from '@/services/api/useParty';
import { heroStateFromStats } from '@/utils/heroVisuals';
import { levelToStage, xpProgressInLevel } from '@/utils/levelUtils';
import { generateJournalEntry } from '@/services/journal/generateJournalEntry';
import { HERO_CLASSES } from '@/constants/classes';
import HeroPortrait from '@/components/hero/HeroPortrait';
import ProgressRing from '@/components/ui/ProgressRing';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Radius, Spacing } from '@/constants/layout';
import { Quest, QuestType } from '@/types/quest';

// ─── Quest left-border colors ─────────────────────────────────────────────────

const QUEST_ACCENT: Record<QuestType, string> = {
  daily:    Colors.gold,
  weekly:   Colors.violet,
  longterm: Colors.darkGray,
};

const QUEST_TYPE_LABEL: Record<QuestType, string> = {
  daily:    'DAILY',
  weekly:   'WEEKLY',
  longterm: 'LONG-TERM',
};

// ─── Local QuestRow ───────────────────────────────────────────────────────────
// Left-accent border + inline progress bar — matches spec (different from QuestCard stub).

function QuestRow({ quest }: { quest: Quest }) {
  const accent = QUEST_ACCENT[quest.type];
  const pct = quest.target > 0 ? Math.min(quest.progress / quest.target, 1) : 0;

  return (
    <View style={[s.questRow, { borderLeftColor: accent }]}>
      {/* Type badge */}
      <View style={s.questMeta}>
        <Text style={[s.questTypeLabel, { color: accent }]}>
          {QUEST_TYPE_LABEL[quest.type]}
        </Text>
        <Text style={[s.questXP, { color: accent }]}>+{quest.xpReward} XP</Text>
      </View>

      {/* Title + description */}
      <Text style={s.questTitle}>{quest.title}</Text>
      <Text style={s.questDesc}>{quest.description}</Text>

      {/* Progress bar */}
      <View style={s.questTrack}>
        <View style={[s.questFill, { width: `${pct * 100}%`, backgroundColor: accent }]} />
      </View>
      <Text style={s.questProgress}>
        {quest.progress} / {quest.target}
      </Text>
    </View>
  );
}

// ─── Boss countdown helper ────────────────────────────────────────────────────

function getBossCountdown(endsAt: string): string {
  const remaining = new Date(endsAt).getTime() - Date.now();
  if (remaining <= 0) return 'ENDED';
  const days  = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins  = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}D ${hours}H`;
  return `${hours}H ${mins}M`;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function WarRoomScreen() {
  const insets = useSafeAreaInsets();

  const { data: hero,   isLoading: heroLoading   } = useHeroQuery();
  const { data: quests, isLoading: questsLoading } = useQuestsQuery();
  const { data: party                            } = usePartyQuery();

  // Loading guard — show spinner until hero data is ready
  if (heroLoading || questsLoading || !hero || !quests) {
    return (
      <View style={s.loading}>
        <ActivityIndicator color={Colors.violet} size="large" />
      </View>
    );
  }

  // ── Derived values — all from query data, zero hardcoding ──
  const heroState   = heroStateFromStats(hero.stats, hero.lastActivityAt);
  const stage       = levelToStage(hero.level);
  const { current: xpCurrent, needed: xpNeeded } = xpProgressInLevel(hero.xp);
  const xpProgress  = xpNeeded > 0 ? Math.min(xpCurrent / xpNeeded, 1) : 0;
  const focusPercent = hero.stats.focus / 100;
  const classDef    = HERO_CLASSES.find((c) => c.id === hero.heroClass);
  const className   = classDef?.name.toUpperCase() ?? hero.heroClass.toUpperCase();
  const statusLine  = generateJournalEntry({ type: 'daily_status' }, hero);

  const hpPercent   = party ? party.boss.currentHp / party.boss.maxHp : 0;
  const countdown   = party ? getBossCountdown(party.boss.endsAt) : '—';

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ══════════════════════════════════════════════
            HERO STATUS PANEL
        ══════════════════════════════════════════════ */}
        <View style={s.panel}>

          {/* Portrait row */}
          <View style={s.heroRow}>

            {/* Circular portrait with violet aura ring */}
            <HeroPortrait stage={stage} heroState={heroState} size={72} />

            {/* Name / class / level / XP */}
            <View style={s.heroInfo}>
              <Text style={s.heroName} numberOfLines={1}>{hero.name}</Text>
              <Text style={s.heroClass}>{className}</Text>

              {/* Level badge pill */}
              <View style={s.levelPill}>
                <Text style={s.levelPillText}># LVL {hero.level}</Text>
              </View>

              {/* XP progress bar */}
              <View style={s.xpTrack}>
                <View style={[s.xpFill, { width: `${xpProgress * 100}%` }]} />
              </View>
              <Text style={s.xpLabel}>{xpCurrent} / {xpNeeded} XP</Text>
            </View>
          </View>

          {/* Daily status line — italic Cinzel, dark card */}
          <View style={s.statusCard}>
            <Text style={s.statusText}>{statusLine}</Text>
          </View>
        </View>

        {/* ══════════════════════════════════════════════
            QUEST BOARD
        ══════════════════════════════════════════════ */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>ACTIVE QUESTS</Text>
            <Text style={s.sectionCount}>{quests.length}</Text>
          </View>

          {quests.map((quest) => (
            <QuestRow key={quest.id} quest={quest} />
          ))}
        </View>

        {/* ══════════════════════════════════════════════
            BOTTOM WIDGETS — FOCUS + PARTY
        ══════════════════════════════════════════════ */}
        <View style={s.widgetRow}>

          {/* FOCUS widget */}
          <View style={[s.widget, s.focusWidget]}>
            <Text style={s.widgetLabel}>FOCUS</Text>
            <ProgressRing
              size={84}
              strokeWidth={6}
              progress={focusPercent}
              color={Colors.violet}
            >
              <Text style={s.focusValue}>{hero.stats.focus}</Text>
            </ProgressRing>
            <Text style={s.focusSubLabel}>/ 100</Text>
          </View>

          {/* PARTY widget */}
          <View style={[s.widget, s.partyWidget]}>
            <Text style={s.widgetLabel}>PARTY</Text>
            <Text style={s.partyName} numberOfLines={1}>
              {party?.name ?? '—'}
            </Text>

            {/* Boss health bar */}
            <View style={s.bossTrack}>
              <View style={[s.bossFill, { width: `${hpPercent * 100}%` }]} />
            </View>
            <Text style={s.bossHpText}>
              {party ? `${party.boss.currentHp} / ${party.boss.maxHp} HP` : '—'}
            </Text>

            {/* Boss fight countdown */}
            <View style={s.countdownRow}>
              <Text style={s.countdownLabel}>BOSS RESETS IN</Text>
              <Text style={s.countdownValue}>{countdown}</Text>
            </View>
          </View>

        </View>

        {/* Bottom padding so content clears the tab bar */}
        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loading: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },

  // ── Hero Status Panel ──
  panel: {
    backgroundColor: Colors.deepPurple,
    borderRadius: Radius.card,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.darkGray,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  heroInfo: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  heroName: {
    fontFamily: FontFamily.headingBold,
    color: Colors.gold,
    fontSize: FontSize.lg,
    letterSpacing: 1,
    marginBottom: 3,
  },
  heroClass: {
    color: Colors.violet,
    fontSize: FontSize.xs,
    letterSpacing: 2,
    marginBottom: 6,
  },
  levelPill: {
    backgroundColor: 'rgba(123,92,240,0.2)',
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  levelPillText: {
    fontFamily: FontFamily.heading,
    color: Colors.violet,
    fontSize: FontSize.xs,
    letterSpacing: 1,
  },
  xpTrack: {
    height: 5,
    backgroundColor: Colors.darkGray,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  xpFill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 3,
  },
  xpLabel: {
    color: Colors.midGray,
    fontSize: FontSize.xs,
    letterSpacing: 0.5,
  },

  // Status card
  statusCard: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: Radius.sm,
    padding: Spacing.sm + 4,
    borderLeftWidth: 2,
    borderLeftColor: Colors.violet,
  },
  statusText: {
    fontFamily: FontFamily.heading,
    fontStyle: 'italic',
    color: Colors.white,
    fontSize: FontSize.sm,
    lineHeight: 20,
    opacity: 0.9,
  },

  // ── Section header ──
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: FontFamily.heading,
    color: Colors.gold,
    fontSize: FontSize.xs,
    letterSpacing: 3,
  },
  sectionCount: {
    fontFamily: FontFamily.heading,
    color: Colors.gold,
    fontSize: FontSize.xs,
    letterSpacing: 1,
    opacity: 0.7,
  },

  // ── Quest row ──
  questRow: {
    backgroundColor: Colors.deepPurple,
    borderRadius: Radius.card,
    borderLeftWidth: 3,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    marginBottom: 10,
  },
  questMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  questTypeLabel: {
    fontSize: FontSize.xs,
    letterSpacing: 2,
    fontFamily: FontFamily.heading,
  },
  questXP: {
    fontSize: FontSize.xs,
    letterSpacing: 1,
    fontFamily: FontFamily.heading,
  },
  questTitle: {
    fontFamily: FontFamily.headingBold,
    color: Colors.white,
    fontSize: FontSize.base,
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  questDesc: {
    color: Colors.midGray,
    fontSize: FontSize.sm,
    lineHeight: 18,
    marginBottom: 10,
  },
  questTrack: {
    height: 3,
    backgroundColor: Colors.darkGray,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  questFill: {
    height: '100%',
    borderRadius: 2,
  },
  questProgress: {
    color: Colors.midGray,
    fontSize: FontSize.xs,
    textAlign: 'right',
  },

  // ── Bottom widget row ──
  widgetRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  widget: {
    flex: 1,
    backgroundColor: Colors.deepPurple,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.darkGray,
    padding: Spacing.md,
    alignItems: 'center',
  },
  widgetLabel: {
    fontFamily: FontFamily.heading,
    color: Colors.midGray,
    fontSize: FontSize.xs,
    letterSpacing: 3,
    marginBottom: Spacing.sm,
  },

  // Focus widget
  focusWidget: {},
  focusValue: {
    fontFamily: FontFamily.headingBold,
    color: Colors.white,
    fontSize: FontSize['3xl'],
  },
  focusSubLabel: {
    color: Colors.midGray,
    fontSize: FontSize.xs,
    marginTop: 6,
    letterSpacing: 1,
  },

  // Party widget
  partyWidget: {
    alignItems: 'stretch',
  },
  partyName: {
    fontFamily: FontFamily.headingBold,
    color: Colors.white,
    fontSize: FontSize.base,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  bossTrack: {
    height: 5,
    backgroundColor: Colors.darkGray,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  bossFill: {
    height: '100%',
    backgroundColor: Colors.red,
    borderRadius: 3,
  },
  bossHpText: {
    color: Colors.midGray,
    fontSize: FontSize.xs,
    marginBottom: 10,
  },
  countdownRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.darkGray,
    paddingTop: 8,
    width: '100%',
  },
  countdownLabel: {
    color: Colors.midGray,
    fontSize: 9,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  countdownValue: {
    fontFamily: FontFamily.headingBold,
    color: Colors.amber,
    fontSize: FontSize.lg,
    letterSpacing: 1,
  },
});
