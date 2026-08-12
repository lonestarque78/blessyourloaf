# Bless Your Loaf — Backlog

Updated end of Aug 9 2026. Save at the repo root next to `CLAUDE.md`.
This is the memory Claude Code doesn't have between sessions — keep it current.

---

## Phase status

**Phase 0 — Scaffolding.** Done.

**Phase 1 — Clean recipes.** Done. Import, AI cleanup, step timers (localStorage-backed, survive reload and screen-lock), offline access, and baker's percentages with correct starter splitting.

**Phase 2 — Starter management.** Done. Starter CRUD, feeding log, growth chart, and web push feeding reminders via Vercel Cron with atomic claim-based dedup.

**Phase 3 — Baking workflow.** Done. Guided Bake Coach with server-timestamp countdowns.

**Phase 4 — Auth & billing.** Done. Email, Google, Apple, and Facebook login all working. Stripe checkout and webhooks with signature verification and idempotency. AI quota enforced on all three AI routes.

**Phase 5 — AI skills.** Partial. Troubleshooting works and matches the brand-voice spec. **Ingredient substitution and recipe generation are not built** — reserved in the `AiAction` type, never implemented. The `AIProvider` abstraction from the plan also doesn't exist; all AI routes instantiate `new Anthropic()` inline.

**Phase 6 — Public feed & moderation.** Not started. Nothing exists.

**Phase 7 — Offline mode.** Web done (PWA shell, Serwist service worker, IndexedDB recipe cache via Dexie). **Mobile not started**, and moot until the mobile app has a data layer.

**Phase 8 — Mobile builds & store submission.** Pipeline proven — device registered, EAS build succeeded, development build installed and running on iPhone. **The mobile app itself is still a static shell**: 5 screens with navigation and i18n, zero Supabase calls, disabled buttons. All backend wiring remains.

**Phase 9 — Legal, marketing, launch.** Not started beyond draft Terms/Privacy.

---

## Blocking before launch

- **Attorney review of legal docs.** Terms and Privacy are generic ~73-line drafts from June. A mismatch between the stated policy and actual data practices is a common App Store rejection.
- **Spanish translation of Terms/Privacy.** Left English-only during the i18n retrofit; legal text needs a human translator, not an AI pass.
- **Native Spanish speaker review.** Whole app is machine-translated to reviewed quality but not native. Highest priority is the flour and starter guide prose. Texas audience skews Mexican Spanish, and regional baking vocabulary varies.
- **Vercel Pro ($20/mo).** Hobby tier caps cron at once per day, so feeding reminders can fire up to 23 hours late and 12-hour-interval starters get missed entirely. A late reminder is worse than none — people stop trusting it. One-line schedule change once upgraded.
- **Linked sign-in methods on the account page.** Apple's Hide My Email creates a second account for the same person, orphaning their subscription — already reproduced accidentally with the Facebook/Gmail account split. Supabase supports linking identities for a signed-in user; this turns a manual database merge into self-service.
- **RLS policy review across all tables.** Done one-at-a-time for new tables, never as a full audit.
- **EU trader status.** Flagged by Apple. Required for EU distribution under the Digital Services Act.
- **Moderation policy + data retention policy documents.** Spec'd, never written.
- **Custom SMTP in Supabase — hard blocker.** The built-in email sender is a development convenience with a low shared rate limit, not production infrastructure. One night of E2E testing exhausted it (`over_email_send_rate_limit`). Without real SMTP (Resend, Postmark, SendGrid), signup confirmation emails silently fail and those users can never get in. Configure before anyone but you signs up.
- **Facebook publishing requirements.** Going live needs business verification (LLC documents, review wait), App Review (data-handling questionnaire), plus an app icon at 1024×1024, a Category, a privacy policy URL, and a **user data deletion page** — the last one is real build work. Facebook currently works only for admin accounts in development mode.

## Scheduled

- **Apple Sign In JWT expires Feb 8 2027.** Sign-in breaks silently with no grace period. A reminder is set for Jan 25 2027 with full regeneration steps, Team ID, Key ID, and Services ID. The `.p8` file cannot be re-downloaded from Apple — if it's lost, the key must be revoked and recreated.

## Deferred technical decisions

