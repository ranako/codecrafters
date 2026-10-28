-- Additive page-by-page CMS. Run in the project's Supabase SQL Editor.
-- Retains all events, albums, team records, presentation settings and policies.
begin;
create table if not exists public.site_page_content (
  page text primary key check (page in ('home','about','events','gallery','team','contact','shared')),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  updated_at timestamptz not null default now()
);
alter table public.site_page_content enable row level security;
-- Same authorization model as the existing CMS: authenticated editors.
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='site_page_content' and policyname='read public page content') then
    create policy "read public page content" on public.site_page_content for select to anon,authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='site_page_content' and policyname='insert page content') then
    create policy "insert page content" on public.site_page_content for insert to authenticated with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='site_page_content' and policyname='update page content') then
    create policy "update page content" on public.site_page_content for update to authenticated using (true) with check (true);
  end if;
end $$;
grant select on public.site_page_content to anon,authenticated;
grant insert,update on public.site_page_content to authenticated;
-- No seed: absent rows use the current website content until explicitly saved.
commit;
select policyname,roles,cmd from pg_policies where schemaname='public' and tablename='site_page_content';
