import { Hero, HeroClass } from '@/types/hero';
import { EntryType } from '@/types/journal';

export interface JournalEvent {
  type: EntryType;
  detail?: Record<string, unknown>;
}

const CLASS_TITLE: Record<HeroClass, string> = {
  builder:  'the Builder',
  athlete:  'the Athlete',
  creator:  'the Creator',
  scholar:  'the Scholar',
  warrior:  'the Warrior',
};

// Deterministic pick: same hero + day → same template; different day → rotates.
// Changing classIdx means different classes see different templates on the same day.
function pick<T>(arr: T[], day: number, classIdx: number): T {
  return arr[(day + classIdx) % arr.length];
}

const CLASS_IDX: Record<HeroClass, number> = {
  builder: 0, athlete: 1, creator: 2, scholar: 3, warrior: 4,
};

// ─── Focus (8 templates, 4 duration buckets × 2) ─────────────────────────────

const FOCUS_SHORT = [
  (n: string, day: number) =>
    `Some sessions begin before their time. On Day ${day}, ${n} put down the phone, opened the work, and stayed long enough to remember who they are. The chronicle marks it: this counts.`,
  (n: string, day: number) =>
    `The session was brief. What it proved is not brief at all: on Day ${day}, ${n} still chooses this. That choice is the whole foundation.`,
];

const FOCUS_MEDIUM = [
  (n: string, day: number) =>
    `An hour of working silence on Day ${day}. ${n} built something that required no applause and no audience. That is the kind of work that accumulates into something real.`,
  (n: string, day: number) =>
    `Day ${day}: ${n} held focus across forty minutes while the lesser impulse tugged and was refused. This is what discipline looks like before it becomes effortless — refusing something small, repeatedly.`,
];

const FOCUS_LONG = [
  (n: string, day: number) =>
    `Past the one-hour mark on Day ${day}, something changed. The early resistance burned off and what remained was the work itself. ${n} reached that state today — and stayed.`,
  (n: string, day: number) =>
    `Seventy-three minutes. The chronicle does not record this number to boast. It records it because the arc is made of numbers like this, stacked quietly, one session at a time. Day ${day}: the stack grows.`,
];

const FOCUS_EPIC = [
  (n: string, day: number) =>
    `Ninety minutes of unbroken attention on Day ${day} is not a casual achievement. ${n} held the line while the world knocked. The chronicle acknowledges this without ceremony: this is simply what the arc requires, and ${n} delivered it.`,
  (n: string, day: number) =>
    `There are sessions where you fight the work. And there are sessions where you become it. Day ${day}'s session was the second kind. ${n} emerged worn in the way that matters — the good tiredness that is proof of something.`,
];

// ─── Doomscroll (6 templates, 3 duration buckets × 2) ────────────────────────

const DOOMSCROLL_BRIEF = [
  (n: string, day: number) =>
    `A brief detour into the feed on Day ${day}. ${n} noticed the pull, followed it, and returned. The arc bends — it does not break. The cost was small. The awareness is not nothing.`,
  (n: string, day: number) =>
    `Ten minutes. The app was closed. ${n} is still here on Day ${day}. The story continues. The chronicle prefers honesty over silence, and so it writes this down.`,
];

const DOOMSCROLL_MODERATE = [
  (n: string, day: number) =>
    `Twenty-seven minutes in the feed on Day ${day}. The chronicle records this without judgment — judgment belongs to ${n} alone. What it notes is that the path back was found, and taken.`,
  (n: string, day: number) =>
    `The pull was real. ${n} felt it and went anyway. Day ${day}: the adversary offers something that feels like rest and delivers something that feels like debt. The arc absorbs the cost and waits.`,
];

