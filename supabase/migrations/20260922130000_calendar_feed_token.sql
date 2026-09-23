-- Adds a per-profile secret token that powers a subscribable .ics calendar
-- feed (GET /api/feed/[token]) — students can add their Syllaplan schedule,
-- exams, and task due dates to Google/Apple/Outlook Calendar and have it
-- stay in sync automatically, instead of re-uploading a one-off export.
--
-- The token is looked up by the feed route using the service-role admin
-- client (the request is unauthenticated by design — calendar apps can't
-- send a session cookie), so it must be unguessable and never derived from
-- a predictable value like the user id.

-- gen_random_uuid() is built into Postgres core since v13 (unlike
-- gen_random_bytes(), which needs pgcrypto) — stripping the hyphens turns it
-- into a 32-character hex token with 122 bits of randomness.
alter table public.profiles
  add column calendar_feed_token text unique not null default replace(gen_random_uuid()::text, '-', '');

-- Lets a signed-in user invalidate a leaked/shared link and get a fresh one.
-- SECURITY INVOKER + auth.uid(): a user can only ever rotate their own token.
create or replace function public.regenerate_calendar_feed_token()
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_token text;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  v_token := replace(gen_random_uuid()::text, '-', '');

  update public.profiles
    set calendar_feed_token = v_token, updated_at = now()
  where id = v_uid;

  if not found then
    raise exception 'Profile not found';
  end if;

  return v_token;
end;
$$;

revoke execute on function public.regenerate_calendar_feed_token() from public;
grant execute on function public.regenerate_calendar_feed_token() to authenticated;
