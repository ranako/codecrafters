-- Persistent carousel and event-card controls for CodeCrafters.
-- Run in Supabase SQL Editor and share the verification results below.
-- Does not modify event/album records or their existing RLS policies.
begin;

create table if not exists public.site_presentation_settings (
  key text primary key check (key in ('gallery_reel', 'event_cards')),
  value jsonb not null check (jsonb_typeof(value) = 'object')
);

alter table public.site_presentation_settings enable row level security;

-- Match the existing CMS authorization model: authenticated editors manage
-- public presentation settings. No anonymous writes or new access to other data.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'site_presentation_settings' and policyname = 'read public presentation settings') then
    create policy "read public presentation settings" on public.site_presentation_settings
      for select to anon, authenticated using (key in ('gallery_reel', 'event_cards'));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'site_presentation_settings' and policyname = 'edit presentation settings') then
    create policy "edit presentation settings" on public.site_presentation_settings
      for update to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'site_presentation_settings' and policyname = 'insert presentation settings') then
    create policy "insert presentation settings" on public.site_presentation_settings
      for insert to authenticated with check (true);
  end if;
end $$;

grant select on public.site_presentation_settings to anon, authenticated;
grant insert, update on public.site_presentation_settings to authenticated;

insert into public.site_presentation_settings (key, value) values
  ('gallery_reel', '{"enabled":true,"title":"Community in frames","speedSeconds":48,"direction":"left","pauseOnHover":true,"albumIds":[],"photoKeys":[]}'::jsonb),
  ('event_cards', '{"style":"ticket","animation":"tilt"}'::jsonb)
on conflict (key) do nothing;

commit;

-- Verification 1: fields and RLS.
select c.column_name, c.data_type, c.is_nullable, t.relrowsecurity as rls_enabled
from information_schema.columns c
join pg_class t on t.relname = c.table_name and t.relnamespace = 'public'::regnamespace
where c.table_schema = 'public' and c.table_name = 'site_presentation_settings'
order by c.ordinal_position;

-- Verification 2: permission policies.
select policyname, roles, cmd, qual, with_check from pg_policies
where schemaname = 'public' and tablename = 'site_presentation_settings';
