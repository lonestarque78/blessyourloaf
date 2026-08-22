-- Adds quiet hours to feeding reminders, now that the cron runs hourly instead of once a day
-- at 13:00 UTC (see vercel.json) — without this, a starter due at 2am would page someone at
-- 2am instead of 23 hours late, which is worse. Default quiet window is 21:00-07:00 local time
-- (i.e. sends are allowed 07:00-20:59).
--
-- Same problem push_subscriptions.locale already solved: the cron job has no request/cookie
-- context to resolve anything from, so timezone is captured client-side (Intl's
-- resolvedOptions().timeZone, an IANA name like "America/Chicago") in the same upsert that
-- already writes locale — see PushNotifications.tsx.

-- RLS lets a user write anything to their own push_subscriptions row (see
-- 202608090002_create_push_subscriptions.sql's policy), so an invalid IANA zone string isn't
-- just bad data for that one row: fed into `at time zone` inside the shared claim query below,
-- it would throw and break reminder claiming for every user, not just the one with the bad
-- value. Validate against Postgres's own IANA database instead of trusting the client.
create or replace function public.is_valid_iana_timezone(tz text)
returns boolean
language sql
stable
as $$
  select exists (select 1 from pg_timezone_names where name = tz);
$$;

alter table public.push_subscriptions
  add column if not exists timezone text not null default 'UTC'
    check (public.is_valid_iana_timezone(timezone));

-- Replaces the version in 202608090003_add_starter_feeding_reminders.sql. Adds one more AND
-- clause to the same atomic UPDATE ... WHERE ... RETURNING: a starter is only claimed if at
-- least one of its owner's push subscriptions is currently inside its own local 07:00-20:59
-- window (or the owner has no subscriptions at all, matching the existing behavior where
-- there's nothing to hold for anyway).
--
-- This is deliberately not a separate "pending reminder" queue. Because the quiet-hours check
-- lives inside the same WHERE clause as the due/not-yet-reminded check, a starter that's due
-- at 2am simply isn't claimed on that run — last_reminder_sent_at is untouched, so it's still
-- "due and unclaimed" an hour later, and the next run after local time clears 07:00 claims and
-- sends it normally. That's what turns "hold the reminder until morning" into a no-op instead
-- of new state to track: nothing can get stuck in a queue, because there is no queue.
--
-- Known tradeoff: this gates per-starter (via an EXISTS over the owner's subscriptions), not
-- per-subscription. If one person had multiple devices in genuinely different timezones, the
-- starter is claimed as soon as ANY subscription is in its active window, and the send step
-- (route.ts, unchanged) still pushes to all of that user's subscriptions at once — a second
-- device still mid-quiet-hours would get pinged anyway. Accepted deliberately: this is one
-- person's own devices, practically always the same timezone.
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
    and (
      not exists (select 1 from public.push_subscriptions ps where ps.user_id = s.user_id)
      or exists (
        select 1 from public.push_subscriptions ps
        where ps.user_id = s.user_id
          and extract(hour from now() at time zone ps.timezone) >= 7
          and extract(hour from now() at time zone ps.timezone) < 21
      )
    )
  returning s.id, s.user_id, s.name;
$$;

revoke all on function public.claim_due_feeding_reminders() from public;
grant execute on function public.claim_due_feeding_reminders() to service_role;
