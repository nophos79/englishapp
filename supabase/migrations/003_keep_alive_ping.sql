-- Lightweight zero-data-exposure keep-alive RPC for Supabase Free tier
-- Prevents 7-day inactivity pause without granting anon access to any family tables.

create or replace function public.ping()
returns text
language sql
stable
security invoker
set search_path = public
as $$
  select 'ok'::text;
$$;

grant usage on schema public to anon;
grant execute on function public.ping() to anon, authenticated;
