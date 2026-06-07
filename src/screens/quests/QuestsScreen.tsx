import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuestsQuery } from '@/services/api/useQuests';
import { Quest, QuestType } from '@/types/quest';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Radius, Spacing } from '@/constants/layout';

const SECTION_LABEL: Record<QuestType, string> = {
  daily:    'DAILY',
  weekly:   'WEEKLY',
  longterm: 'LONG-TERM',
};

function QuestCard({ quest }: { quest: Quest }) {
  const done    = !!quest.completedAt;
  const pct     = quest.target > 0 ? Math.min(1, quest.progress / quest.target) : 0;

  return (
    <View style={[styles.card, done && styles.cardDone]}>
      <View style={styles.cardRow}>
        <Text style={[styles.questTitle, done && styles.dim]} numberOfLines={1}>{quest.title}</Text>
        {done && <Text style={styles.check}>✓</Text>}
      </View>
      <Text style={[styles.questDesc, done && styles.dim]}>{quest.description}</Text>
      {!done && (
        <>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(pct * 100)}%` as `${number}%` }]} />
          </View>
          {quest.target > 1 && (
            <Text style={styles.progressText}>{quest.progress} / {quest.target}</Text>
          )}
        </>
      )}
      <Text style={[styles.xp, done && styles.dim]}>+{quest.xpReward} XP</Text>
    </View>
  );
}

function SectionHeader({ type, count }: { type: QuestType; count: number }) {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionLabel}>{SECTION_LABEL[type]}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count}</Text>
      </View>
    </View>
  );
}

export default function QuestsScreen() {
  const insets              = useSafeAreaInsets();
  const { data: quests = [] } = useQuestsQuery();

  const active    = quests.filter((q) => !q.completedAt);
  const completed = quests.filter((q) => !!q.completedAt);
  const daily     = active.filter((q) => q.type === 'daily');
  const weekly    = active.filter((q) => q.type === 'weekly');
  const longterm  = active.filter((q) => q.type === 'longterm');

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <Text style={styles.heading}>ALL QUESTS</Text>

        {active.length === 0 && (
          <Text style={styles.empty}>No active quests. The board is clear.</Text>
        )}

        {daily.length > 0 && (
          <View style={styles.section}>
            <SectionHeader type="daily" count={daily.length} />
            {daily.map((q) => <QuestCard key={q.id} quest={q} />)}
          </View>
        )}

        {weekly.length > 0 && (
          <View style={styles.section}>
            <SectionHeader type="weekly" count={weekly.length} />
            {weekly.map((q) => <QuestCard key={q.id} quest={q} />)}
          </View>
        )}

        {longterm.length > 0 && (
          <View style={styles.section}>
            <SectionHeader type="longterm" count={longterm.length} />
            {longterm.map((q) => <QuestCard key={q.id} quest={q} />)}
          </View>
        )}

        {completed.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={[styles.sectionLabel, styles.dim]}>COMPLETED</Text>
              <View style={[styles.badge, { backgroundColor: Colors.darkGray }]}>
                <Text style={styles.badgeText}>{completed.length}</Text>
              </View>
            </View>
            {completed.map((q) => <QuestCard key={q.id} quest={q} />)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: Colors.background },
  content:      { padding: Spacing.md },
  heading: {
    fontFamily:  FontFamily.headingBold,
    fontSize:    FontSize.xl,
    color:       Colors.gold,
    textAlign:   'center',
    letterSpacing: 3,
    marginTop:   Spacing.md,
    marginBottom: Spacing.lg,
  },
  empty: {
    fontFamily:  FontFamily.heading,
    fontSize:    FontSize.base,
    color:       Colors.violet,
    fontStyle:   'italic',
    textAlign:   'center',
    marginTop:   Spacing.xl,
  },
  section:      { marginBottom: Spacing.lg },
  sectionHead:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  sectionLabel: {
    fontFamily:   FontFamily.headingBold,
    fontSize:     FontSize.xs,
    color:        Colors.midGray,
    letterSpacing: 2,
  },
  badge: {
    backgroundColor: Colors.violet,
    borderRadius: Radius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontFamily: FontFamily.headingBold,
    fontSize:   10,
    color:      Colors.white,
  },
  card: {
    backgroundColor: Colors.deepPurple,
    borderRadius:    Radius.card,
    padding:         Spacing.md,
    marginBottom:    Spacing.sm,
    borderWidth:     1,
    borderColor:     Colors.darkGray,
  },
  cardDone:   { opacity: 0.5 },
  cardRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  questTitle: { fontFamily: FontFamily.headingBold, fontSize: FontSize.base, color: Colors.white, flex: 1 },
  check:      { fontFamily: FontFamily.headingBold, fontSize: FontSize.base, color: Colors.gold, marginLeft: Spacing.sm },
  questDesc:  { fontFamily: FontFamily.heading, fontSize: FontSize.sm, color: Colors.midGray, marginBottom: Spacing.sm },
  progressTrack: {
    height:          4,
    backgroundColor: Colors.darkGray,
    borderRadius:    Radius.full,
    overflow:        'hidden',
    marginBottom:    4,
  },
  progressFill: {
    height:          '100%',
    backgroundColor: Colors.violet,
    borderRadius:    Radius.full,
  },
  progressText: { fontFamily: FontFamily.heading, fontSize: FontSize.xs, color: Colors.midGray, marginBottom: 4 },
  xp:           { fontFamily: FontFamily.headingBold, fontSize: FontSize.sm, color: Colors.gold, marginTop: 4 },
  dim:          { color: Colors.midGray },
});
