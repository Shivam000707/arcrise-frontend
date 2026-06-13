# ArcRise — Demo Walkthrough Script

> For: first-time viewers  
> Duration: ~5 minutes  
> Build: Preview APK (`eas build --profile preview`)

---

## Before You Start

- Use a physical Android device or emulator (Android 9+)
- Install the Preview APK — app shows as **ArcRise Preview**
- Clear app data before the demo so onboarding plays fresh
- Keep the device in portrait, brightness up

---

## The Walkthrough

### 1 — The Awakening (Screen 1)

**What to say:**  
"This is the opening screen. Every new hero starts here."

**What to tap:**  
Wait for the ember particles to rise and the fade-in to complete (~1.5s), then tap **BEGIN YOUR ARC**.

**Highlight:**  
- Rising ember particles (Reanimated, no image assets)  
- Gold horizon gradient  
- Cinzel font — the whole app uses this for headings, gives it the RPG weight

---

### 2 — Class Selection (Screen 2)

**What to say:**  
"You pick your archetype. Each class has different primary stats that level faster. The Builder — think founder, maker, programmer."

**What to tap:**  
Tap **The Builder** card. Point out the scale animation and gold checkmark. Then tap **FORGE YOUR DESTINY**.

**Highlight:**  
- Unique SVG sigil per class (geometric, procedural — no images)  
- Selection animation: border brightens, sigil box turns gold-tinted  
- CTA stays disabled until a class is selected

---

### 3 — Hero Naming (Screen 3)

**What to say:**  
"Name your hero. The live preview updates as you type."

**What to tap:**  
Type **Arjun** (or any name). Show the live preview line updating. Tap **BEGIN THE ARC →**.

**Highlight:**  
- Pulsing glow rings on the sigil (Reanimated withRepeat)  
- Live preview: `THE ARJUN BEGINS.`  
- Violet expansion animation covers the screen, then War Room loads underneath

---

### 4 — War Room (Screen 4 — main hub)

**What to say:**  
"This is the daily hub. Everything is live data — stats, quests, party. The status line at the top is generated from a template engine that varies by class and day number."

**What to point out:**  
- Hero portrait (procedural SVG — no image files)  
- Level 12, XP bar showing progress within the current level  
- Active quests with progress bars — Iron Trial is 2/4  
- FOCUS ring widget (bottom left)  
- Party widget: The Forge, boss HP, 3-day countdown

---

### 5 — Focus Session (Screen 5)

**What to say:**  
"Starting a focus session. This is the core loop — you lock in, the timer counts down, the ring fills. No doomscroll apps allowed."

**What to tap:**  
Tap the **Focus** area or navigate to it. Show the countdown ring, the stat chips (+0.4/min FOCUS, XP earned), the pulsing green dot.

Tap **PAUSE** — show the ring freezes and the PAUSED badge appears. Tap **RESUME**.

Then tap the small **Surrender** link at the bottom.

**What to say:**  
"The surrender link is intentionally hard to find. We designed the friction in. The confirmation sheet shows the XP cost."

Tap **KEEP GOING** to dismiss.

**Highlight:**  
- Timer is real — it counts down  
- XP earned updates live  
- Surrender flow: 30 XP penalty, journal entry written

---

### 6 — Mirror Screen (trigger manually for demo)

**What to say:**  
"In production, this appears automatically when the Android usage stats module detects a blacklisted app — Instagram, TikTok, YouTube, Reddit. In the dev build it triggers randomly 20% of the time on foreground. Let me show you what it looks like."

*(If it doesn't trigger naturally, navigate to it via developer tools or wait for the random trigger)*

**What to point out:**  
- Red vignette bleeding in from all four edges  
- Portrait flicker animation (Reanimated)  
- Two choices: PROTECT MY ARC (no penalty) vs Continue Anyway (47 XP, stat hit)  
- The corrupted variant has aggressive flicker, stronger red, and a live FOCUS stat warning box

---

### 7 — The Chronicle (Screen 6)

**What to say:**  
"Every action writes itself into the journal. These 8 entries were pre-seeded to show the 18-day journey — focus sessions, a doomscroll slip on Day 11, a 14-day streak milestone. When the LLM upgrade lands, this is one function call swap."

**What to point out:**  
- DAY XX label + prose columns  
- Gold ornamental dividers  
- MILESTONE badge on Day 7 and Day 14  
- Floating card at bottom with blinking cursor  
- SHARE YOUR ARC — tapping formats the last 3 entries as a shareable story card

---

### 8 — Hero Screen

**What to say:**  
"Full stat breakdown. The radar chart is pure SVG — six axes, grid rings, gold dots at each stat vertex. The talent tree shows which nodes are unlocked for this class."

**What to point out:**  
- HeroPortrait (size 120, full aura visible)  
- Radar chart — FOCUS 74 and DISCIPLINE 70 peak clearly  
- AURA at 48 — visually lower, near decay threshold  
- Locked talent node pulses gently

---

### 9 — Party Screen

**What to say:**  
"Party system. The Forge has four members. Arjun holds VANGUARD — highest FOCUS score. The Distraction Wraith boss has taken 544 damage out of 1200 HP. Boss fight ends in 3 days."

**What to point out:**  
- Party health bar (full width, teal)  
- Boss HP bar with damage dealt  
- VANGUARD gold badge on Arjun  
- Each member shows their HeroPortrait + FOCUS stat

---

## Known Limitations to Mention Proactively

1. **iOS intercept is honor system** — the Mirror screen only triggers on Android via the Usage Stats API. On iOS there's no OS-level interception; it would rely on the user self-reporting.

2. **Portraits are procedural, not commissioned** — the hero silhouettes are pure SVG shapes. The roadmap includes illustrated art per class × stage.

3. **All data is mocked** — the FastAPI backend is deferred. Switching to live data is a base URL swap per endpoint — the hooks are already written for it.

4. **Native Android module is stubbed** — the `NativeModules.UsageStatsModule` bridge is a comment placeholder. The architecture and permission flow are wired; the Java/Kotlin bridge code is the remaining piece.

5. **No push notifications yet** — Firebase Cloud Messaging is a post-MVP step.

---

## APK Build Command

```bash
# Preview APK (installable, shareable, release-mode)
eas build --profile preview --platform android

# Development APK (debug, Expo dev client)
eas build --profile development --platform android
```

**Requirements to run the build:**
- EAS CLI: `npm install -g eas-cli`
- Logged in: `eas login`
- Expo account linked to this project (`eas.json` is already configured)
- Java 17+ on PATH (for Android builds on local machine — not needed for EAS cloud build)
