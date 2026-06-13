# ArcRise — Backend Guide

> Written for someone new to backend development.  
> Uses ArcRise as the concrete example throughout.

---

## What You Need to Study (Full-Stack Roadmap)

Everything needed to understand and build ArcRise end-to-end — frontend and backend.

### 1 — The Absolute Foundation (learn once, applies everywhere)

| Topic | What it is | Why you need it |
|---|---|---|
| **How the internet works** | DNS, IP addresses, HTTP, request/response cycle | Everything in both frontend and backend runs on top of this |
| **JSON** | The data format apps and servers use to talk | Every API request and response is JSON |
| **Command line basics** | Navigating folders, running commands in terminal | You can't deploy or run a backend without this |
| **Git** | Version control — tracking changes to your code | Essential before writing any serious code |

### 2 — Frontend Stack (what ArcRise is built with)

| Topic | What it is | Where it appears in ArcRise |
|---|---|---|
| **JavaScript** | The base language | Everything |
| **TypeScript** | JavaScript with types | All `.ts` / `.tsx` files |
| **React** | UI component model, hooks, state | Every screen |
| **React Native** | React but for mobile (no HTML, uses View/Text) | Layout, gestures, platform APIs |
| **Expo** | Toolchain that wraps React Native | Build system, fonts, permissions |
| **React Query** | Server state management — fetching, caching, mutations | All `use*Query`, `use*Mutation` hooks |
| **Zustand** | Client state management — lightweight global store | `useAppStore`, `useOnboardingStore`, `useSessionStore` |
| **React Navigation** | Screen routing and navigation | `RootNavigator`, `ModalNavigator`, `AppNavigator` |
| **Reanimated** | Smooth native animations | Every animation in every screen |
| **react-native-svg** | SVG rendering on mobile | Hero portraits, radar chart, aura rings, sigils |

### 3 — Backend Stack (what you'd build next)

| Topic | What it is | Where it appears |
|---|---|---|
| **Python basics** | The language FastAPI is written in | All backend code |
| **REST APIs** | The convention for how URLs and HTTP methods are structured | Your 7 endpoints (`GET /hero`, `PATCH /hero`, etc.) |
| **FastAPI** | Python framework that creates the API server | The server that receives requests from the app |
| **SQL** | Language for talking to databases | Querying and updating the 4 tables |
| **PostgreSQL** | The database itself | Stores heroes, journal, quests, party |
| **SQLAlchemy or Psycopg2** | Python library that connects FastAPI to PostgreSQL | The bridge between your Python code and the database |
| **Pydantic** | Python library for data validation (built into FastAPI) | Makes sure incoming JSON matches the expected shape |
| **Environment variables** | How you store secrets (database passwords, API keys) | `.env` file — never hardcode credentials |
| **CORS** | Browser/app security rule — you have to explicitly allow your app to call your server | One config line in FastAPI, but if you skip it, nothing works |

### 4 — Connecting Frontend to Backend

| Topic | What it is | Where it appears |
|---|---|---|
| **`fetch` API** | Built-in JavaScript function that makes HTTP requests | Replaces `mock*` calls in the 4 React Query hook files |
| **Async/await** | How JavaScript handles operations that take time (network requests) | All your mutation handlers already use this |
| **Authentication (JWT)** | How the server knows which user is making a request | Needed before you have multiple users — not needed for single-user MVP |
| **Error handling** | What to show when a request fails | `isError` state in React Query, try/catch in mutations |

### 5 — Deployment (getting it live)

| Topic | What it is | Why you need it |
|---|---|---|
| **Docker** *(optional)* | Packages your app + its dependencies into a container | Makes deployment consistent — not required for small projects |
| **Cloud hosting basics** | Render, Railway, Fly.io — how to deploy a Python server | So your app can reach the backend from any device |
| **Database hosting** | Supabase or Railway PostgreSQL | So your database isn't just on your laptop |
| **HTTPS / SSL** | Encrypted connection between app and server | Required for production — Render/Railway handle this automatically |

### Honest Priority Order

Learn in this sequence. Each step builds on the last.

```
1. JavaScript fundamentals          ← 2–3 weeks
2. TypeScript basics                ← 3–4 days
3. React fundamentals               ← 2–3 weeks
4. React Native + Expo              ← 1–2 weeks
5. React Query + Zustand            ← 1 week
   ── you are roughly here ──
6. Python basics                    ← 1–2 weeks
7. SQL fundamentals                 ← 1 week
8. FastAPI                          ← 1 week
9. Connecting frontend to backend   ← 3–4 days
10. Deployment                      ← 2–3 days
```

