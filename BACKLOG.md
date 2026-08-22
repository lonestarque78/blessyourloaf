# Bless Your Loaf — Backlog

Rewritten Aug 22 2026. Lives at the repo root next to `CLAUDE.md` and `VOICE.md`.

This is a working list, not a changelog. When something's done, delete it — git history is the record. Keep this short enough that a fresh session actually reads it.

---

## Do next

1. **Bake the 10 published-but-unbaked recipes.** Promoted into `public.recipes` Aug 22 2026 ahead of the usual bake-first rule (see VOICE.md section 5) — they're live on `/recipes` now, but nobody's actually made them yet. Strike each off as it's baked and confirmed as written (fix the recipe in `scripts/seed-recipes.ts` + a follow-up migration first if it needs a correction):
   - [ ] Everyday Country Loaf (`everyday-country-loaf`)
   - [ ] Same-Day Sandwich Loaf (`same-day-sandwich-loaf`)
   - [ ] High-Hydration Open Crumb Batard (`high-hydration-open-crumb-batard`)
   - [ ] Seeded Multigrain Boule (`seeded-multigrain-boule`)
   - [ ] Spelt and Honey Loaf (`spelt-and-honey-loaf`)
   - [ ] Sourdough Discard Naan (`sourdough-discard-naan`) — fastest signal, same day
   - [ ] Sourdough Discard Soft Pretzels (`sourdough-discard-soft-pretzels`)
   - [ ] Sourdough Discard Skillet Cookie (`sourdough-discard-skillet-cookie`) — fastest signal, same day
   - [ ] Soft Sourdough Dinner Rolls (`soft-sourdough-dinner-rolls`) — note this overlaps a lot with the existing `sourdough-dinner-rolls`; worth comparing the two once baked and possibly merging or differentiating them
   - [ ] Cinnamon Sugar Sourdough Rolls (`cinnamon-sugar-sourdough-rolls`) — same overlap concern against the existing `sourdough-cinnamon-rolls`
2. **Rewrite the landing page hero.** Currently "Sourdough you'll be proud to pull from your own oven" — the same crumb-shot promise every competitor makes, and it talks to people already succeeding. "Name her. Feed her. Love her." is already on the page below the fold and is the right lead. See the positioning doc in Google Drive.

---

## Blocking launch

**Legal**
- Decide whether you're distributing in the EU at launch. If yes, the privacy policy needs GDPR additions (legal basis, portability, transfer mechanism, supervisory-authority complaint route) and you need EU trader status with Apple. If no, most of that disappears — decide deliberately rather than by default.
- Get the auto-renewing subscription terms reviewed. Several US states, California especially, have specific statutory requirements for renewal disclosure and cancellation. This is the one legal item worth paying for.
- Verify the claim that Anthropic doesn't train on API input against your actual account terms. It's currently stated as fact in your live privacy policy.
- Add children's-privacy and CCPA sections, plus a contact address for privacy requests. A policy generator (Termly, iubenda) handles this scaffolding cheaply.
- Spanish translations of Terms and Privacy. Currently English-only in a bilingual app.
- Moderation policy and data retention policy documents. Spec'd, never written.

**Product and infrastructure**
- **Linked sign-in methods on the account page.** Apple's Hide My Email creates a second account for the same person and orphans their subscription — already reproduced in your own user table. Supabase supports identity linking; this turns a manual database merge into self-service.
- **A staging Supabase project.** One database today, so every migration lands on production. Tolerable with no users, unacceptable once real starters and bake histories are in there.
- **Full RLS audit.** Done table-by-table as new ones were added, never as a sweep.
- **Native Spanish speaker review.** Machine-translated to reviewed quality but not native. Highest priority is the flour and starter guide prose. Texas audience skews Mexican Spanish.
- **Facebook publishing.** Business verification (LLC documents plus review wait), App Review, a 1024×1024 icon, a Category, and a user data deletion page — that last one is real build work. Currently admin-only in development mode.

---

## Unbuilt phases

