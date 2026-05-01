# YT Auto Command Center — Claude Code Build Brief
## Full specification for Next.js web app on Vercel + Supabase + n8n
### Hand this entire file to Claude Code. It has everything it needs.

---

## PROJECT OVERVIEW

Build a Next.js web app called "YT Auto Command Center" — a single-browser-tab operations dashboard for managing 4 YouTube channels. The app is the operator's one-stop shop: they should never need to open n8n, Oracle terminal, Supabase dashboard, or any other tool to run their operation.

**Operator profile:** Non-technical creator. Needs everything visible and clickable. No jargon, no complex UI. Clean, dark, professional dashboard feel. Think: mission control, not developer console.

**Architecture (keep it simple):**
- Next.js 15 frontend on Vercel (static + client-side only — NO server-side API routes)
- Supabase JS SDK for all data (direct client-side calls with RLS)
- n8n webhooks on Oracle for all automation (frontend just POSTs to webhook URLs)
- Claude API routed through n8n (frontend → n8n webhook → Claude → Supabase → frontend reads result)
- Supabase Realtime subscriptions for live updates (no manual refresh needed)

**Deploy to:** Vercel (same GitHub → Vercel pipeline as LemonX AI Studio)
**GitHub repo name:** `nauxai-com/yt-command-center`

---

## TECH STACK

```
Next.js 15 (App Router)
TypeScript
Tailwind CSS
Supabase JS SDK (@supabase/supabase-js)
SWR (data fetching + cache)
Framer Motion (subtle animations)
Lucide React (icons)
shadcn/ui (components)
```

---

## ENV VARS NEEDED (Vercel + .env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_N8N_BASE_URL=http://YOUR_ORACLE_IP:5678
NEXT_PUBLIC_N8N_WEBHOOK_TOKEN=
```

Note: All vars are NEXT_PUBLIC_ because this is client-side only. No secrets — n8n handles all API keys server-side.

---

## SUPABASE SCHEMA

Create these tables in Supabase. Enable Row Level Security on all. Enable Realtime on all.

```sql
-- Channels
CREATE TABLE channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  niche TEXT,
  status TEXT DEFAULT 'paused' CHECK (status IN ('live', 'building', 'paused')),
  rpm_min NUMERIC,
  rpm_max NUMERIC,
  rpm_pct INTEGER DEFAULT 0,
  audience TEXT DEFAULT 'US',
  cpm_tier TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Queue (video ideas)
CREATE TABLE queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES channels(id),
  day_number INTEGER,
  title TEXT NOT NULL,
  source TEXT DEFAULT 'Manual',
  status TEXT DEFAULT 'idea' CHECK (status IN ('idea', 'research', 'script', 'production', 'uploaded')),
  priority TEXT DEFAULT 'mid' CHECK (priority IN ('high', 'mid', 'low')),
  compliance_score INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pipeline (per channel, per video)
CREATE TABLE pipeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES channels(id),
  queue_id UUID REFERENCES queue(id),
  current_stage INTEGER DEFAULT 0,
  stages_completed INTEGER[] DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scripts (generated scripts)
CREATE TABLE scripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  queue_id UUID REFERENCES queue(id),
  channel_id UUID REFERENCES channels(id),
  content TEXT,
  ab_variant_curiosity TEXT,
  ab_variant_fear TEXT,
  ab_variant_result TEXT,
  compliance_score INTEGER,
  compliance_flags JSONB,
  status TEXT DEFAULT 'generating' CHECK (status IN ('generating', 'ready', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automation logs (what n8n is doing)
CREATE TABLE automation_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_type TEXT NOT NULL,
  channel_id UUID REFERENCES channels(id),
  queue_id UUID REFERENCES queue(id),
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'done', 'failed')),
  message TEXT,
  result JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Research results
