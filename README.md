# Smart Bharat 🇮🇳

**A GenAI-powered civic companion** that helps Indian citizens understand government
services, report civic issues, and track complaints — in English, Hindi, or Tamil.

Built for hackathon demo reliability: every AI-dependent feature has a hardcoded
fallback, so the app **never shows an error screen**, even if the AI provider or
database is unavailable.

---

## Features

- **AI Chat Assistant** (`/chat`) — Ask about 15 common Indian government services
  (Aadhaar, PAN, Voter ID, Ration Card, Passport, Driving License, Birth/Death
  Certificate, Income Certificate, Caste Certificate, Property Tax, Water Connection,
  Domicile Certificate, Senior Citizen Card, Disability Certificate) and get a
  plain-language answer. Falls back to structured, hardcoded service info if the AI
  is unavailable.
- **Complaint Reporting** (`/report`) — Submit a civic issue with an auto-suggested
  category and priority (via AI, with a pure-keyword fallback). Get an instant
  tracking ID (`SB-2026-XXXXX`).
- **Complaint Tracking** (`/track`) — Look up a complaint by tracking ID. Status
  (`Submitted → In Review → Resolved`) is computed with pure date math — no AI
  dependency, so it always works.
- **Multilingual support** — English / Hindi / Tamil, selectable from the navbar,
  persisted in `localStorage`. **Note:** actual Hindi/Tamil generation happens via
  the Groq API call (there's no local translation engine) — so a valid
  `GROQ_API_KEY` is required for translation to work. If the key is missing or the
  call fails, the app shows an honest "translation temporarily unavailable" notice
  and falls back to the English structured data rather than silently ignoring your
  language choice.
- **Purple civic-tech design** — Bootstrap 5 (via CDN) for layout/components,
  Tailwind utility classes layered on top for the purple theme.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router), JavaScript | Native Vercel deployment, zero config, no cold-start surprises |
| Backend | Next.js API Routes | Keeps everything in one deployable unit |
| Database | Supabase (Postgres) | Free tier, simple JS client, service-role key for server-only writes |
| AI | Groq API (`llama-3.3-70b-versatile`) | Very low latency + generous free tier — matters live during judging |
| Styling | Bootstrap 5 CDN + Tailwind CSS | Bootstrap for fast layout/components, Tailwind for the purple polish |

---

## Project Structure

```
/app
  page.js                 → Homepage
  /chat/page.js            → Chat Assistant UI
  /report/page.js           → Complaint Reporting UI
  /track/page.js             → Complaint Tracking UI
  /api/chat/route.js         → Chat API (AI + fallback + Supabase logging)
  /api/report/route.js       → Report API (AI triage + fallback + Supabase insert)
  /api/track/route.js        → Track API (Supabase lookup + date-math status)
/lib
  supabase.js               → Supabase client (null-safe if unconfigured)
  askAI.js                  → Reusable Groq wrapper (never throws)
  govtServices.js            → Hardcoded data for 15 govt services + keyword matcher
/components
  Navbar.js, Footer.js, ChatBubble.js, ComplaintForm.js, StatusCard.js
```

---

## 1. Supabase Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, go to **SQL Editor** and run:

```sql
CREATE TABLE chats (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT,
  message TEXT,
  response TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE complaints (
  id BIGSERIAL PRIMARY KEY,
  tracking_id TEXT UNIQUE,
  name TEXT,
  location TEXT,
  category TEXT,
  description TEXT,
  priority TEXT,
  status TEXT DEFAULT 'Submitted',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access" ON chats
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access" ON complaints
  FOR ALL USING (true) WITH CHECK (true);
```

3. Get your credentials:
   - Go to **Project Settings → Data API** for your **Project URL** → `SUPABASE_URL`
   - Go to **Project Settings → API Keys** for your **`service_role` secret key**
     → `SUPABASE_KEY` (this key bypasses RLS — server-side use only, never expose it
     to the browser)

> Menu names occasionally get reshuffled by Supabase — if you don't see these exact
> labels, look under **Project Settings → API** for the same two values.

---

## 2. Groq API Key Setup

