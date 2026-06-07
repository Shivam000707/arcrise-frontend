import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePartyQuery } from '@/services/api/useParty';
import { PartyMember } from '@/types/party';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Radius, Spacing } from '@/constants/layout';
import HeroPortrait from '@/components/hero/HeroPortrait';

function daysUntil(isoDate: string): number {
  return Math.max(0, Math.ceil((new Date(isoDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

function MemberRow({ member, isVanguard }: { member: PartyMember; isVanguard: boolean }) {
  return (
    <View style={styles.memberRow}>
      <HeroPortrait stage={2} heroState="thriving" size={40} />
      <View style={styles.memberInfo}>
        <View style={styles.memberNameRow}>
          <Text style={styles.memberName}>{member.heroName}</Text>
          {isVanguard && (
            <View style={styles.vanguardBadge}>
              <Text style={styles.vanguardText}>VANGUARD</Text>
            </View>
          )}
        </View>
        <Text style={styles.memberClass}>{member.heroClass.toUpperCase()}</Text>
      </View>
      <View style={styles.memberStats}>
        <Text style={styles.focusLabel}>FOCUS</Text>
        <Text style={styles.focusValue}>{member.focusStat}</Text>
        <Text style={styles.xpToday}>{member.dailyFocusXp > 0 ? `+${member.dailyFocusXp}` : '—'}</Text>
      </View>
    </View>
  );
}

export default function PartyScreen() {
  const insets            = useSafeAreaInsets();
  const { data: party }   = usePartyQuery();

  // Empty state
  if (!party) {
    return (
      <View style={[styles.root, styles.empty, { paddingTop: insets.top }]}>
        <Text style={styles.emptyHeading}>Form a party.</Text>
        <Text style={styles.emptySubtitle}>No one levels up alone.</Text>
        <View style={styles.ctaButton}>
          <Text style={styles.ctaText}>CREATE A PARTY</Text>
        </View>
      </View>
    );
  }

  const maxFocus     = Math.max(...party.members.map((m) => m.focusStat));
  const damageDone   = party.boss.maxHp - party.boss.currentHp;
  const bossPct      = party.boss.currentHp / party.boss.maxHp;
  const daysLeft     = daysUntil(party.boss.endsAt);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}>

        {/* Party name */}
        <Text style={styles.partyName}>{party.name.toUpperCase()}</Text>

        {/* Party health bar */}
        <Text style={styles.barLabel}>PARTY HEALTH</Text>
        <View style={styles.bigTrack}>
          <View style={[styles.bigFill, {
            width: `${Math.round(party.healthPercent)}%` as `${number}%`,
            backgroundColor: Colors.teal,
          }]} />
          <Text style={styles.bigPct}>{party.healthPercent}%</Text>
        </View>

        <View style={styles.divider} />

        {/* Boss countdown card */}
        <View style={styles.bossCard}>
          <View style={styles.bossTopRow}>
            <Text style={styles.bossName}>{party.boss.name.toUpperCase()}</Text>
            <View style={styles.countdownChip}>
              <Text style={styles.countdownText}>{daysLeft}D REMAINING</Text>
            </View>
          </View>
          <Text style={styles.bossHpText}>
            {party.boss.currentHp.toLocaleString()} / {party.boss.maxHp.toLocaleString()} HP
          </Text>
          <View style={styles.bigTrack}>
            <View style={[styles.bigFill, {
              width: `${Math.round(bossPct * 100)}%` as `${number}%`,
              backgroundColor: Colors.red,
            }]} />
          </View>
          <Text style={styles.damageText}>{damageDone.toLocaleString()} damage dealt this week</Text>
        </View>

        <View style={styles.divider} />

        {/* Members */}
        <Text style={styles.membersTitle}>MEMBERS</Text>
        {party.members.map((m) => (
          <MemberRow key={m.id} member={m} isVanguard={m.focusStat === maxFocus} />
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: Colors.background },
  content:        { padding: Spacing.md },

  // Empty state
  empty:          { justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyHeading: {
    fontFamily:    FontFamily.headingBold,
    fontSize:      FontSize['2xl'],
    color:         Colors.white,
    letterSpacing: 2,
    textAlign:     'center',
  },
  emptySubtitle: {
    fontFamily:    FontFamily.heading,
    fontSize:      FontSize.base,
    color:         Colors.midGray,
    textAlign:     'center',
    marginTop:     Spacing.sm,
    marginBottom:  Spacing.xl,
  },
  ctaButton: {
    backgroundColor: Colors.gold,
    borderRadius:    Radius.button,
    paddingVertical:   Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  ctaText: {
    fontFamily:    FontFamily.headingBold,
    fontSize:      FontSize.sm,
    color:         Colors.background,
    letterSpacing: 2,
  },

  // Party view
  partyName: {
    fontFamily:    FontFamily.headingBold,
    fontSize:      FontSize['2xl'],
    color:         Colors.gold,
    letterSpacing: 3,
    textAlign:     'center',
    marginTop:     Spacing.md,
    marginBottom:  Spacing.lg,
  },
  barLabel: {
    fontFamily:    FontFamily.headingBold,
    fontSize:      FontSize.xs,
    color:         Colors.midGray,
    letterSpacing: 2,
    marginBottom:  6,
  },
  bigTrack: {
    height:          12,
    backgroundColor: Colors.darkGray,
    borderRadius:    Radius.full,
    overflow:        'hidden',
    justifyContent:  'center',
  },
  bigFill: {
    position:     'absolute',
    left:         0,
    top:          0,
    bottom:       0,
    borderRadius: Radius.full,
  },
  bigPct: {
    fontFamily:    FontFamily.headingBold,
    fontSize:      FontSize.xs,
    color:         Colors.white,
    textAlign:     'center',
    zIndex:        1,
  },
  divider: {
    height:          1,
    backgroundColor: Colors.darkGray,
    marginVertical:  Spacing.lg,
  },

  // Boss card
  bossCard: {
    backgroundColor: Colors.deepPurple,
    borderRadius:    Radius.card,
    padding:         Spacing.md,
    borderWidth:     1,
    borderColor:     `${Colors.red}60`,
  },
  bossTopRow: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    marginBottom:    4,
  },
  bossName: {
    fontFamily:    FontFamily.headingBold,
    fontSize:      FontSize.sm,
    color:         Colors.red,
    letterSpacing: 1,
    flex:          1,
  },
  countdownChip: {
    backgroundColor: `${Colors.red}22`,
    borderRadius:    Radius.button,
    paddingVertical: 3,
    paddingHorizontal: Spacing.sm,
    borderWidth:     1,
    borderColor:     `${Colors.red}60`,
  },
  countdownText: {
    fontFamily:    FontFamily.headingBold,
    fontSize:      8,
    color:         Colors.red,
    letterSpacing: 1,
  },
  bossHpText: {
    fontFamily:  FontFamily.heading,
    fontSize:    FontSize.xs,
    color:       Colors.midGray,
    marginBottom: 6,
  },
  damageText: {
    fontFamily:  FontFamily.heading,
    fontSize:    FontSize.xs,
    color:       Colors.midGray,
    marginTop:   6,
  },

  // Members
  membersTitle: {
    fontFamily:    FontFamily.headingBold,
    fontSize:      FontSize.xs,
    color:         Colors.gold,
    letterSpacing: 3,
    marginBottom:  Spacing.md,
  },
  memberRow: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.deepPurple,
    borderRadius:    Radius.card,
    padding:         Spacing.md,
    marginBottom:    Spacing.sm,
    borderWidth:     1,
    borderColor:     Colors.darkGray,
    gap:             Spacing.md,
  },
  memberInfo:    { flex: 1 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  memberName: {
    fontFamily:  FontFamily.headingBold,
    fontSize:    FontSize.base,
    color:       Colors.white,
  },
  vanguardBadge: {
    backgroundColor: `${Colors.gold}22`,
    borderRadius:    Radius.button,
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderWidth:     1,
    borderColor:     Colors.gold,
  },
  vanguardText: {
    fontFamily:    FontFamily.headingBold,
    fontSize:      8,
    color:         Colors.gold,
    letterSpacing: 1,
  },
  memberClass: {
    fontFamily:    FontFamily.heading,
    fontSize:      FontSize.xs,
    color:         Colors.midGray,
    letterSpacing: 1,
    marginTop:     2,
  },
  memberStats: { alignItems: 'flex-end' },
  focusLabel: {
    fontFamily:    FontFamily.headingBold,
    fontSize:      8,
    color:         Colors.midGray,
    letterSpacing: 1,
  },
  focusValue: {
    fontFamily: FontFamily.headingBold,
    fontSize:   FontSize.lg,
    color:      Colors.violet,
  },
  xpToday: {
    fontFamily: FontFamily.heading,
    fontSize:   FontSize.xs,
    color:      Colors.teal,
  },
});
