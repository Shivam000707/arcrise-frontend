import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '@/store/useAppStore';

// Watches mirrorActive in useAppStore and imperatively navigates to MirrorScreen
// or MirrorCorruptedScreen. Must be called from inside NavigationContainer.
// Uses a triggeredRef to prevent double-navigation on re-renders.
export function useMirrorTrigger(): void {
  const navigation      = useNavigation();
  const mirrorActive    = useAppStore((s) => s.mirrorActive);
  const mirrorCorrupted = useAppStore((s) => s.mirrorCorrupted);
  const detectedAppName = useAppStore((s) => s.detectedAppName);
  const triggeredRef    = useRef(false);

  useEffect(() => {
    if (mirrorActive && !triggeredRef.current) {
      triggeredRef.current = true;
      const screen = mirrorCorrupted ? 'MirrorCorrupted' : 'Mirror';
      // Navigate to the mirror modal in the parent ModalNavigator.
      // React Navigation resolves sibling screens via parent traversal.
      navigation.navigate(screen as never, {
        appName: detectedAppName ?? undefined,
      } as never);
    }

    if (!mirrorActive) {
      triggeredRef.current = false;
    }
  }, [mirrorActive, mirrorCorrupted, detectedAppName, navigation]);
}
