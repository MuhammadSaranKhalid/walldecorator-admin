-- Migration: 0011_create_analytics_events
-- Description: Creates the analytics_sessions and analytics_events tables.
-- Improved to normalize session data (IP, Location) and handle anonymous users efficiently.
-- UPDATED: Added real-time metrics support (Bounce Rate, Active Users) via Trigger.

-- 1. Analytics Sessions Table
-- Stores session-level data. Since location and IP are tied to the session/connection
-- rather than every single event, we store them here.
create table if not exists analytics_sessions (
  id uuid primary key references auth.users(id) on delete cascade, -- Session ID IS the User ID
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Location Fields (Session specific)
  country text, -- ISO 3166-1 alpha-2 code (e.g., 'US', 'PK')
  city text, -- e.g., 'Karachi', 'Berlin'
  region text, -- ISO 3166-2 region code
  latitude numeric, -- Geographic latitude
  longitude numeric, -- Geographic longitude
  
  -- Technical / Device Info
  ip_address text, -- User's IP address (Recommend hashing for privacy compliance)
  user_agent text, -- Raw user agent string
  referer text, -- Initial referer for the session (Where they came FROM)
  device_type text, -- e.g., 'mobile', 'desktop'
  os_name text,     -- e.g., 'iOS', 'Windows'
  browser_name text, -- e.g., 'Safari', 'Chrome'
  
  -- Marketing / Attribution (UTM Parameters) - Extracted from Landing Page URL on client side
  utm_source text,   -- e.g. google, newsletter
  utm_medium text,   -- e.g. cpc, email
  utm_campaign text, -- e.g. summer_sale
  utm_term text,
  utm_content text,
  
  -- Realtime & Derived Metrics (Updated via Trigger)
  session_duration_seconds integer default 0, -- Duration in seconds
  page_view_count integer default 0, -- Count of page views in this session
  event_count integer default 0, -- Total count of events in this session
  last_seen_at timestamp with time zone default timezone('utc'::text, now()) -- Last active timestamp
);

-- 2. Analytics Events Table
-- Stores high-volume event data linked to the session.
create table if not exists analytics_events (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  event_name text not null, -- e.g., 'page_view', 'click', 'add_to_cart'
  session_id uuid references analytics_sessions(id) on delete cascade not null, -- If session is deleted, events are irrelevant.
  page_title text, -- Page title for context
  page_url text, -- The URL where the event occurred
  referrer_url text, -- The internal referrer (previous page)
  metadata jsonb default '{}'::jsonb -- Custom properties (e.g., product_id, value)
);

-- Indexes for performance

create index if not exists idx_analytics_sessions_created on analytics_sessions(created_at);
create index if not exists idx_analytics_sessions_country_city on analytics_sessions(country, city); -- Optimized for Geo-queries (Map)
create index if not exists idx_analytics_sessions_device on analytics_sessions(device_type); -- For device stats
create index if not exists idx_analytics_sessions_utm on analytics_sessions(utm_source, utm_campaign); -- Marketing reports
create index if not exists idx_analytics_sessions_last_seen on analytics_sessions(last_seen_at); -- For "Active Users" queries

create index if not exists idx_analytics_events_session on analytics_events(session_id);
create index if not exists idx_analytics_events_name_created on analytics_events(event_name, created_at); -- Optimized for Event filtering
create index if not exists idx_analytics_events_created on analytics_events(created_at);

-- RLS Policies
alter table analytics_sessions enable row level security;
alter table analytics_events enable row level security;

-- Allow authenticated users (including anonymous) to insert/update THEIR OWN session
create policy "Allow users to manage own session"
  on analytics_sessions
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Allow authenticated users to SELECT their own session (Required for Event RLS check)
create policy "Allow users to select own session"
  on analytics_sessions
  for select
  using (auth.uid() = id);

-- Allow authenticated users to insert events for THEIR session
create policy "Allow users to insert own events"
  on analytics_events
  for insert
  with check (
    exists (
      select 1 from analytics_sessions
      where id = session_id
      and id = auth.uid()
    )
  );

-- Allow authenticated users (Admins/Dashboard) to view data
-- You may want to restrict this further to specific admin roles
create policy "Allow admins to select sessions"
  on analytics_sessions
  for select
  using (auth.role() = 'authenticated');

create policy "Allow admins to select events"
  on analytics_events
  for select
  using (auth.role() = 'authenticated');

-- FUNCTIONS & TRIGGERS --

-- Function to update session metrics on new event
create or replace function public.update_session_metrics()
returns trigger
language plpgsql
security definer
as $$
begin
  update analytics_sessions
  set 
    last_seen_at = new.created_at,
    event_count = event_count + 1,
    page_view_count = case 
      when new.event_name = 'page_view' then page_view_count + 1 
      else page_view_count 
    end,
    -- Simple duration approximation: define duration as (last_event - first_event)
    -- This update is cheap, we just re-calculate interval from created_at
    session_duration_seconds = extract(epoch from (new.created_at - created_at))::integer
  where id = new.session_id;
  
  return new;
end;
$$;

-- Trigger to fire on every new event insert
drop trigger if exists on_analytics_event_created on analytics_events;
create trigger on_analytics_event_created
  after insert on analytics_events
  for each row
  execute function update_session_metrics();
