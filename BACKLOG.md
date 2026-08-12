# Bless Your Loaf — Backlog

Updated end of Aug 12 2026. Save at the repo root next to `CLAUDE.md`.
This is the memory Claude Code doesn't have between sessions — keep it current.

---

## Do next (this week)

Ordered. Everything here is small and either blocks something or is actively costing you.

1. **Fix static rendering on marketing and guide pages.** Promoted out of "deferred technical decisions" — the positioning work (Aug 12) concluded that SEO/content is the primary acquisition channel for this product, and cookie-based locale made every page dynamic, which directly undermines it. This is now a marketing problem, and it should be fixed before writing any content.
2. **Configure custom SMTP in Supabase.** Not urgent while you're the only user, but it must happen before you tell a single real person about the app.

*Done Aug 12: `BACKLOG.md` committed and `AUDIT.md` deleted; local npm/Node pinned via `engines` + `.npmrc`; failed auth E2E job re-run and green — full pipeline passing end to end with all 5 E2E tests. Node version manager installed (fnm), Node 22.x installed and set as this repo's pinned version via `.node-version`, `npm ci` verified clean under it — corepack confirmed a no-op here (no admin rights on `C:\Program Files\nodejs`) so `engines`/`engine-strict` + fnm's per-directory switching is the real mechanism. fnm's default alias pinned to the exact Node build already on the machine (v26.2.0), so The Pit Preacher and anything else without its own `.node-version` are unaffected.*

*Done Aug 12 (autonomous session): Fixed the feeding form scroll bug (see Known bugs, below, for the pre-fix description) — `FeedingLog.tsx` now scrolls its header back into view on collapse, `instant` rather than the site's default smooth behavior so it can't race a fast follow-up click; the E2E workaround in `starter-feeding.spec.ts` is gone. Closed out **Phase 5** — built the two missing AI skills (ingredient substitution, recipe generation), see Phase status and Suggested next up below for what changed and what's worth a second look.*

## Phase status

**Phase 0 — Scaffolding.** Done.

**Phase 1 — Clean recipes.** Done. Import, AI cleanup, step timers (localStorage-backed, survive reload and screen-lock), offline access, and baker's percentages with correct starter splitting.

**Phase 2 — Starter management.** Done. Starter CRUD, feeding log, growth chart, and web push feeding reminders via Vercel Cron with atomic claim-based dedup.

**Phase 3 — Baking workflow.** Done. Guided Bake Coach with server-timestamp countdowns.

**Phase 4 — Auth & billing.** Done. Email, Google, Apple, and Facebook login all working. Stripe checkout and webhooks with signature verification and idempotency. AI quota enforced on all three AI routes.

**Phase 5 — AI skills.** Done. All three skills built and match the brand-voice spec: troubleshooting (chat, persisted), ingredient substitution (chat, new — deliberately *not* persisted, see Suggested next up), and recipe generation (new — a card on the "Add a Recipe" page that populates the same review-and-save form URL import already uses, rather than a separate flow). All three share one quota gate (`getRemainingFreeAiActions`/`recordAiUsage`) and one on-topic enforcement approach (a shared cheap keyword pre-filter plus a hard system-prompt boundary per route). The `AIProvider` abstraction from the plan still doesn't exist; all AI routes still instantiate `new Anthropic()` inline — unchanged by this work, still only matters if you want a non-Claude provider.

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

- **Static → dynamic rendering.** *Promoted to "Do next" above — see there.* Cookie-based locale forced every route dynamic. A URL-prefix scheme (`/es/...`) would restore static rendering but is a bigger change; a narrower fix limited to marketing and guide pages may be enough.
- **Marketing follow-ups from the Aug 12 positioning doc** (full version in Google Drive): rewrite the landing page to lead with the starter rather than bread photography; write troubleshooting pages targeting real searched questions; make annual billing the visually default plan; make the free-tier AI gate message warm rather than transactional; consider starter milestones/streaks as a retention mechanic.
- **i18n payload size.** All 15 namespaces ship in every page's hydration payload.
- **Bake-schedule AI prompt not localized.** Troubleshooter, recipe cleanup, ingredient substitution, and recipe generation all answer in the user's language; bake-schedule still answers in English.
- **Recipe generation's off-topic decline text is English-only**, same gap as bake-schedule above and for the same reason: it's a fixed string inside the system prompt's escape-hatch JSON, not something Claude composes fresh, so the per-locale language instruction never touches it. Low-impact in practice — the shared keyword pre-filter catches the common case in the user's language before the AI is even called; this only shows up on the rare slip-through where Claude itself invokes the escape hatch.
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

- **GrowthChart sort has no tiebreaker.** `fed_at` sorting is ambiguous for two feedings in the same minute, and the datetime input only has minute precision, so "Latest" can show the wrong one. Low priority — unrealistic for real feeding cadence.

## Testing gaps

- **E2E: Playwright is set up** (Aug 10) covering signup/login, recipe import, starter feeding, Bake Coach, and the AI quota gate. Added Aug 12: `ai-skills.spec.ts`, covering ingredient substitution and recipe generation against the *real* Anthropic API (2 real calls, one per skill — a fresh test user's free-tier quota covers both). Runs in CI as its own job against a local build on port 3100, with self-cleaning test accounts. **Maestro (mobile E2E) still doesn't exist.**
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

1. **Phase 6 — public feed & moderation.** The largest unbuilt phase and the one with nothing to reuse.
2. **Phase 8 — wire the mobile app to Supabase.** The single biggest gap between where the product is and where it needs to be, since the mobile app is currently a mockup.

Habits worth keeping: commit after each task rather than batching, `/clear` between unrelated tasks, and ask for the plain-English RLS readback on every new table.

## Phase 5 decisions worth a second look

Ambiguous calls made autonomously (Aug 12) while closing out Phase 5. None are blockers, but flagging them since you didn't get to weigh in first:

- **Ingredient substitution's chat isn't persisted to Supabase** (no `troubleshooter_chats`-equivalent table) — it's a client-side-only conversation that resets on reload. Reasoning: a substitution question reads as a one-off lookup, not a multi-day conversation about one starter's health the way troubleshooting is. If real usage shows people want to come back to a past answer, this is the place to add persistence.
- **Recipe generation has no dedicated chat/page** — it's a second card ("Generate a Recipe with AI") on the existing `/dashboard/my-recipes/new` page, next to "Import from a Recipe URL." Both populate the same review-and-edit form before saving. Reasoning: a generated recipe and an imported one both need the same human review step before they're worth keeping, so reusing that flow seemed stronger than building a parallel one.
- **Ingredient substitution got a new top-level nav link** ("Substitutions," next to Troubleshooter, both desktop and mobile) rather than living in the Library dropdown. Reasoning: it's quota-gated AI, not a static reference guide, so it reads closer to Troubleshooter than to the Hydration Calculator. Recipe generation didn't get its own nav entry at all, since it's reached through the existing "My Recipes" → "+ Add Recipe" path.
- **The on-topic keyword pre-filter was extended for ingredient substitution** (added terms like "allergic," "dairy," "instead") but the *original* troubleshooter list was moved to a shared module byte-for-byte unchanged, specifically because CLAUDE.md warns against loosening it without checking real conversations first. The extended list only affects the new route.
