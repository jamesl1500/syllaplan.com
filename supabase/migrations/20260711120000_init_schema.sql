-- Syllaplan initial schema: profiles, classes, syllabi, class_schedules,
-- calendar_events, tasks, confirm_syllabus RPC, and the private syllabi storage bucket.
--
-- Note: as of the current Supabase behavior, new tables in `public` are NOT
-- auto-exposed to the Data API — every table below gets an explicit GRANT to
-- `authenticated` in addition to RLS. Nothing is granted to `anon`; this app
-- has no public data.

-- =========================================================
-- PROFILES (extends auth.users)
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using ( (select auth.uid()) = id );

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using ( (select auth.uid()) = id )
with check ( (select auth.uid()) = id );

-- No insert/delete grant: rows are created only by the trigger below.
grant select, update on public.profiles to authenticated;

-- Auto-create a profile row on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Reusable updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- =========================================================
-- CLASSES
-- =========================================================
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  course_code text,
  term text,
  color text not null default '#4f46e5',
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index classes_user_id_idx on public.classes (user_id);

alter table public.classes enable row level security;

create policy "classes_select_own" on public.classes for select
  to authenticated using ( (select auth.uid()) = user_id );
create policy "classes_insert_own" on public.classes for insert
  to authenticated with check ( (select auth.uid()) = user_id );
create policy "classes_update_own" on public.classes for update
  to authenticated using ( (select auth.uid()) = user_id ) with check ( (select auth.uid()) = user_id );
create policy "classes_delete_own" on public.classes for delete
  to authenticated using ( (select auth.uid()) = user_id );

grant select, insert, update, delete on public.classes to authenticated;

create trigger classes_set_updated_at
  before update on public.classes
  for each row execute function public.set_updated_at();

-- =========================================================
-- SYLLABI (upload + parse metadata)
-- =========================================================
create table public.syllabi (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null default '',
  original_filename text not null,
  file_size_bytes bigint,
  parse_status text not null default 'pending'
    check (parse_status in ('pending', 'processing', 'parsed', 'failed', 'confirmed')),
  raw_extraction jsonb,
  error_message text,
  model_used text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index syllabi_class_id_idx on public.syllabi (class_id);
create index syllabi_user_id_idx on public.syllabi (user_id);

alter table public.syllabi enable row level security;

create policy "syllabi_select_own" on public.syllabi for select
  to authenticated using ( (select auth.uid()) = user_id );
create policy "syllabi_insert_own" on public.syllabi for insert
  to authenticated with check ( (select auth.uid()) = user_id );
create policy "syllabi_update_own" on public.syllabi for update
  to authenticated using ( (select auth.uid()) = user_id ) with check ( (select auth.uid()) = user_id );
create policy "syllabi_delete_own" on public.syllabi for delete
  to authenticated using ( (select auth.uid()) = user_id );

grant select, insert, update, delete on public.syllabi to authenticated;

create trigger syllabi_set_updated_at
  before update on public.syllabi
  for each row execute function public.set_updated_at();

-- =========================================================
-- CLASS_SCHEDULES (recurring weekly meeting patterns)
-- =========================================================
create table public.class_schedules (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6), -- 0=Sunday
  start_time time not null,
  end_time time not null,
  location text,
  starts_on date not null,
  ends_on date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on >= starts_on),
  check (end_time > start_time)
);

create index class_schedules_class_id_idx on public.class_schedules (class_id);
create index class_schedules_user_id_idx on public.class_schedules (user_id);

alter table public.class_schedules enable row level security;

create policy "class_schedules_select_own" on public.class_schedules for select
  to authenticated using ( (select auth.uid()) = user_id );
create policy "class_schedules_insert_own" on public.class_schedules for insert
  to authenticated with check ( (select auth.uid()) = user_id );
create policy "class_schedules_update_own" on public.class_schedules for update
  to authenticated using ( (select auth.uid()) = user_id ) with check ( (select auth.uid()) = user_id );
create policy "class_schedules_delete_own" on public.class_schedules for delete
  to authenticated using ( (select auth.uid()) = user_id );

grant select, insert, update, delete on public.class_schedules to authenticated;

create trigger class_schedules_set_updated_at
  before update on public.class_schedules
  for each row execute function public.set_updated_at();