const DOOMSCROLL_LONG = [
  (n: string, day: number) =>
    `An hour given to the feed on Day ${day}. The chronicle writes this plainly, without softening it: an hour is an hour. ${n} knows. The arc does not disappear. But it requires attention tomorrow.`,
  (n: string, day: number) =>
    `The scroll ran long on Day ${day}. ${n} knew it while it was happening and continued anyway. There is something honest about this — the chronicle prefers honesty to silence. Tomorrow is a different choice.`,
];

// ─── Quest complete (5 templates) ────────────────────────────────────────────

const QUEST_DAILY = [
  (n: string, day: number) =>
    `The daily trial: closed on Day ${day}. ${n} did not need inspiration to start. They started because the quest was there, and they are becoming the kind of person who does the work when the work is scheduled.`,
  (n: string, day: number) =>
    `Another day, another trial completed. Day ${day}: the chronicle grows heavier with small victories. These are the bricks. ${n} is building something, one unremarkable completion at a time.`,
];

const QUEST_WEEKLY = [
  (n: string, day: number) =>
    `The week's gauntlet — closed on Day ${day}. ${n} did not complete this in a single brilliant session. It was done across days, without audience. That is what weekly quests require: persistence over brilliance.`,
  (n: string, day: number) =>
    `A seven-day trial concludes. ${n} did not feel heroic every day of it. They did not need to feel heroic. They needed to show up. On Day ${day}, they can say: they showed up.`,
];

const QUEST_LONGTERM = [
  (n: string, day: number) =>
    `The long quest ends on Day ${day}. What looks like a single victory from the outside was, from the inside, a hundred small choices that could have gone the other way. ${n} made each one correctly enough to reach this day.`,
];

// ─── Level up (4 templates) ───────────────────────────────────────────────────

const LEVELUP_TEMPLATES = [
  (n: string, day: number, level: number) =>
    `Level ${level}. The number alone tells only part of the story on Day ${day}. The rest is written in the sessions, the refusals, the days ${n} continued when continuing was harder than stopping.`,
  (n: string, day: number, level: number) =>
    `The arc crosses a threshold: Level ${level} on Day ${day}. Those who watched may not understand how this happened. The chronicle knows: one day at a time, one refusal at a time, one completed session at a time.`,
  (n: string, day: number, level: number) =>
    `${n} has become more than they were. Not dramatically — incrementally. And then on Day ${day}, which looked like any other day, the threshold crossed. Level ${level}.`,
  (n: string, day: number, level: number) =>
    `What is a level? It is not a gift. Level ${level} on Day ${day} is the accumulated weight of decisions made correctly, compressed into a number. ${n} earned every digit.`,
];

// ─── Streak milestones (4 templates, one per tier) ───────────────────────────

const STREAK_7 = [
  (n: string, day: number) =>
    `Seven days unbroken on Day ${day}. The chronicle marks the first week with a quiet note: the streak has begun in earnest. ${n} has proven the first thing — that they can begin. Everything else grows from here.`,
];

const STREAK_14 = [
  (n: string, day: number) =>
    `Two weeks on Day ${day}. The first week proves intent. The second week proves something harder: that the intent was real. ${n} has passed both tests.`,
];

const STREAK_30 = [
  (n: string, day: number) =>
    `Thirty days on Day ${day}. The arc does not bend here. At thirty days, most people have either quit or begun to believe in themselves. ${n} has begun to believe.`,
];

const STREAK_60 = [
  (n: string, day: number) =>
    `Sixty days unbroken. The chronicle does not have many entries at sixty days — most arcs turn away before this point. Day ${day}: ${n}'s arc does not turn. It continues forward.`,
];

// ─── Party (4 templates: 2 victory + 2 defeat) ───────────────────────────────

const PARTY_VICTORY = [
  (n: string, day: number) =>
    `The party struck true on Day ${day}. The boss took damage. ${n} was part of something larger than themselves, and the shared effort multiplied what any one member could have done alone.`,
  (n: string, day: number) =>
    `Together, they advanced on Day ${day}. The chronicle records this party victory not only as a number but as a statement: these people chose to build alongside each other. That choice has value beyond the XP.`,
];

