-- Part 2 of feeding-reminder push notifications: schedule data on starters, plus the
-- atomic "claim" function the cron job calls to find who's due and mark them reminded in
-- the same statement, so it can't double-send if the job runs (or overlaps) twice.
-- See 202608090002_create_push_subscriptions.sql for part 1 (the generic push-delivery
-- plumbing this builds on).

-- Feeding schedule is user-set per starter (not inferred, not a global default) — real
-- schedules vary a lot by storage (counter vs. fridge), and inferring from history breaks
-- for brand-new starters and just reinforces whatever irregular pattern got someone here
-- in the first place. 24h matches the common room-temperature default.
alter table public.starters
  add column if not exists feeding_interval_hours integer not null default 24
    check (feeding_interval_hours between 1 and 336),
  add column if not exists last_reminder_sent_at timestamptz;

-- Lets a reminder push be written in the subscribing device's language. There's no
-- persisted per-user locale anywhere else — the web app's language switcher only sets a
-- cookie for the current request — so this is captured client-side at subscribe time.
alter table public.push_subscriptions
  add column if not exists locale text not null default 'en'
    check (locale in ('en', 'es'));

-- Finds starters overdue for feeding and marks them reminded, atomically, in one
-- statement. "Overdue" = now() is past (last feeding, or birthday if never fed) plus the
-- starter's configured interval. A starter is only eligible again once it's fed: the
-- last_reminder_sent_at guard means a job run that repeats or overlaps never re-sends for
-- the same feeding cycle — a second concurrent UPDATE hitting the same row re-checks its
-- WHERE clause against whatever the first one just committed (standard Postgres
-- concurrent-update behavior for a plain UPDATE ... WHERE), so at most one caller ever
-- gets a given starter back from this function.
create or replace function public.claim_due_feeding_reminders()
returns table (starter_id uuid, user_id uuid, starter_name text)
language sql
security definer
set search_path = public
as $$
  update public.starters s
  set last_reminder_sent_at = now()
  where s.is_active
    and now() >= coalesce(
      (select max(f.fed_at) from public.feedings f where f.starter_id = s.id),
      s.born_at::timestamptz
    ) + make_interval(hours => s.feeding_interval_hours)
    and (
      s.last_reminder_sent_at is null
      or s.last_reminder_sent_at < coalesce(
        (select max(f.fed_at) from public.feedings f where f.starter_id = s.id),
        s.born_at::timestamptz
      )
    )
  returning s.id, s.user_id, s.name;
$$;

-- SECURITY DEFINER means this runs with the owner's privileges and bypasses starters' RLS
-- by design (it has to see every user's starters to decide who's due). That makes the
-- EXECUTE grant the only thing standing between "safe" and "any signed-in user can call
-- this from the browser, mass-claim every starter, and read back every other user's
-- starter names and user ids." Only the service role may call it — the cron route is the
-- sole caller, and it never runs in a browser context.
revoke all on function public.claim_due_feeding_reminders() from public;
grant execute on function public.claim_due_feeding_reminders() to service_role;