Total from zero to full-stack ArcRise: ~3–4 months of consistent learning (1–2 hours/day).

### What to Skip for Now

- Docker — Render/Railway handle containerization for you
- Authentication / JWT — not needed until you have multiple users
- Redis, message queues, microservices — way beyond what ArcRise needs
- GraphQL — REST is perfectly fine here
- Next.js / web frontend — ArcRise is mobile-only

---

## What is a Backend?

Right now ArcRise stores everything **inside the app itself** — Arjun's stats, journal entries, quests all live in memory on the phone. Reinstall the app and it's gone. No two users can share data.

A **backend** is a separate program running on a server (a computer in the cloud) that:
- Stores data permanently in a database
- Handles logic that shouldn't run on the user's phone
- Serves multiple users (so party members stay in sync in real time)

**Restaurant analogy:**
- Frontend = the dining room. What the customer sees and touches.
- Backend = the kitchen. Receives orders, processes them, sends food back.
- Database = the fridge. Where the actual ingredients (data) live permanently.

---

## How Frontend and Backend Talk

The app communicates with the backend over the internet using **HTTP requests** — the same protocol a browser uses to load a webpage. The data travels as **JSON** (a simple text format that looks like a JavaScript object).

There are 4 request types:

| Request | Meaning | ArcRise example |
|---|---|---|
| `GET` | Fetch data | "Give me Arjun's hero stats" |
| `POST` | Create something new | "Add this journal entry" |
| `PATCH` | Update something | "Set Arjun's XP to 967" |
| `DELETE` | Delete something | "Remove this quest" |

---

## Step-by-Step: What Happens on a Focus Session Complete

**Right now (mock):**
```
FocusScreen
  → updateHero.mutateAsync({ xp: 967 })
    → mockUpdateHero()          ← fake function, updates in-memory object
      → React Query re-renders UI
```

**After backend is connected:**
```
FocusScreen
  → updateHero.mutateAsync({ xp: 967 })
    → fetch('https://api.arcrise.com/hero/hero-1', {
          method: 'PATCH',
          body: JSON.stringify({ xp: 967 })
      })
        → FastAPI server receives the request
          → Updates row in PostgreSQL database
            → Returns updated hero as JSON
              → React Query re-renders UI
```

The screen code does not change at all. Only the inside of the React Query hook changes.

---

## Why ArcRise is Already Ready for This

The project was built with a clean separation between hooks and mock functions.

Every data operation goes through one of these 4 files:

| Hook file | What it does | Mock it calls today |
|---|---|---|
| `src/services/api/useHero.ts` | Get/update hero | `mockGetHero`, `mockUpdateHero` |
| `src/services/api/useJournal.ts` | Get/add journal entries | `mockGetJournal`, `mockAddEntry` |
| `src/services/api/useQuests.ts` | Get/complete quests | `mockGetQuests`, `mockCompleteQuest` |
| `src/services/api/useParty.ts` | Get party data | `mockGetParty` |

To migrate one endpoint to the real backend: open the hook file, replace the `mock*` import with a `fetch()` call. The hook signature stays the same. All screens stay untouched. You can do this **one endpoint at a time**.

**Example — migrating `useHeroQuery`:**

```ts
// Before
import { mockGetHero } from '@/services/mock/hero.mock';

export function useHeroQuery() {
  return useQuery({
    queryKey: ['hero'],
    queryFn: () => mockGetHero(),   // ← swap this line only
  });
}

// After
export function useHeroQuery() {
  return useQuery({
    queryKey: ['hero'],
    queryFn: () => fetch('https://api.arcrise.com/hero').then(r => r.json()),
  });
}
```

---

## What You Need to Build (FastAPI + PostgreSQL)

### The Backend: FastAPI (Python)

FastAPI is a Python framework. You write simple functions and decorate them with the URL path. FastAPI handles all the HTTP machinery.

```python
# Example: one endpoint in FastAPI
@app.get("/hero")
def get_hero():
    hero = db.query("SELECT * FROM heroes WHERE id = 'hero-1'")
    return hero

@app.patch("/hero/{hero_id}")
def update_hero(hero_id: str, patch: HeroPatch):
    db.execute("UPDATE heroes SET xp = ? WHERE id = ?", patch.xp, hero_id)
    return db.query("SELECT * FROM heroes WHERE id = ?", hero_id)
```