const PARTY_DEFEAT = [
  (n: string, day: number) =>
    `The party fell short on Day ${day}. The boss survived. This is recorded not in shame but in record: the effort was real, the gap is known, and the party stands together in defeat as it does in victory.`,
  (n: string, day: number) =>
    `Not every battle goes as intended. On Day ${day} the party regrouped. ${n} was there for the loss as for the gains. In party quests, that presence matters as much as the damage dealt.`,
];

// ─── Milestone (4 templates) ──────────────────────────────────────────────────

const MILESTONE_TEMPLATES = [
  (n: string, day: number) =>
    `The milestone falls on Day ${day}. ${n} did not reach this moment through brilliance — through continuity. The arc has been continuous. That is worth recording.`,
  (n: string, day: number) =>
    `Something has been crossed on Day ${day} that cannot be uncrossed. ${n} is not the same person who started this arc. The distance from the beginning can be felt now. The chronicle takes notice.`,
  (n: string, day: number) =>
    `A line written in something heavier than ink: on Day ${day}, ${n} crossed a threshold that only the consistent reach. It was built slowly. It arrived without announcement. That is how it always arrives.`,
  (n: string, day: number) =>
    `The arc bends forward on Day ${day}. ${n} has achieved something worth writing down — not because it is large, but because it proves the kind of person they are becoming. The chronicle trusts this direction.`,
];

// ─── Daily status (6 templates) ───────────────────────────────────────────────

const DAILY_STATUS_TEMPLATES = [
  (n: string) =>
    `The arc does not rest. ${n} is active, building, and further from the starting point than yesterday. The work continues.`,
  (n: string) =>
    `Today is another day of the arc. The chronicle is watching. ${n} already knows what to do.`,
  (n: string) =>
    `${n} stands at the edge of what they have built. The work ahead is not smaller than the work behind. But neither is the person doing it.`,
  (n: string) =>
    `There are days when the arc feels heavy. There are days when it lifts. Either way, ${n} carries it forward. Today is one of those days.`,
  (n: string) =>
    `The chronicle is open. ${n}'s next entry has not yet been written. What it will say depends entirely on what happens in the next hour.`,
  (n: string) =>
    `Yesterday's choices built today's standing. Today's choices will build tomorrow's. ${n} understands this. That understanding is the advantage.`,
];

// ─── Stat increase (4 templates) ──────────────────────────────────────────────

const STAT_INCREASE_TEMPLATES = [
  (n: string, day: number, stat: string) =>
    `A number moved on Day ${day}: ${stat}. ${n} is measurably different from who they were. The arc is quantified — but what the number represents is unquantifiable: the practice of getting better, repeated.`,
  (n: string, day: number, stat: string) =>
    `${stat} climbed on Day ${day}. It did not climb by accident. It climbed because ${n} did the kind of work that makes numbers climb. The chronicle records the result; the work is what the chronicle is really about.`,
  (n: string, day: number) =>
    `${n}'s capabilities are not fixed. Day ${day} proved it again. Something that was weaker is stronger. Something that was lower is higher. The arc is upward.`,
  (n: string, day: number, stat: string) =>
    `Progress — real progress — on Day ${day}: ${stat} increased. Not the kind that feels good in a moment, but the kind that shows up in the numbers. ${n} built something today. The chronicle confirms it.`,
];

// ─── Stat decay (4 templates) ─────────────────────────────────────────────────

