# Recipe drafts

This folder is for recipe drafts only. Nothing in here is in the database, and nothing in here should be, until it meets the bar in `VOICE.md` section 5: **no recipe goes live until someone has actually baked it.** The recipes page tells visitors these were "tested in a real kitchen until they were just right," and that claim only stays true if unbaked drafts stay out of `public.recipes` entirely, not just unpublished inside it.

## Workflow

1. A draft file lands here, written to `VOICE.md` (grams first, cups in parentheses, standard hydration and timings, a temperature caveat on any fermentation step, no invented technique).
2. Review it. Edit wording, swap an ingredient, adjust a timing, whatever needs changing. These are plain Markdown files, so edit them directly.
3. Bake it. If it doesn't work as written, fix the recipe or drop it. If it works, note that in the file (date baked, any adjustments you made while baking).
4. Once a recipe has actually come out of an oven correctly, ask Claude Code to move it into `scripts/seed-recipes.ts` in the `Recipe[]` shape already used there (`title`, `slug`, `description`, `category`, `is_premium`, `prep_time_minutes`, `bake_time_minutes`, `difficulty`, `ingredients`, `steps`, `tags`, `published`), then run the seed script against the real database. That's the only path from this folder into the live table.
5. Delete or archive the draft file once it's been promoted, so this folder only ever holds things still waiting on a real bake.

## Why not just insert with `published: false`

The `recipes` table only has one database, no staging environment (see `BACKLOG.md`). A row with `published: false` is invisible to users, but it's still sitting in production, and it's one flipped flag away from going live before anyone's actually baked it. Keeping drafts as local files until they're tested removes that risk entirely.
