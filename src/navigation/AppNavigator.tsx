import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabParamList } from './types';
import { Colors } from '@/constants/colors';
import WarRoomScreen from '@/screens/home/WarRoomScreen';
import QuestsScreen from '@/screens/quests/QuestsScreen';
import JournalScreen from '@/screens/journal/JournalScreen';
import HeroScreen from '@/screens/hero/HeroScreen';
import PartyScreen from '@/screens/party/PartyScreen';
import { useStatDecay } from '@/hooks/useStatDecay';
import { useMirrorTrigger } from '@/hooks/useMirrorTrigger';

const Tab = createBottomTabNavigator<TabParamList>();

// Invisible component that runs background hooks requiring NavigationContainer context.
function AppGuard() {
  useStatDecay();
  useMirrorTrigger();
  return null;
}

export default function AppNavigator() {
  return (
    <>
      <AppGuard />
      <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.darkGray,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: Colors.violet,
        tabBarInactiveTintColor: Colors.midGray,
        tabBarLabelStyle: { fontSize: 11, letterSpacing: 0.5 },
      }}
    >
      <Tab.Screen name="WarRoom" component={WarRoomScreen} options={{ title: 'War Room' }} />
      <Tab.Screen name="Quests" component={QuestsScreen} />
      <Tab.Screen name="Journal" component={JournalScreen} options={{ title: 'Chronicle' }} />
      <Tab.Screen name="Hero" component={HeroScreen} />
      <Tab.Screen name="Party" component={PartyScreen} />
    </Tab.Navigator>
    </>
  );
}