const STAT_DECAY_TEMPLATES = [
  (n: string, day: number, stats: string) =>
    `The arc does not forget neglect. On Day ${day}, the chronicle records a quiet diminishment: ${stats}. ${n} has been absent from the disciplines that sustain them. The path back is known. It runs through the work.`,
  (n: string, day: number, stats: string) =>
    `What is built can erode. Day ${day}: ${stats} have weakened in ${n}'s absence. The chronicle does not write this in blame — it writes it in record. The arc will rise again when the effort returns.`,
  (n: string, day: number, stats: string) =>
    `Inertia has a cost. ${n} has stepped back from their practice, and Day ${day} shows it in the numbers: ${stats}. This is not an ending. It is a mirror held up by the arc itself.`,
  (n: string, day: number) =>
    `The stats do not hold without maintenance. Day ${day}: the decline is logged. ${n} knows what is required. The arc waits — it does not judge — but it does keep score.`,
];

// ─── Main export ──────────────────────────────────────────────────────────────

// Single function: swap this body for an LLM call to upgrade to AI-generated prose.
export function generateJournalEntry(event: JournalEvent, hero: Hero): string {
  const title   = CLASS_TITLE[hero.heroClass];
  const ci      = CLASS_IDX[hero.heroClass];
  const name    = hero.name !== 'The Unnamed' ? hero.name : title;
  const day     = Math.max(1, Math.floor(
    (Date.now() - new Date(hero.createdAt).getTime()) / (1000 * 60 * 60 * 24),
  ) + 1);
  const detail  = event.detail ?? {};
  const level   = hero.level;

  switch (event.type) {
    case 'focus': {
      const min = (detail.duration as number) ?? 45;
      if (min < 30)  return pick(FOCUS_SHORT,  day, ci)(name, day);
      if (min < 60)  return pick(FOCUS_MEDIUM, day, ci)(name, day);
      if (min < 90)  return pick(FOCUS_LONG,   day, ci)(name, day);
      return               pick(FOCUS_EPIC,    day, ci)(name, day);
    }

    case 'doomscroll': {
      const min = (detail.duration as number) ?? 20;
      if (min < 15)  return pick(DOOMSCROLL_BRIEF,    day, ci)(name, day);
      if (min < 45)  return pick(DOOMSCROLL_MODERATE, day, ci)(name, day);
      return               pick(DOOMSCROLL_LONG,      day, ci)(name, day);
    }

    case 'quest': {
      const qtype = (detail.questType as string) ?? 'daily';
      if (qtype === 'weekly')   return pick(QUEST_WEEKLY,   day, ci)(name, day);
      if (qtype === 'longterm') return pick(QUEST_LONGTERM, day, ci)(name, day);
      return                         pick(QUEST_DAILY,      day, ci)(name, day);
    }

    case 'levelup':
      return pick(LEVELUP_TEMPLATES, day, ci)(name, day, level);

    case 'streak': {
      const streakDays = (detail.streakDays as number) ?? 7;
      if (streakDays >= 60) return STREAK_60[0](name, day);
      if (streakDays >= 30) return STREAK_30[0](name, day);
      if (streakDays >= 14) return STREAK_14[0](name, day);
      return                      STREAK_7[0](name, day);
    }

    case 'party': {
      const outcome = (detail.outcome as string) ?? 'victory';
      if (outcome === 'defeat') return pick(PARTY_DEFEAT,  day, ci)(name, day);
      return                         pick(PARTY_VICTORY,   day, ci)(name, day);
    }

    case 'milestone':
      return pick(MILESTONE_TEMPLATES, day, ci)(name, day);

    case 'daily_status':
      return pick(DAILY_STATUS_TEMPLATES, day, ci)(name);

    case 'stat_increase': {
      const stat = (detail.statName as string) ?? 'FOCUS';
      return pick(STAT_INCREASE_TEMPLATES, day, ci)(name, day, stat);
    }

    case 'stat_decay': {
      const stats = (detail.stats as string[]) ?? [];
      const label = stats.map((s) => s.toUpperCase()).join(', ') || 'unknown';
      return pick(STAT_DECAY_TEMPLATES, day, ci)(name, day, label);
    }

    default:
      return `On Day ${day}, ${name} moved forward.`;
  }
}
