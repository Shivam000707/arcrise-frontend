import { View, Text } from 'react-native';
import { Quest, QuestType } from '@/types/quest';
import { Colors } from '@/constants/colors';
import { Radius } from '@/constants/layout';
import { FontSize } from '@/constants/typography';

const BORDER_COLOR: Record<QuestType, string> = {
  daily: Colors.gold,
  weekly: Colors.violet,
  longterm: Colors.darkGray,
};

interface QuestCardProps {
  quest: Quest;
}

export default function QuestCard({ quest }: QuestCardProps) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: BORDER_COLOR[quest.type],
        borderRadius: Radius.card,
        backgroundColor: Colors.deepPurple,
        padding: 16,
        marginVertical: 6,
      }}
    >
      <Text style={{ color: Colors.white, fontSize: FontSize.base, fontWeight: '600' }}>
        {quest.title}
      </Text>
      <Text style={{ color: Colors.midGray, fontSize: FontSize.sm, marginTop: 4 }}>
        {quest.description}
      </Text>
      <Text style={{ color: Colors.gold, fontSize: FontSize.xs, marginTop: 8, letterSpacing: 1 }}>
        +{quest.xpReward} XP
      </Text>
    </View>
  );
}
