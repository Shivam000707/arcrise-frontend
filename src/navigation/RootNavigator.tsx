import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import OnboardingNavigator from './OnboardingNavigator';
import ModalNavigator from './ModalNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const completed = useOnboardingStore((s) => s.completed);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {!completed ? (
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      ) : (
        <Stack.Screen name="Modal" component={ModalNavigator} />
      )}
    </Stack.Navigator>
  );
}
