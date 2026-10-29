-- CodeCrafters ONLY: optional, non-destructive team social links.
-- Apply separately in this project's Supabase SQL Editor after reviewing the preflight.
-- No authentication, grants, storage rules, publication rules, policies or rows are modified.
-- New columns are nullable with no default; existing rows and member links stay unchanged.

-- Read-only preflight: compare these columns and policies with the project before applying.
select table_name,column_name,data_type,is_nullable
from information_schema.columns where table_schema='public'
  and table_name in ('team_members')
order by table_name,ordinal_position;
select schemaname,tablename,policyname,roles,cmd,qual,with_check
from pg_policies where schemaname='public'
  and tablename in ('team_members')
order by tablename,policyname;

begin;
set local lock_timeout='5s';
create temporary table cc_team_security_before on commit drop as
select c.oid,c.relname,c.relrowsecurity,c.relforcerowsecurity,c.relacl,
  (select coalesce(jsonb_agg(to_jsonb(p) order by p.oid),'[]'::jsonb) from pg_policy p where p.polrelid=c.oid) policies
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname in ('team_members');

do $$
declare item record; existing_type text;
begin
  if (select count(*) from cc_team_security_before) <> 1 then
    raise exception 'Expected CodeCrafters tables are missing. No changes applied.';
  end if;
  if exists(select 1 from cc_team_security_before where not relrowsecurity) then
    raise exception 'Expected RLS is not enabled. Review project security before applying. No changes applied.';
  end if;
  -- Adding a column must not turn existing select(*) / upserts into permission errors.
  -- Abort rather than broaden a column-only privilege setup.
  for item in select * from cc_team_security_before loop
    if not has_table_privilege('anon',item.oid,'SELECT')
       or not has_table_privilege('authenticated',item.oid,'SELECT')
       or not has_table_privilege('authenticated',item.oid,'INSERT')
       or not has_table_privilege('authenticated',item.oid,'UPDATE') then
      raise exception 'Table-wide privileges are not as expected for %. Review column-level permissions; no changes applied.',item.relname;
    end if;
  end loop;
  -- Whole-row policy expressions can change meaning when their row type expands.
  -- Such policies need owner review, never an automatic rewrite here.
  if exists(select 1 from pg_policy where polrelid in (select oid from cc_team_security_before)
    and (polqual::text ~ ':varattno 0[[:space:]]' or polwithcheck::text ~ ':varattno 0[[:space:]]')) then
    raise exception 'Whole-row RLS expression found. Review it before adding columns; no changes applied.';
  end if;
  -- Check the source columns used by this version, without guessing or migrating their values.
  for item in select * from (values
    ('team_members','linkedin_url','text'), ('team_members','is_active','boolean')
  ) as expected(tbl,col,kind) loop
    select data_type into existing_type from information_schema.columns where table_schema='public' and table_name=item.tbl and column_name=item.col;
    if existing_type is distinct from item.kind then
      raise exception 'Unexpected schema for %.% (expected %, found %). No changes applied.',item.tbl,item.col,item.kind,existing_type;
    end if;
  end loop;
  for item in select * from (values
    ('team_members','github_url'), ('team_members','behance_url')
  ) as additions(tbl,col) loop
    select data_type into existing_type from information_schema.columns where table_schema='public' and table_name=item.tbl and column_name=item.col;
    if existing_type is not null and existing_type <> 'text' then
      raise exception 'Existing %.% has an incompatible type. No changes applied.',item.tbl,item.col;
    end if;
    execute format('alter table public.%I add column if not exists %I text',item.tbl,item.col);
  end loop;
  -- This migration must leave every policy definition, RLS flag and table ACL identical.
  if exists(select 1 from cc_team_security_before b join pg_class c on c.oid=b.oid where
    b.relrowsecurity is distinct from c.relrowsecurity or b.relforcerowsecurity is distinct from c.relforcerowsecurity
    or b.relacl is distinct from c.relacl
    or b.policies is distinct from (select coalesce(jsonb_agg(to_jsonb(p) order by p.oid),'[]'::jsonb) from pg_policy p where p.polrelid=c.oid)) then
    raise exception 'Security metadata changed unexpectedly. Rolling back.';
  end if;
end $$;
commit;
notify pgrst, 'reload schema';

select table_name,column_name,data_type,is_nullable,column_default
from information_schema.columns where table_schema='public'
  and column_name in ('github_url','behance_url')
  and table_name in ('team_members')
order by table_name,column_name;
