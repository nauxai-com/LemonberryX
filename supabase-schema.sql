-- ============================================================
-- LemonberryX — Supabase Schema + Seed
-- Run this in your Supabase SQL editor
-- ============================================================

-- Channels
create table if not exists channels (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  niche text,
  status text default 'paused',
  rpm_target text,
  rpm_pct integer default 0,
  audience text default 'US',
  cpm_tier text,
  note text,
  pipeline_stage integer default 0,
  created_at timestamptz default now()
);

-- Content Queue
create table if not exists queue (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  channel_id uuid references channels(id) on delete set null,
  day_number integer,
  source text default 'Manual',
  status text default 'idea',
  priority text default 'mid',
  ab_curiosity text,
  ab_fear text,
  ab_result text,
  script_content text,
  compliance_score integer,
  notes text,
  created_at timestamptz default now()
);

-- Compliance Logs
create table if not exists compliance_logs (
  id uuid default gen_random_uuid() primary key,
  queue_id uuid references queue(id) on delete set null,
  channel_id uuid references channels(id) on delete set null,
  score integer,
  originality_score integer,
  production_score integer,
  compliance_score integer,
  flags jsonb,
  checked_at timestamptz default now()
);

-- Automation Logs
create table if not exists automation_logs (
  id uuid default gen_random_uuid() primary key,
  action text not null,
  channel_id uuid references channels(id) on delete set null,
  queue_id uuid references queue(id) on delete set null,
  status text default 'pending',
  payload jsonb,
  result jsonb,
  triggered_at timestamptz default now()
);

-- RLS: enable for all tables (single-user — allow all for anon)
alter table channels enable row level security;
alter table queue enable row level security;
alter table compliance_logs enable row level security;
alter table automation_logs enable row level security;

create policy "allow_all_channels" on channels for all using (true) with check (true);
create policy "allow_all_queue" on queue for all using (true) with check (true);
create policy "allow_all_compliance" on compliance_logs for all using (true) with check (true);
create policy "allow_all_automation" on automation_logs for all using (true) with check (true);

-- ============================================================
-- SEED: Channels
-- ============================================================
insert into channels (name, niche, status, rpm_target, rpm_pct, audience, cpm_tier, note, pipeline_stage) values
('Grimm Archives',  'Money heists · Hidden wealth · Lost treasure',    'live',           '$18–45', 60, 'US',     'Finance',   'Active — 30-day content plan loaded', 0),
('Channel 2',       'Betrayal & Revenge True Stories',                  'repositioning',  '$12–13', 15, 'US',     'Drama',     '21x growth niche — fastest path to YPP', 0),
('Channel 3',       'Jungian Psychology & Shadow Work',                 'paused',         '$7–12',   8, 'Global', 'Education', 'Slow burn — high LTV for digital products', 0),
('Channel 4',       'Sleep Soundscapes & Sleep Stories',                'paused',         '$10.92',  8, 'Global', 'Wellness',  'Passive — 2 uploads/month', 0);

