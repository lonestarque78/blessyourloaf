# Recipe drafts

This folder is for recipe drafts before they're baked. The default path, per `VOICE.md` section 5, is that nothing moves into `public.recipes` until it's actually been through a real oven — that's still the bar to aim for. As of Aug 22 2026 that's a strong default rather than an absolute rule: a batch can be deliberately promoted before baking (see BACKLOG.md, which tracks any published-but-unbaked recipes so they get struck off as they're actually tested). The recipes page's own copy was reworded to match either way — it no longer claims every recipe has been kitchen-tested, only that every one is written with real ingredients and real technique, which holds regardless of baked status.

## Workflow

1. A draft file lands here, written to `VOICE.md` (grams first, cups in parentheses, standard hydration and timings, a temperature caveat on any fermentation step, no invented technique).
2. Review it. Edit wording, swap an ingredient, adjust a timing, whatever needs changing. These are plain Markdown files, so edit them directly.
3. Bake it. If it doesn't work as written, fix the recipe or drop it. If it works, note that in the file (date baked, any adjustments you made while baking).
4. Once a recipe has actually come out of an oven correctly, ask Claude Code to move it into `scripts/seed-recipes.ts` in the `Recipe[]` shape already used there (`title`, `slug`, `description`, `category`, `is_premium`, `prep_time_minutes`, `bake_time_minutes`, `difficulty`, `ingredients`, `steps`, `tags`, `published`), then run the seed script against the real database. That's the only path from this folder into the live table.
5. Delete or archive the draft file once it's been promoted, so this folder only ever holds things still waiting on a real bake.

## Why not just insert with `published: false`

The `recipes` table only has one database, no staging environment (see `BACKLOG.md`). A row with `published: false` is invisible to users, but it's still sitting in production, and it's one flipped flag away from going live before anyone's actually baked it. Keeping drafts as local files until they're tested removes that risk entirely.
