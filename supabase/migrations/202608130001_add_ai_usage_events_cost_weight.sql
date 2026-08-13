-- Backs the paid fair-use cap's per-action cost weighting (src/lib/ai-usage.ts,
-- AI_ACTION_COST_WEIGHT). Written at insert time by recordAiUsage() so the daily budget can be
-- summed as dollars-of-cost rather than a flat row count. Default 1 covers historical rows
-- inserted before this column existed — they're all from past days and irrelevant to any
-- "today's usage" query by the time this ships, so the default is just for schema validity,
-- not because those rows are ever re-read.
alter table public.ai_usage_events
  add column if not exists cost_weight integer not null default 1;
