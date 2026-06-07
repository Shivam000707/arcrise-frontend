import { View, Text } from 'react-native';
import { Party } from '@/types/party';
import { Colors } from '@/constants/colors';
import { Radius } from '@/constants/layout';
import { FontSize } from '@/constants/typography';
import BossHealthBar from './BossHealthBar';

interface PartyWidgetProps {
  party: Party | undefined;
}

export default function PartyWidget({ party }: PartyWidgetProps) {
  if (!party) return null;
  const hpPercent = party.boss.currentHp / party.boss.maxHp;
  return (
    <View
      style={{
        borderRadius: Radius.card,
        backgroundColor: Colors.deepPurple,
        padding: 12,
        borderWidth: 1,
        borderColor: Colors.darkGray,
      }}
    >
      <Text style={{ color: Colors.white, fontSize: FontSize.sm, fontWeight: '600' }}>
        {party.name}
      </Text>
      <BossHealthBar percent={hpPercent} />
      <Text style={{ color: Colors.midGray, fontSize: FontSize.xs, marginTop: 4 }}>
        {party.members.length} members
      </Text>
    </View>
  );
}