- **Static → dynamic rendering.** Cookie-based locale forced every route dynamic, costing speed and SEO on the public marketing pages where it matters most for discovery. A URL-prefix scheme (`/es/...`) would restore static rendering but is a bigger change.
- **i18n payload size.** All 15 namespaces ship in every page's hydration payload.
- **Bake-schedule AI prompt not localized.** Troubleshooter and recipe cleanup answer in the user's language; bake-schedule still answers in English.
- **Recipe content in the database isn't translated.** Titles, ingredients, and steps are English-only in the `recipes` table. Needs a schema decision, not key extraction.
- **Supabase/Stripe SDK error messages surface in English** regardless of locale.
- **No custom 404 page** — renders Next's English default.
- **Mobile has no manual language switcher** — follows the phone's system language.
- **`AIProvider` abstraction never built.** Only matters if you ever want a non-Claude provider.

## Verification owed

- **PWA install prompt in Chrome.** Needs the production server: `npm run build`, `npm start`, check for the install icon in the address bar.
- **Push notifications on iPhone.** Chrome and Edge both verified, but they share a Chromium implementation. iOS Safari only supports push if the user adds the app to their home screen first — and that's the platform most of your bakers are on.
- **Bake Coach end-to-end click-through.** Verified by code and tests, never actually run start to finish in a browser.

## Known bugs

- **Feeding form scroll bug.** After saving a feeding, the form collapses but scroll position isn't adjusted, so the "+ Log a Feeding" button can end up stranded behind the sticky nav and become unclickable until the user manually scrolls. Reproduced deterministically by the E2E tests, which work around it. Affects the app's most-repeated action.
- **GrowthChart sort has no tiebreaker.** `fed_at` sorting is ambiguous for two feedings in the same minute, and the datetime input only has minute precision, so "Latest" can show the wrong one. Low priority — unrealistic for real feeding cadence.

## Testing gaps

- **E2E: Playwright is set up** (Aug 10) covering signup/login, recipe import, starter feeding, Bake Coach, and the AI quota gate. Runs in CI as its own job against a local build on port 3100, with self-cleaning test accounts. **Maestro (mobile E2E) still doesn't exist.**
- **Not covered by E2E:** OAuth providers (can't automate third-party consent screens), Stripe checkout, password reset, offline/PWA behavior, Spanish locale, and the unbuilt feed.
- **No web component testing.** No React Testing Library or jsdom, so only logic modules are covered on the web side. Mobile has Jest + RNTL working.

## Cleanup

- Delete the `blessyourloaf - new` folder (empty but for `node_modules`) and `blessyourloaf-archive` (stale Aug 8 backup, superseded by git).
- Delete the stray `C:\Users\Brian\package-lock.json` — causes a workspace-root warning on every build.
- Delete the stale `AUDIT.md` in the repo — its "no mobile app exists" claim is wrong and will mislead a future session.
- Delete the **first Facebook app** (the one created with Facebook Login for Business, which can't do consumer auth). Keep app `1779701486564951`.
- 5 pre-existing ESLint warnings.
- **Pin local npm to match CI.** Local npm 11 generates lockfiles that CI's npm 10 (bundled with the pinned Node 22) rejects, breaking `npm ci`. This has now broken CI twice and been hand-fixed twice. Install Node 22 locally, or pin npm via `packageManager` in `package.json`, so the lockfile can't drift again.
- **Put `BACKLOG.md` in the repo root.** It still isn't there — an overnight session looked for it, didn't find it, and fell back on the stale `AUDIT.md` instead. The misleading file is being read while the accurate one isn't.
- **Move the Claude Code bypass-permissions setting into the project.** `.claude/settings.local.json` with `defaultMode: "bypassPermissions"` was written to `C:\Users\Brian` — the home directory, which is the *user-level* config location. Despite being described as project-scoped, it likely applies to every project opened in Claude Code, including The Pit Preacher. Move it to `C:\Users\Brian\blessyourloaf\.claude\settings.local.json` and confirm nothing at the user level still enables bypass.
- Tools run under the `ashle` Windows profile (Brian's wife's account) while the project lives under `Brian` — Apple credentials and Claude Code temp files land there. Known and fine, noted so it isn't re-investigated later.

---

## Suggested next up

1. **Phase 5 — ingredient substitution and recipe generation.** Closes Phase 5, and both are natural extensions of the troubleshooter that already works.
2. **Phase 6 — public feed & moderation.** The largest unbuilt phase and the one with nothing to reuse.
3. **Phase 8 — wire the mobile app to Supabase.** The single biggest gap between where the product is and where it needs to be, since the mobile app is currently a mockup.

Habits worth keeping: commit after each task rather than batching, `/clear` between unrelated tasks, and ask for the plain-English RLS readback on every new table.
