-- CodeCrafters: additive event scheduling and event-specific galleries.
-- Run in this project's Supabase SQL Editor, then share the verification results.
-- Existing records, publication flags, and RLS policies are preserved.
begin;

-- Keep the existing table and IDs so existing records and permissions survive.
-- The admin UI will call this module "Events" rather than "Upcoming Events".
alter table public.upcoming_events
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz,
  add column if not exists status_override text;

-- NULL means automatic: upcoming before starts_at, live until ends_at,
-- and past after ends_at. Explicit overrides allow manual reclassification.
-- Existing free-text dates are not guessed or converted by this migration.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.upcoming_events'::regclass
      and conname = 'cc_event_schedule_order'
  ) then
    alter table public.upcoming_events add constraint cc_event_schedule_order
      check (ends_at is null or (starts_at is not null and ends_at > starts_at));
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.upcoming_events'::regclass
      and conname = 'cc_event_status_override'
  ) then
    alter table public.upcoming_events add constraint cc_event_status_override
      check (status_override is null or status_override in ('upcoming', 'live', 'past'));
  end if;
end $$;

alter table public.past_event_albums
  add column if not exists event_id uuid,
  add column if not exists photo_captions jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.past_event_albums'::regclass
      and conname = 'cc_album_event'
  ) then
    alter table public.past_event_albums add constraint cc_album_event
      foreign key (event_id) references public.upcoming_events(id) on delete set null;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.past_event_albums'::regclass
      and conname = 'cc_photo_captions_object'
  ) then
    alter table public.past_event_albums add constraint cc_photo_captions_object
      check (jsonb_typeof(photo_captions) = 'object');
  end if;
end $$;

create index if not exists cc_album_event_id on public.past_event_albums(event_id);
commit;

-- Verification: share these results after running.
select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'upcoming_events' and column_name in ('starts_at', 'ends_at', 'status_override'))
    or (table_name = 'past_event_albums' and column_name in ('event_id', 'photo_captions'))
  )
order by table_name, column_name;