CREATE TABLE research (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES channels(id),
  topic TEXT,
  sources JSONB,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance log
CREATE TABLE compliance_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  queue_id UUID REFERENCES queue(id),
  score INTEGER,
  passed BOOLEAN,
  flags JSONB,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## SEED DATA (insert on first run)

```sql
INSERT INTO channels (name, niche, status, rpm_min, rpm_max, rpm_pct, audience, cpm_tier, note) VALUES
('Grimm Archives', 'Money heists · Hidden wealth · Lost treasure', 'live', 18, 45, 60, 'US', 'Finance', 'Active — 30-day content plan loaded'),
('Channel 2', 'Betrayal & Revenge True Stories', 'building', 12, 13, 15, 'US', 'Drama', '21x growth niche — fastest to YPP'),
('Channel 3', 'Jungian Psychology & Shadow Work', 'paused', 7, 12, 8, 'Global', 'Education', 'Slow burn — high LTV for digital products'),
('Channel 4', 'Sleep Soundscapes & Sleep Stories', 'paused', 10, 11, 8, 'Global', 'Wellness', 'Passive — 2 uploads/month');
```

---

## N8N WEBHOOK ENDPOINTS

The app calls these. n8n must have matching webhook workflows active on Oracle.
All are POST requests with JSON body. n8n writes results back to Supabase.

```
POST /webhook/research
  body: { channel_id, topic }
  n8n does: Crawl4AI scrape → Claude summary → writes to research table → writes to automation_log

POST /webhook/generate-script
  body: { queue_id, channel_id, title, key_points }
  n8n does: Claude API → generates script + 3 AB variants → compliance check → writes to scripts table

POST /webhook/compliance-check
  body: { queue_id, script_content }
  n8n does: Claude API → scores against 10 rules → writes to compliance_checks table

POST /webhook/create-short
  body: { queue_id, script_scenes }
  n8n does: calls short-video-maker Docker → returns video URL → writes to automation_log

POST /webhook/run-shorts-detector
  body: { queue_id, youtube_url }
  n8n does: runs AI-Shorts-Generator → returns 3 clip timestamps → writes to automation_log

POST /webhook/notify
  body: { message, type }
  n8n does: sends Slack/email notification → writes to automation_log
```

Helper function for all webhook calls:
```typescript
async function callN8n(webhook: string, body: object) {
  const log = await supabase.from('automation_log').insert({
    job_type: webhook,
    status: 'running',
    message: `Triggered ${webhook}`
  }).select().single()
  
  fetch(`${process.env.NEXT_PUBLIC_N8N_BASE_URL}/webhook/${webhook}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, log_id: log.data?.id })
  }).catch(console.error) // fire and forget — n8n updates Supabase when done
  
  return log.data?.id
}
```

---

## APP STRUCTURE

```
app/
  layout.tsx          — dark background, sidebar nav, live automation status bar at top
  page.tsx            — redirect to /dashboard
  
  (dashboard)/
    layout.tsx        — sidebar + main content area
    
    dashboard/
      page.tsx        — Overview: 4 channel cards + automation feed + quick actions
    
    channels/
      page.tsx        — Channel list with full details + edit
      [id]/page.tsx   — Single channel detail + its queue + pipeline
    
    queue/
      page.tsx        — All videos queue, filterable by channel, searchable
      [id]/page.tsx   — Single video detail: title, status, script, compliance, pipeline stage
    
    pipeline/
      page.tsx        — Pipeline board: all channels, all stages, drag between stages
    
    scripts/
      page.tsx        — Script generator + all generated scripts
      [id]/page.tsx   — Full script view with AB variants + compliance score
    
    compliance/
      page.tsx        — Compliance dashboard: recent checks, scores, flags, rules reference
    
    automation/
      page.tsx        — Live automation feed: what n8n is doing, history, trigger buttons
    
    tools/
      page.tsx        — Tool links + weekly schedule + quick triggers

components/
  layout/
    Sidebar.tsx
    TopBar.tsx         — shows live automation status pill
    
  channels/
    ChannelCard.tsx
    ChannelStatusBadge.tsx
    RPMBar.tsx
    
  queue/
    QueueItem.tsx
    QueueFilters.tsx
    AddVideoModal.tsx
    
  pipeline/
    PipelineStage.tsx
    PipelineProgress.tsx
    
  scripts/
    ScriptGenerator.tsx   — form: topic + key points + [Generate Script] button
    ScriptViewer.tsx      — full script with syntax highlighting
    ABVariants.tsx        — 3 title cards: Curiosity / Fear / Result
    
  compliance/
    ComplianceScore.tsx   — circular score gauge
    ComplianceFlag.tsx    — individual flag with fix instruction
    ComplianceChecker.tsx — paste script → run check → see score
    
  automation/
    AutomationFeed.tsx    — real-time log of all n8n jobs
    AutomationTrigger.tsx — big clickable action buttons
    StatusPill.tsx        — running/done/failed indicator
    
  shared/
    Button.tsx
    Modal.tsx
    Badge.tsx
    Card.tsx
    EmptyState.tsx
    LoadingSpinner.tsx
