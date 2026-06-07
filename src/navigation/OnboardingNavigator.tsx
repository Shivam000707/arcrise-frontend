import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from './types';
import AwakeningScreen from '@/screens/onboarding/AwakeningScreen';
import ClassSelectScreen from '@/screens/onboarding/ClassSelectScreen';
import HeroNamingScreen from '@/screens/onboarding/HeroNamingScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="Awakening" component={AwakeningScreen} />
      <Stack.Screen name="ClassSelect" component={ClassSelectScreen} />
      <Stack.Screen name="HeroNaming" component={HeroNamingScreen} />
    </Stack.Navigator>
  );
}
