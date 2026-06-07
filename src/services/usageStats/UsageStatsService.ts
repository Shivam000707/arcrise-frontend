import { Platform, NativeModules, Alert, Linking } from 'react-native';

export const BLACKLISTED_APPS: string[] = [
  'com.instagram.android',
  'com.zhiliaoapp.musically',   // TikTok
  'com.google.android.youtube',
  'com.reddit.frontpage',
  'com.snapchat.android',
  'com.twitter.android',
  'com.facebook.katana',
];

const APP_DISPLAY_NAMES: Record<string, string> = {
  'com.instagram.android':      'Instagram',
  'com.zhiliaoapp.musically':   'TikTok',
  'com.google.android.youtube': 'YouTube',
  'com.reddit.frontpage':       'Reddit',
  'com.snapchat.android':       'Snapchat',
  'com.twitter.android':        'Twitter / X',
  'com.facebook.katana':        'Facebook',
};

export interface BlacklistUsageResult {
  detected: boolean;
  appName: string | null;
  packageName: string | null;
  minutesUsed: number;
}

// Returns minutes a specific package was used since sinceMs.
// On iOS: always returns 0 (no intercept — honor system only).
// In dev: random value for testing.
// In prod: calls native UsageStatsManager bridge.
export async function getRecentUsage(
  packageName: string,
  sinceMs: number,
): Promise<number> {
  if (Platform.OS !== 'android') return 0;

  if (__DEV__) {
    // Dev testing fixture — random usage minutes
    return Math.floor(Math.random() * 60);
  }

  // ── NATIVE BRIDGE POINT ──────────────────────────────────────────────────
  // Replace this call with the real native module when UsageStatsModule is built:
  //   return NativeModules.UsageStatsModule.getRecentUsage(packageName, sinceMs);
  // ─────────────────────────────────────────────────────────────────────────
  void packageName; void sinceMs;
  return 0;
}

// Checks if PACKAGE_USAGE_STATS permission is granted.
async function hasUsagePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;

  // ── NATIVE BRIDGE POINT ──────────────────────────────────────────────────
  // Replace with: return NativeModules.UsageStatsModule.hasUsagePermission();
  // ─────────────────────────────────────────────────────────────────────────
  return true; // assume granted in dev/stub builds
}

// Shows permission explanation alert and deep-links to Android Usage Access settings.
export async function requestUsagePermissionIfNeeded(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;

  const granted = await hasUsagePermission();
  if (granted) return true;

  return new Promise((resolve) => {
    Alert.alert(
      'Usage Access Required',
      'ArcRise needs Usage Access permission to detect doomscrolling and protect your focus arc. This data stays entirely on your device.',
      [
        { text: 'Not Now', style: 'cancel', onPress: () => resolve(false) },
        {
          text: 'Open Settings',
          onPress: () => {
            Linking.sendIntent('android.settings.USAGE_ACCESS_SETTINGS');
            resolve(false);
          },
        },
      ],
    );
  });
}

// Checks all blacklisted apps since sinceMs.
// Returns the first app that exceeded 5 minutes of use, or detected: false.
//
// Dev mode: 20% random trigger for testing Mirror flow.
// Prod: polls each package via native bridge (or batch call once bridge is built).
export async function checkBlacklistUsage(sinceMs: number): Promise<BlacklistUsageResult> {
  if (Platform.OS !== 'android') {
    return { detected: false, appName: null, packageName: null, minutesUsed: 0 };
  }

  if (__DEV__) {
    // 20% chance of detecting a blacklisted app — lets you test Mirror screens
    if (Math.random() < 0.2) {
      const pkg = BLACKLISTED_APPS[Math.floor(Math.random() * BLACKLISTED_APPS.length)];
      const minutes = 5 + Math.floor(Math.random() * 40);
      return {
        detected: true,
        appName: APP_DISPLAY_NAMES[pkg] ?? pkg,
        packageName: pkg,
        minutesUsed: minutes,
      };
    }
    return { detected: false, appName: null, packageName: null, minutesUsed: 0 };
  }

  // ── NATIVE BRIDGE POINT ──────────────────────────────────────────────────
  // For efficiency, replace this loop with a single batch native call:
  //   const results = await NativeModules.UsageStatsModule.getBatchUsage(
  //     BLACKLISTED_APPS, sinceMs
  //   );
  //   for (const r of results) {
  //     if (r.minutes >= 5) return { detected: true, appName: APP_DISPLAY_NAMES[r.pkg], ... };
  //   }
  // ─────────────────────────────────────────────────────────────────────────
  for (const pkg of BLACKLISTED_APPS) {
    const minutes = await getRecentUsage(pkg, sinceMs);
    if (minutes >= 5) {
      return {
        detected: true,
        appName: APP_DISPLAY_NAMES[pkg] ?? pkg,
        packageName: pkg,
        minutesUsed: minutes,
      };
    }
  }

  return { detected: false, appName: null, packageName: null, minutesUsed: 0 };
}
