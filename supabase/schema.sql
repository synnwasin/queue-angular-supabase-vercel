-- IT 05 Queue System
-- Run this SQL in Supabase SQL Editor.

create table if not exists public.queue_state (
  id integer primary key,
  current_index integer not null default -1,
  updated_at timestamptz not null default now(),
  constraint queue_state_singleton check (id = 1),
  constraint queue_state_index_range check (current_index between -1 and 259)
);

insert into public.queue_state (id, current_index)
values (1, -1)
on conflict (id) do nothing;


-- Convert 0..259 to A0..Z9.
create or replace function public.index_to_ticket(p_index integer)
returns text
language sql
immutable
as $$
  select
    case
      when p_index < 0 then '00'
      else chr(65 + floor(p_index / 10)::integer)
           || (p_index % 10)::text
    end;
$$;


-- IMPORTANT:
-- SELECT ... FOR UPDATE locks the singleton row during this transaction.
-- Concurrent requests therefore cannot receive the same ticket number.
create or replace function public.next_ticket()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current integer;
  v_next integer;
  v_ticket text;
begin
  select current_index
    into v_current
    from public.queue_state
    where id = 1
    for update;

  v_next := (v_current + 1) % 260;
  v_ticket := public.index_to_ticket(v_next);

  update public.queue_state
  set current_index = v_next,
      updated_at = now()
  where id = 1;

  return json_build_object(
    'success', true,
    'ticket', v_ticket,
    'index', v_next
  );
end;
$$;


create or replace function public.reset_queue()
returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.queue_state
  set current_index = -1,
      updated_at = now()
  where id = 1;

  return json_build_object(
    'success', true,
    'ticket', '00'
  );
end;
$$;


create or replace function public.get_queue_state()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_index integer;
  v_updated_at timestamptz;
begin
  select current_index, updated_at
    into v_index, v_updated_at
    from public.queue_state
    where id = 1;

  return json_build_object(
    'currentTicket', public.index_to_ticket(v_index),
    'currentIndex', v_index,
    'updatedAt', v_updated_at
  );
end;
$$;


-- The backend uses the service-role key, so the table is not exposed
-- directly to the Angular browser.
alter table public.queue_state enable row level security;

-- Optional hardening: only RPC functions should be used by the app.
revoke all on table public.queue_state from anon, authenticated;
grant select, update on table public.queue_state to service_role;