-- ============================================================
-- SEED: Queue (30 Grimm Archives videos)
-- Run after channels are seeded — replace (select id from...) if needed
-- ============================================================
do $$
declare ch_id uuid;
begin
  select id into ch_id from channels where name = 'Grimm Archives' limit 1;

  insert into queue (title, channel_id, day_number, source, status, priority) values
  ('The $500 Million Ghost Gallery: The World''s Most Expensive Unsolved Heist',           ch_id,  1, 'AI Ask Studio', 'script', 'high'),
  ('The Lufthansa Heist: The Truth Behind America''s Greatest Cash Robbery',               ch_id,  2, 'AI Ask Studio', 'script', 'high'),
  ('The Lost Dutchman''s Gold Mine: A $200 Million Cursed Fortune',                        ch_id,  3, 'AI Ask Studio', 'script', 'high'),
  ('The $600,000,000 Phantom: How the Ronin Network Was Emptied',                          ch_id,  4, 'AI Ask Studio', 'script', 'high'),
  ('Yamashita''s Gold: The Hunt for WWII''s Most Controversial Fortune',                   ch_id,  5, 'AI Ask Studio', 'script', 'high'),
  ('The Copper Scroll: A 2,000-Year-Old Map to Millions',                                  ch_id,  6, 'AI Ask Studio', 'script', 'high'),
  ('The Original $20 Billion Scam: The Rise and Fall of Charles Ponzi',                    ch_id,  7, 'AI Ask Studio', 'script', 'high'),
  ('The Nazi Gold Train: A $3 Billion Ghost Story',                                        ch_id,  8, 'AI Ask Studio', 'script', 'high'),
  ('The Mt. Gox Meltdown: The Mystery of the 850,000 Missing Bitcoin',                     ch_id,  9, 'AI Ask Studio', 'script', 'high'),
  ('D.B. Cooper: The Only Unsolved Skyjacking in History',                                 ch_id, 10, 'AI Ask Studio', 'script', 'high'),
  ('The $300 Million Ghost Room: Where is the Amber Room?',                                ch_id, 11, 'AI Ask Studio', 'script', 'mid'),
  ('El Dorado: The Deadly Truth Behind the City of Gold',                                  ch_id, 12, 'AI Ask Studio', 'script', 'mid'),
  ('The $20 Million Liquid Gold Heist: The Great Maple Syrup Robbery',                     ch_id, 13, 'AI Ask Studio', 'script', 'mid'),
  ('King John''s Lost Fortune: A 1,000-Year-Old $70 Million Cold Case',                    ch_id, 14, 'AI Ask Studio', 'script', 'mid'),
  ('Dead Men Tell No Tales: The $200,000,000 Locked Crypto Vault',                         ch_id, 15, 'AI Ask Studio', 'script', 'mid'),
  ('Finding $10 Million in a Backyard: The Mystery of the Saddle Ridge Hoard',             ch_id, 16, 'AI Ask Studio', 'script', 'mid'),
  ('The Oak Island Money Pit: The World''s Most Expensive Unsolved Hole',                  ch_id, 17, 'AI Ask Studio', 'script', 'mid'),
  ('The $400 Billion King: How Mansa Musa Destroyed an Economy with Gold',                 ch_id, 18, 'AI Ask Studio', 'script', 'mid'),
  ('The Vanishing Fortune: Where Did the Romanov Gold Go?',                                ch_id, 19, 'AI Ask Studio', 'script', 'mid'),
  ('George Washington: The Secret Real Estate Empire of the First President',              ch_id, 20, 'AI Ask Studio', 'script', 'mid'),
  ('The $100 Billion Ghost: The Secret Wealth of Howard Hughes',                           ch_id, 21, 'AI Ask Studio', 'script', 'low'),
  ('The Trillion-Dollar Theft: The Secret Files of Nikola Tesla',                          ch_id, 22, 'AI Ask Studio', 'script', 'low'),
  ('The Man Who Never Died: The Financial Secrets of the Count of Saint Germain',          ch_id, 23, 'AI Ask Studio', 'script', 'low'),
  ('The Golden Library: Ivan the Terrible''s $1 Billion Missing Archive',                  ch_id, 24, 'AI Ask Studio', 'script', 'low'),
  ('Charlemagne''s Secret: The $50 Million Artifact of Power',                             ch_id, 25, 'AI Ask Studio', 'script', 'low'),
  ('The $33 Million Mistake: The Hunt for the Missing Fabergé Eggs',                       ch_id, 26, 'AI Ask Studio', 'script', 'low'),
  ('The Vatican''s Secret Vault: $15 Billion in Hidden History?',                          ch_id, 27, 'AI Ask Studio', 'script', 'low'),
  ('The Vanishing $160 Million: Where is the Confederate Gold?',                           ch_id, 28, 'AI Ask Studio', 'script', 'low'),
  ('The Forbidden Tomb: A $20 Billion Fortune We''re Too Scared to Open',                  ch_id, 29, 'AI Ask Studio', 'script', 'low'),
  ('D.B. Cooper Follow-up: New Evidence from the Washington Wilderness',                   ch_id, 30, 'AI Ask Studio', 'script', 'low');
end $$;