```

---

## PAGE SPECS (what each page shows and does)

### /dashboard (HOME)
This is what the user sees every time they open the app. Must answer: "What's happening? What needs my attention? What should I do next?"

Layout: 3-column grid on desktop, single column on mobile

Column 1 — Channels (top-level status cards)
- 4 channel cards stacked
- Shows: name, niche, status badge (Live/Building/Paused), RPM range, audience
- Click → goes to /channels/[id]
- Edit name + note inline

Column 2 — Content Queue (next up)
- Top 5 highest-priority queue items
- Sorted by: priority + day number
- Click item → opens /queue/[id]
- [+ Add Idea] button at bottom

Column 3 — Automation Feed (live)
- Realtime Supabase subscription to automation_log
- Shows last 10 automation events
- Color coded: 🟡 running, ✅ done, ❌ failed
- Each shows: job type, channel, time ago, status

Bottom bar — Quick Actions
5 large buttons, each triggers a different n8n webhook:
[🔍 Run Research] [✍ Generate Script] [📱 Create Short] [✅ Check Compliance] [📤 Upload Queue]

Each button opens a small modal asking for the minimum info needed, then fires the webhook and shows "Running..." in the automation feed immediately.

---

### /queue
Content idea management. This is where all 30 Grimm Archives videos live plus future ideas.

Features:
- Filter tabs: All | Grimm Archives | Channel 2 | Channel 3 | Channel 4
- Search bar (title search)
- Sort: Priority | Day | Status | Date added
- Status filter: Idea | Research | Script | Production | Uploaded
- Each row: priority dot (click to cycle) | day number | title | channel badge | source badge | status badge | [Generate Script] quick button | [✕] delete
- Click title → opens /queue/[id]
- [+ Add Idea] button → modal with: title, channel, source, status, priority
- Stats bar: shows count per status across all channels

---

### /queue/[id] — Single Video Detail
The control panel for one video. Everything about this video in one place.

Sections:
1. Header — title (editable), channel, priority, day number, created date
2. Status Pipeline — visual horizontal stepper: Idea → Research → Script → Production → Uploaded. Click stage to advance.
3. Research — if research exists: shows summary + sources. If not: [Run Research] button → triggers n8n → result appears via Supabase subscription
4. Script — if script exists: shows full script. If not: [Generate Script] button → modal → triggers n8n → script appears when done
5. AB Test Variants — 3 title cards (Curiosity / Fear / Result) — editable
6. Compliance — score gauge + flags. [Check Compliance] button if not checked yet
7. Automation History — all n8n jobs run for this video

---

### /pipeline
Kanban-style board showing all active productions across all channels.

Columns = Pipeline stages:
0. Research → 1. Script → 2. Alignment Check → 3. AB Test → 4. Visuals → 5. Voice → 6. Edit → 7. Thumbnail → 8. Compliance → 9. Upload

Each card shows: video title + channel + priority dot
Drag cards between columns OR click to advance
Each column shows count badge
Filter by channel at top

---

### /scripts — Script Generator
The most used page after dashboard. Clean, simple workflow.

Left panel — Input form:
- Topic / Title (text input — can pick from queue)
- Key points to cover (textarea)
- Channel selector (changes the "Creator Take" context)
- [Generate Script] button (large, prominent)
- Shows "Generating..." state with animated loader
- When done → script appears in right panel

Right panel — Output:
- Full script with formatting (section headers, cue markers highlighted in gold: [B-ROLL CUE], [PAUSE], etc.)
- Word count + estimated duration
- AB Test Variants section (3 editable title cards)
- Compliance Score (runs automatically after generation)
- [Save to Queue] button
- [Copy Script] button
- [Copy Prompt for Voiceover] button (formats script for ElevenLabs)

---

### /compliance
Compliance shield dashboard. Makes sure every video is safe before publishing.

Top section — Quick Checker:
- Paste script textarea
- [Check Compliance] button → triggers n8n → score appears
- Score gauge (0–10) — 7+ = pass (green), below 7 = fail (red)
- List of flags with severity (🔴/🟠/🟡) + fix instructions

Middle section — Recent Checks:
- Table of last 20 compliance checks across all channels
- Shows: video title, channel, score, pass/fail, date, flags count
- Click row → see full flag detail

Bottom section — Rules Reference:
- All 10 compliance rules listed
- Toggle between "What's Allowed" and "What Gets Flagged"
- Quick reference for the YT Inauthentic Content policy

---

### /automation — Live Automation Control Room
This is where the user can see everything running and trigger anything manually. Replaces the need to ever open n8n.

Top section — System Status:
- Status cards for each running service:
  - n8n Oracle: 🟢 Online / 🔴 Offline (ping check)
  - short-video-maker: 🟢 Running / 🔴 Stopped
  - Research Scheduler: 🟢 Active / ⏸ Paused
  - Last research run: "6 hours ago"
  - Next scheduled run: "Tomorrow 6:00 AM"

Middle section — Trigger Actions:
Large icon buttons for every automation:
| Button | What it does |
|--------|-------------|
| 🔍 Run Research | Crawl4AI scrapes topics → saves to research table |
| ✍ Generate Script | Claude writes retention-engineered script |
| 📱 Create Short | short-video-maker generates vertical Short |
| 🎬 Detect Viral Clips | AI-Shorts-Generator finds top 3 moments |
| ✅ Check Compliance | Claude scores script against 10 rules |
| 📊 Channel Audit | Claude analyzes channel risk level |

Each button: hover shows description. Click → opens mini-modal for input → fire → shows in live feed immediately.

Bottom section — Live Automation Feed:
Real-time Supabase subscription. Shows every job, updating live.
Format per row:
[status dot] [job type] [channel] [video title if applicable] [time elapsed] [message]

Color coding:
- 🟡 Yellow pulsing dot = running
- ✅ Green = completed successfully
- ❌ Red = failed (shows error message + retry button)

---

### /tools
Simple reference page. No heavy functionality needed.

Section 1 — Tool Links (grid of cards, each opens in new tab):
Google Whisk, Hunyuan Video, NotebookLM, AI Ask Studio, ElevenLabs, Kokoro TTS, CapCut, Canva, YouTube Studio, vidIQ, OpenRouter, n8n Dashboard, Supabase Dashboard

Section 2 — Weekly Schedule:
Clean table: Day | Task | Time | Status (done this week?)
Can check off tasks as done. Resets Sunday midnight.

Section 3 — Quick Stats (Supabase queries):
- Videos queued total
- Scripts generated this month
- Shorts created this month
- Compliance checks run
- Average compliance score

---

## UI/UX DESIGN REQUIREMENTS

**Theme:** Dark — same vibe as Grimm Archives itself. Mysterious, cinematic, professional.

**Colors:**
```
Background: #0D0D0F (near black)
Cards: #141416
Borders: #2A2A2E
Text primary: #F0EFE8 (warm white)
Text secondary: #9B9A94
Accent gold: #EF9F27 (Grimm Archives color)
Gold dim: #BA7517
Success green: #639922
Error red: #E24B4A
Warning amber: #EF9F27
```

**Typography:**
- Headings: Syne (same as LemonX)
- Body: Inter
- Monospace (scripts): JetBrains Mono

**Principles:**
- Every action has immediate visual feedback (loading spinner, status change, toast notification)
- No blank screens — every empty state has a helpful call-to-action
- Realtime updates wherever possible — user should never need to refresh
- Mobile responsive — must work on phone (checking dashboard between tasks at work)
- Keyboard shortcuts for power use: Cmd+K for quick search, Cmd+G for generate script

**Sidebar navigation:**
```
🏠 Dashboard
📺 Channels
📋 Queue
⚙️ Pipeline
✍️ Scripts
🛡️ Compliance
🤖 Automation
🔧 Tools
```

Badge counts on Queue (total items) and Automation (running jobs).

---

## REALTIME SUBSCRIPTIONS (Supabase)

Set up these subscriptions in a global context provider:

```typescript
// AutomationContext — subscribe to live automation feed
supabase.channel('automation').on('postgres_changes', 
  { event: '*', schema: 'public', table: 'automation_log' },
  (payload) => updateFeed(payload)
).subscribe()