- **Phase 6 — public feed and moderation.** Nothing exists. Largest unbuilt piece and nothing to reuse.
- **Phase 8 — mobile app backend wiring.** Five screens with navigation and i18n, zero Supabase calls, disabled buttons. The build pipeline is proven; the app is a mockup. Biggest gap between what the product is and what it needs to be.
- **Phase 7 — mobile offline.** Moot until the mobile app has a data layer at all.

---

## Marketing

From the positioning work — full document in Google Drive.

- Landing page hero rewrite (also in Do next above).
- Troubleshooting content pages targeting real searched questions: "starter not rising," "hooch on my starter," "starter smells like acetone." SEO is the primary acquisition channel and these are the queries your customer types at the moment they need you.
- Make annual the visually default plan. Sourdough is seasonal; monthly subscribers churn in June, annual ones come back in October.
- Warm up the free-tier quota message. That moment is the entire conversion funnel.
- Consider starter milestones and streaks as a retention mechanic. "Dolly is 100 days old today" is both a reason to come back and free shareable content.
- Decide whether Spanish is a launch position or a later expansion. If it's a launch position, there's almost no competition there and the content strategy starts now.

---

## Known gaps

**Localization**
- Recipe generation's and bake schedule's off-topic decline text is English-only (fixed string in the system prompt escape hatch).
- Recipe content in the database is English-only. Needs a schema decision, not key extraction.
- Supabase and Stripe SDK errors surface in English regardless of locale.
- No custom 404 page — renders Next's English default.
- Mobile has no manual language switcher; follows the phone's system language.

**Other**
- Quota resets at UTC midnight, which is early evening in Texas. Local-day reset would be less confusing.
- `GrowthChart` sort has no tiebreaker — two feedings in the same minute sort ambiguously and "Latest" can show the wrong one. Low priority.
- i18n ships all 15 namespaces in every page's hydration payload.
- `AIProvider` abstraction never built; all routes instantiate `new Anthropic()` inline. Only matters if you ever want a non-Claude provider.

---

## Verification owed

- PWA install prompt in Chrome. Needs `npm run build` then `npm start`, then check the address bar.
- Push notifications on iPhone. Chrome and Edge are both Chromium; iOS Safari only supports push once the app is added to the home screen, and that's the platform most of your bakers are on.
- Bake Coach end-to-end click-through in a real browser.

---

## Testing gaps

- **Maestro (mobile E2E) doesn't exist.** Playwright covers the web: signup/login, recipe import, starter feeding, Bake Coach, AI quota, and both new AI skills against the real API.
- **Not covered:** OAuth providers (can't automate third-party consent), Stripe checkout, password reset, offline/PWA behavior, Spanish locale, and the unbuilt feed.
- **No web component testing** — no React Testing Library or jsdom, so only logic modules are covered. Mobile has Jest and RNTL.

---

## Cleanup

- Delete the `blessyourloaf - new` and `blessyourloaf-archive` folders.
- Delete the stray `C:\Users\Brian\package-lock.json` — causes a workspace-root warning on every build.
- Delete the first Facebook app (the Login-for-Business one that can't do consumer auth). Keep `1779701486564951`.
- Move `.claude/settings.local.json` from `C:\Users\Brian` into the project folder so bypass-permissions is project-scoped.
- 7 ESLint warnings, all the same mount-once-effect missing-dependency class (`loadData`, `supabase`, and now `upsertSubscriptionRow` in `PushNotifications.tsx`).
- Old-persona language survives in `scripts/seed-recipes.ts` ("Darlin'," in the cinnamon-raisin description) — predates `VOICE.md`.

---

## Standing notes

- Tools run under the `ashle` Windows profile (Brian's wife's account) while the project lives under `Brian`. Known and fine — noted so nobody re-investigates.
- **Apple Sign In JWT expires Feb 8 2027.** Sign-in breaks silently with no grace period. A reminder is set for Jan 25 2027 with the regeneration steps, Team ID, Key ID, and Services ID. The `.p8` cannot be re-downloaded — if lost, the key must be revoked and recreated.
- Migration rule: every migration is a committed, versioned file applied via `supabase db push`, never raw SQL through the Studio editor. Applying by hand ahead of a push is fine as long as the file lands in the same or an earlier commit.
- Habits worth keeping: commit after each task rather than batching, `/clear` between unrelated tasks, and ask for the plain-English RLS readback on every new table.