1. Sign up at [console.groq.com](https://console.groq.com).
2. Go to **API Keys** → **Create API Key**.
3. Copy the key → `GROQ_API_KEY`.
4. (Optional) Check **console.groq.com/docs/models** occasionally — Groq
   periodically retires older models, so confirm `llama-3.3-70b-versatile`
   (used in `lib/askAI.js`) is still current, and swap it out if not.

---

## 3. Local Development

```bash
npm install
cp .env.example .env.local   # then fill in your keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Note:** The app works with *zero* environment variables configured — it runs in
"fallback-only mode" using only the hardcoded `govtServices.js` data and pure JS
logic. This is intentional (see Build Order below) and makes local testing safe
even before Supabase/Groq are wired up.

---

## 4. Deploy to Vercel

1. Push this repo to GitHub (public repo, per hackathon rules):
   ```bash
   git init
   git add .
   git commit -m "Smart Bharat: initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new) → **Import Project** → select
   your GitHub repo.
3. Under **Environment Variables**, add:
   - `GROQ_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
4. Click **Deploy**. No `vercel.json` needed — Next.js is auto-detected.

Before pushing, always confirm the app builds cleanly:
```bash
npm run build
```

---

## Prompt Workflow / Strategy

This section explains exactly how `askAI(prompt, context)` (in `lib/askAI.js`) is
used across the app, and how each feature degrades gracefully.

### Chat responses (`/api/chat`)
1. The user's message is matched against `govtServices.js` using pure-JS keyword
   matching (`findMatchingService`) — no AI call needed for this step.
2. If a service matches, its structured data (name, authority, required docs,
   process steps) is serialized into the **system/context message**, along with an
   instruction to answer only from that data and respond in the selected language.
3. If no service matches, a general system message describing Smart Bharat's scope
   is used instead, so the model can still respond helpfully or redirect the user.
4. The user's raw message is sent as the **user message** in the same call — one
   round-trip per chat turn (language instruction is folded into the same context
   rather than a separate translation call, to minimize latency during a live demo).
5. **Fallback:** If Groq returns `null` (missing key, timeout, network error, or a
   non-2xx response including 503 "model overloaded"), the app formats the matched
   service's raw structured data into a readable list itself — or, if no service
   matched, returns a static "ask about one of these services" message localized to
   the selected language. The chat UI shows a small "Quick-reference answer" note
   when this happens, so the fallback is transparent but never breaks the flow.

### Category & priority detection (`/api/report`)
1. The complaint description is sent to Groq with a system message instructing it
   to respond with a **strict JSON object only**: `{"category": ..., "priority": ...}`.
2. The response is defensively parsed: markdown fences are stripped, `JSON.parse`
   is wrapped in try/catch, and the resulting `category`/`priority` values are
   validated against fixed allow-lists before being trusted.
3. **Fallback:** If the AI call fails, times out, or returns unparseable/invalid
   JSON, a pure keyword-matching function (`keywordSuggest`) takes over — checking
   the description against category keyword lists (e.g. "pothole" → Roads, "leak" →
   Water) and priority-trigger words (e.g. "fire", "accident", "danger" → High,
   else Medium). This path has zero API dependency and always produces a result.

### Multilingual translation
There is no separate "translate" API call. Instead, a language instruction (e.g.
"Respond in Hindi.") is folded directly into the **same context/system message**
used for the chat response, so each chat turn stays to one Groq round-trip. If the
AI call fails entirely, the pre-written fallback messages are already localized
per-language in `route.js`; if a language-specific fallback string is missing for
some reason, English is shown with a small "Translation temporarily unavailable"
notice.

### Reliability guarantees, end to end
- `askAI()` **never throws** — every failure mode resolves to `null`, so callers
  always have a clean branch to their fallback logic.
- Every Groq call has an explicit **8-second timeout** via `AbortController`.
- Every Supabase call is wrapped in try/catch; failures are logged server-side
  (`console.error`) only, and surfaced to the user as a small inline notice
  ("data won't be saved this session") rather than a crash.
- `/track` status (`Submitted → In Review → Resolved`) is pure date arithmetic on
  the stored timestamp — it never depends on AI and only depends on Supabase being
  reachable for the initial row lookup.
- If `GROQ_API_KEY` is missing, the entire app runs correctly in "fallback-only
  mode" — this is how it's built and tested first (see Build Order).

---

## Build Order (recommended, and how this was actually built/tested)

1. **Fallback-only mode** — no Groq key, no Supabase — confirmed chat, report, and
   track all work end-to-end using only `govtServices.js` and pure JS logic.
2. **Supabase layered in** — ran the `CREATE TABLE` + RLS SQL, confirmed chat
   history and complaints persist, and that `/track` retrieves real submitted
   complaints.
3. **Groq layered in** — confirmed AI responses work, and that removing the API key
   (or simulating a 503) correctly triggers the fallback paths above.
4. **Full journey test** — submit a complaint → get a tracking ID → track it → see
   status; ask chat questions in English, Hindi, and Tamil.

---

## Testing

A Jest unit test suite covers the app's pure business logic — the parts that don't
depend on external services and are the highest-value things to test:

```bash
npm test
```

Covers:
- `lib/govtServices.js` → `findMatchingService()` — keyword matching for all 15
  services, case-insensitivity, spelling variants, and unmatched-query handling
- `lib/reportLogic.js` → `keywordSuggest()` (category + priority detection) and
  `generateTrackingId()` (format + uniqueness)
- `lib/trackLogic.js` → `computeStatus()` — date-math boundaries for
  Submitted / In Review / Resolved

26 tests, all passing. Run `npm test` before every deploy alongside `npm run build`.

---

## Environment Variables

Create a `.env.local` file (see `.env.example`):

```
GROQ_API_KEY=
SUPABASE_URL=
SUPABASE_KEY=
```

None of these are required for the app to run — see "Runtime Safety Checks" above.

---

Built by **Team Smart Bharat** for civic-tech hackathon submission.
