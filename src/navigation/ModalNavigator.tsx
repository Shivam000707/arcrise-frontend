import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ModalStackParamList } from './types';
import AppNavigator from './AppNavigator';
import FocusScreen from '@/screens/focus/FocusScreen';
import MirrorScreen from '@/screens/mirror/MirrorScreen';
import MirrorCorruptedScreen from '@/screens/mirror/MirrorCorruptedScreen';
import LevelUpScreen from '@/screens/levelup/LevelUpScreen';

const Stack = createNativeStackNavigator<ModalStackParamList>();

export default function ModalNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="App" component={AppNavigator} />
      <Stack.Screen
        name="Focus"
        component={FocusScreen}
        options={{ presentation: 'fullScreenModal', animation: 'fade' }}
      />
      <Stack.Screen
        name="Mirror"
        component={MirrorScreen}
        options={{ presentation: 'fullScreenModal', animation: 'fade' }}
      />
      <Stack.Screen
        name="MirrorCorrupted"
        component={MirrorCorruptedScreen}
        options={{ presentation: 'fullScreenModal', animation: 'fade' }}
      />
      <Stack.Screen
        name="LevelUp"
        component={LevelUpScreen}
        options={{ presentation: 'fullScreenModal', animation: 'fade' }}
      />
    </Stack.Navigator>
  );
}