### The 6 Endpoints You Need

| Method | Path | What it does |
|---|---|---|
| `GET` | `/hero` | Return the hero's full data |
| `PATCH` | `/hero/{id}` | Update hero stats, XP, lastActivityAt |
| `GET` | `/quests` | Return all quests |
| `PATCH` | `/quests/{id}/complete` | Mark a quest complete |
| `GET` | `/journal` | Return all journal entries (newest first) |
| `POST` | `/journal` | Add a new journal entry |
| `GET` | `/party` | Return party + boss data |

### The Database: PostgreSQL

4 tables — one per domain type:

```sql
-- Heroes
CREATE TABLE heroes (
  id          TEXT PRIMARY KEY,
  name        TEXT,
  hero_class  TEXT,
  level       INT,
  xp          INT,
  focus       INT,
  physique    INT,
  craft       INT,
  wisdom      INT,
  discipline  INT,
  aura        INT,
  created_at  TIMESTAMP,
  last_activity_at TIMESTAMP
);

-- Journal entries
CREATE TABLE journal_entries (
  id         TEXT PRIMARY KEY,
  hero_id    TEXT REFERENCES heroes(id),
  day        INT,
  type       TEXT,
  prose      TEXT,
  is_milestone BOOLEAN,
  created_at TIMESTAMP
);

-- Quests
CREATE TABLE quests (
  id          TEXT PRIMARY KEY,
  type        TEXT,
  title       TEXT,
  description TEXT,
  xp_reward   INT,
  progress    INT,
  target      INT,
  completed_at TIMESTAMP
);

-- Party
CREATE TABLE parties (
  id           TEXT PRIMARY KEY,
  name         TEXT,
  health_pct   INT,
  boss_name    TEXT,
  boss_max_hp  INT,
  boss_curr_hp INT,
  boss_ends_at TIMESTAMP
);
```

---

## The Full Picture

```
┌─────────────────────────┐
│   ArcRise App (Phone)   │
│                         │
│  FocusScreen            │
│    → useHeroQuery()     │
│    → useUpdateHero()    │
└────────────┬────────────┘
             │  HTTP (JSON)
             │  PATCH /hero/hero-1
             │  { "xp": 967 }
             ▼
┌─────────────────────────┐
│  FastAPI Server (Cloud) │
│                         │
│  PATCH /hero/{id}       │
│    validates request    │
│    writes to database   │
│    returns updated hero │
└────────────┬────────────┘
             │  SQL queries
             ▼
┌─────────────────────────┐
│  PostgreSQL Database    │
│                         │
│  heroes table           │
│  journal_entries table  │
│  quests table           │
│  parties table          │
└─────────────────────────┘
```

---

## Hosting (Free Options to Start)

| Service | What it hosts | Free tier |
|---|---|---|
| [Railway](https://railway.app) | FastAPI + PostgreSQL together | $5 credit/month (generous for dev) |
| [Render](https://render.com) | FastAPI server | Free (spins down after inactivity) |
| [Supabase](https://supabase.com) | PostgreSQL only | Free up to 500MB |
| [Fly.io](https://fly.io) | FastAPI server | Free tier available |

**Easiest path:** Supabase for the database (gives you a hosted Postgres with a dashboard to inspect data) + Render for the FastAPI server.

---

## Migration Order (Recommended)

Do this one endpoint at a time. The app works throughout.

1. Set up FastAPI project locally, install `uvicorn` + `fastapi` + `psycopg2`
2. Set up Supabase database, create the 4 tables
3. Build + test `GET /hero` endpoint locally
4. Swap `mockGetHero` in `useHero.ts` — confirm WarRoom shows real data
5. Build `PATCH /hero` — confirm focus session XP saves and persists after restart
6. Build `GET /journal` + `POST /journal` — confirm Chronicle shows entries
7. Build quests + party endpoints
8. Deploy FastAPI to Render, point the app at the live URL
9. Done — full real backend

---

## What Does NOT Change in the Frontend

- Zero screen files change
- Zero navigation changes
- Zero component changes
- Zero type changes (the JSON shape from FastAPI must match `src/types/hero.ts` etc.)
- `generateJournalEntry.ts` stays as-is until the LLM upgrade (Step 20)