-- =========================================================
-- CALENDAR_EVENTS (one-off dated items: exam/holiday/no_class/other)
-- =========================================================
create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  syllabus_id uuid references public.syllabi (id) on delete set null,
  event_type text not null check (event_type in ('exam', 'holiday', 'no_class', 'other')),
  title text not null,
  description text,
  event_date date not null,
  start_time time,
  end_time time,
  all_day boolean not null default true,
  source text not null default 'ai_extracted' check (source in ('ai_extracted', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index calendar_events_class_date_idx on public.calendar_events (class_id, event_date);
create index calendar_events_user_id_idx on public.calendar_events (user_id);

alter table public.calendar_events enable row level security;

create policy "calendar_events_select_own" on public.calendar_events for select
  to authenticated using ( (select auth.uid()) = user_id );
create policy "calendar_events_insert_own" on public.calendar_events for insert
  to authenticated with check ( (select auth.uid()) = user_id );
create policy "calendar_events_update_own" on public.calendar_events for update
  to authenticated using ( (select auth.uid()) = user_id ) with check ( (select auth.uid()) = user_id );
create policy "calendar_events_delete_own" on public.calendar_events for delete
  to authenticated using ( (select auth.uid()) = user_id );

grant select, insert, update, delete on public.calendar_events to authenticated;

create trigger calendar_events_set_updated_at
  before update on public.calendar_events
  for each row execute function public.set_updated_at();

-- =========================================================
-- TASKS (assignments/deliverables)
-- =========================================================
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  syllabus_id uuid references public.syllabi (id) on delete set null,
  calendar_event_id uuid references public.calendar_events (id) on delete set null,
  title text not null,
  description text,
  due_date date,
  due_time time,
  completed boolean not null default false,
  completed_at timestamptz,
  source text not null default 'ai_extracted' check (source in ('ai_extracted', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_class_due_idx on public.tasks (class_id, due_date);
create index tasks_user_id_idx on public.tasks (user_id);

alter table public.tasks enable row level security;

create policy "tasks_select_own" on public.tasks for select
  to authenticated using ( (select auth.uid()) = user_id );
create policy "tasks_insert_own" on public.tasks for insert
  to authenticated with check ( (select auth.uid()) = user_id );
create policy "tasks_update_own" on public.tasks for update
  to authenticated using ( (select auth.uid()) = user_id ) with check ( (select auth.uid()) = user_id );
create policy "tasks_delete_own" on public.tasks for delete
  to authenticated using ( (select auth.uid()) = user_id );

grant select, insert, update, delete on public.tasks to authenticated;

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- =========================================================
-- CONFIRM_SYLLABUS: atomic RPC for the review -> confirm step.
-- SECURITY INVOKER — runs as the caller, so RLS on every underlying table
-- still applies. user_id is always derived from auth.uid(), never trusted
-- from the arguments.
-- =========================================================
create or replace function public.confirm_syllabus(
  p_class_id uuid,
  p_syllabus_id uuid,
  p_course jsonb,
  p_schedule jsonb,
  p_events jsonb,
  p_tasks jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  update public.classes
    set name = coalesce(p_course->>'name', name),
        course_code = p_course->>'code',
        term = p_course->>'term',
        status = 'active',
        updated_at = now()
  where id = p_class_id and user_id = v_uid;

  if not found then
    raise exception 'Class not found or not owned by caller';
  end if;

  insert into public.class_schedules
    (class_id, user_id, day_of_week, start_time, end_time, location, starts_on, ends_on)
  select p_class_id, v_uid,
         (s->>'dayOfWeek')::smallint,
         (s->>'startTime')::time,
         (s->>'endTime')::time,
         s->>'location',
         (s->>'startsOn')::date,
         (s->>'endsOn')::date
  from jsonb_array_elements(p_schedule) as s;

  insert into public.calendar_events
    (class_id, user_id, syllabus_id, event_type, title, description, event_date, start_time, end_time, all_day, source)
  select p_class_id, v_uid, p_syllabus_id,
         e->>'type', e->>'title', e->>'description',
         (e->>'date')::date,
         nullif(e->>'startTime', '')::time,
         nullif(e->>'endTime', '')::time,
         coalesce((e->>'allDay')::boolean, true),
         'ai_extracted'
  from jsonb_array_elements(p_events) as e;

  insert into public.tasks
    (class_id, user_id, syllabus_id, title, description, due_date, due_time, source)
  select p_class_id, v_uid, p_syllabus_id,
         t->>'title', t->>'description',
         (t->>'dueDate')::date,
         nullif(t->>'dueTime', '')::time,
         'ai_extracted'
  from jsonb_array_elements(p_tasks) as t;

  update public.syllabi
    set parse_status = 'confirmed', updated_at = now()
  where id = p_syllabus_id and user_id = v_uid;
end;
$$;

-- Postgres grants EXECUTE on new functions to PUBLIC by default; lock this down.
revoke execute on function public.confirm_syllabus(uuid, uuid, jsonb, jsonb, jsonb, jsonb) from public;
grant execute on function public.confirm_syllabus(uuid, uuid, jsonb, jsonb, jsonb, jsonb) to authenticated;

-- =========================================================
-- STORAGE: private bucket, path convention {user_id}/{syllabus_id}.pdf
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('syllabi', 'syllabi', false, 15728640, array['application/pdf'])
on conflict (id) do nothing;

create policy "syllabi_files_insert_own_folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'syllabi'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "syllabi_files_select_own_folder"
on storage.objects for select
to authenticated
using (
  bucket_id = 'syllabi'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Needed for upsert (file replace), not just initial upload.
create policy "syllabi_files_update_own_folder"
on storage.objects for update
to authenticated
using (
  bucket_id = 'syllabi'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'syllabi'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "syllabi_files_delete_own_folder"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'syllabi'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