// QueueContext — subscribe to queue changes
supabase.channel('queue').on('postgres_changes',
  { event: '*', schema: 'public', table: 'queue' },
  (payload) => updateQueue(payload)
).subscribe()

// ScriptsContext — subscribe for when scripts finish generating
supabase.channel('scripts').on('postgres_changes',
  { event: 'INSERT', schema: 'public', table: 'scripts' },
  (payload) => notifyScriptReady(payload)
).subscribe()
```

---

## NOTIFICATIONS (Toast system)

Use a toast notification system. Show toasts for:
- ✅ "Script generated for [title]" — when scripts table gets new row
- ✅ "Short video ready for [title]" — when automation_log shows short complete
- ✅ "Research complete for [topic]" — when research table updated
- ❌ "Automation failed: [job_type]" — when automation_log shows failure
- ⚠️ "Compliance score low: [score]/10 for [title]" — when score < 7

---

## DEPLOYMENT INSTRUCTIONS

1. Create GitHub repo: `nauxai-com/yt-command-center`
2. Connect to Vercel (same account as LemonX)
3. Add env vars in Vercel dashboard
4. Set up Supabase project, run schema SQL, enable Realtime
5. Deploy — auto-deploys on every push to main

---

## GRIMM ARCHIVES SEED DATA — Queue (first 10 of 30)

After schema is created, insert these into queue table (get channel_id from channels table):

```sql
INSERT INTO queue (channel_id, day_number, title, source, status, priority) VALUES
((SELECT id FROM channels WHERE name='Grimm Archives'), 1, 'The $500 Million Ghost Gallery: The World''s Most Expensive Unsolved Heist', 'AI Ask Studio', 'script', 'high'),
((SELECT id FROM channels WHERE name='Grimm Archives'), 2, 'The Lufthansa Heist: The Truth Behind Americas Greatest Cash Robbery', 'AI Ask Studio', 'script', 'high'),
((SELECT id FROM channels WHERE name='Grimm Archives'), 3, 'The Lost Dutchman''s Gold Mine: A $200 Million Cursed Fortune', 'AI Ask Studio', 'script', 'high'),
((SELECT id FROM channels WHERE name='Grimm Archives'), 4, 'The $600,000,000 Phantom: How the Ronin Network Was Emptied', 'AI Ask Studio', 'script', 'high'),
((SELECT id FROM channels WHERE name='Grimm Archives'), 5, 'Yamashita''s Gold: The Hunt for WWII''s Most Controversial Fortune', 'AI Ask Studio', 'script', 'high'),
((SELECT id FROM channels WHERE name='Grimm Archives'), 6, 'The Copper Scroll: A 2,000-Year-Old Map to Millions', 'AI Ask Studio', 'script', 'high'),
((SELECT id FROM channels WHERE name='Grimm Archives'), 7, 'The Original $20 Billion Scam: The Rise and Fall of Charles Ponzi', 'AI Ask Studio', 'script', 'high'),
((SELECT id FROM channels WHERE name='Grimm Archives'), 8, 'The Nazi Gold Train: A $3 Billion Ghost Story', 'AI Ask Studio', 'script', 'high'),
((SELECT id FROM channels WHERE name='Grimm Archives'), 9, 'The Mt. Gox Meltdown: The Mystery of the 850,000 Missing Bitcoin', 'AI Ask Studio', 'script', 'high'),
((SELECT id FROM channels WHERE name='Grimm Archives'), 10, 'D.B. Cooper: The Only Unsolved Skyjacking in History', 'AI Ask Studio', 'script', 'high');
```

---

## SUCCESS CRITERIA

The app is done when:
- [ ] Operator can open one URL and see all 4 channels, the queue, and automation status
- [ ] Operator can click [Generate Script] → see "Generating..." → see script appear automatically (via Supabase realtime) without refreshing
- [ ] Operator can click [Run Research] → see automation feed update live
- [ ] Operator can drag a queue item from Idea → Script in the Pipeline board
- [ ] Operator can run compliance check on any script and see score + flags
- [ ] Operator can add a new video idea in 3 clicks
- [ ] App works on mobile (for checking between tasks)
- [ ] Deploys cleanly to Vercel on `git push`

