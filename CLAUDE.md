# Bless Your Loaf — Build Plan for Claude Code

This is a refined version of your original spec, restructured so Claude Code can actually execute it successfully. The product scope is unchanged — everything you asked for is still in here. What's different is *how* it's handed to Claude Code, plus a handful of technical decisions that were left open in the original prompt and would otherwise cause Claude Code to guess (and guess inconsistently across sessions).

Save this whole file as `CLAUDE.md` in the root of each repo once you create them. Claude Code automatically reads `CLAUDE.md` at the start of every session, so it stays in context even across the many sessions this project will take.

---

## 0. Read this first

One honest note before anything else: no prompt, however well-written, makes a coding agent generate a working web app + iOS app + Android app + billing + AI + social feed + moderation system in one continuous shot. That's not a prompt-quality problem — it's that a project this size needs to be built, tested, and corrected in stages, the same way a human engineering team would do it. Handing Claude Code the entire spec at once and asking for "the entire app" tends to produce code that looks complete but doesn't actually run: mismatched imports across files it generated hours apart, a payment webhook that was never wired to the database, an offline sync layer that references a table that doesn't exist yet.

So the plan below keeps your full scope — every feature in Section 2 of your original prompt is still here — but splits *execution* into ordered phases (Section 5 below), each ending in something Claude Code can actually run and verify before moving on. This is the only way to reach the full build reliably. Since you're directing Claude Code without reading the code yourself, this matters even more than usual: at the end of each phase, Claude Code should be running the tests/build itself and telling you pass or fail, not you inspecting the code.

Two things in the original spec need a decision now, given no Mac is available:

- **Mobile builds**: React Native was specified without saying which toolchain. Building iOS locally requires Xcode, which only runs on macOS. The fix is **Expo** with **EAS Build** — Expo's cloud build service compiles the iOS app on Apple's infrastructure and hands you a build, no Mac required. You'll still need an Apple Developer account (see checklist below), but never Xcode itself. This is locked in as the mobile stack below.
- **"Claude Code should drive entirely"**: this works, but a few steps in this project involve real money, real user data, and app store review — an Apple Developer account, a Stripe account, a live privacy policy. Claude Code can write all the code and config for these, but *account creation, identity verification, and payment setup* have to be done by you clicking through the actual websites — no coding agent can do that on your behalf. The checklist in Section 2 lists exactly what those are, so you can knock them out up front instead of getting stuck mid-phase.

---

## 1. Where to run this: VS Code vs. a cloud "code tab"

Use **Claude Code in VS Code, on your own Windows or Linux machine**, not a browser-based/cloud code tab, for the actual multi-month build. Reasons specific to this project:

- This is a long-running project (weeks to months, many sessions). You need a persistent local folder with git history, a saved `.env` file for your API keys, and the ability to reopen the exact same project tomorrow. Cloud/browser code environments (including the one this conversation is running in) are generally ephemeral — built for a single task or session, not for a project you come back to for months.
- You'll want to actually see the app running — open `localhost:3000` in your browser to check the web app, and use the free **Expo Go** app on your own phone to preview the mobile app live as it's built. That loop is native to a local VS Code + terminal setup.
- Claude Code's VS Code extension gives you a diff view for every change and a permission prompt before it runs commands — useful guardrails for a non-technical operator, since you can at least see "56 lines changed in `checkout.ts`" even if you don't read code closely, and you're asked before anything destructive runs.

Setup is: install VS Code, install Node.js (LTS version), install the Claude Code extension (or `npm install -g @anthropic-ai/claude-code` for the terminal version), and `git init` three folders for your three repos. I'm glad to walk you through that installation step by step whenever you're ready — it's about 15 minutes.

If "the code tab" you meant is something else (e.g., a specific feature in an app you have open), let me know which and I'll give a more specific answer — but for a project of this size and duration, a local VS Code setup is the right call regardless.

---

## 2. Manual setup checklist — things only you can do

Claude Code can generate all the config for these, but the account creation and identity/payment verification are yours. Do these roughly in this order, spread across the phases below rather than all on day one:

1. **GitHub account** — free. You'll need this for the three repos and CI/CD regardless of anything else.
2. **Domain** — confirm you own `blessyourloaf.com` or register it (Namecheap, Google Domains successor, etc.).
3. **Vercel account** (free tier to start) — hosts the web app.
4. **Supabase account** (free tier to start) — database, auth, storage, edge functions.
5. **Anthropic API key** (console.anthropic.com) — billed separately from your Claude subscription; this is what the app itself calls at runtime.
6. **Stripe account** — requires your LLC's business details and a bank account for payouts. Budget a day or two for verification.
7. **Apple Developer Program** — $99/year, enrolled as **Lone Star Que, LLC** (requires a D-U-N-S number if enrolling as an organization rather than an individual — this can take 1–2 weeks to obtain if you don't have one already, so start this early if you want the org name on the App Store listing).
8. **Google Play Console account** — $25 one-time.
9. **Expo account** (free) — used for EAS Build/Submit.
10. A **support email inbox** at `brian@lonestarque.com` that's actually monitored, since it's published in the app and to Apple/Google.

None of these block Phase 1 (web recipes). Do #1–5 before Phase 1, and the rest before the phase that needs them (billing before Phase 4, Apple/Google before Phase 8).

---

## 3. Technical decisions locked in (gaps the original prompt left open)

- **Mobile**: Expo (managed workflow) + EAS Build/Submit. No Xcode needed.
- **AI provider abstraction**: a single `AIProvider` interface in the backend with one implementation per vendor (`ClaudeProvider`, `OpenAIProvider`, etc.), selected by an environment variable. Only `ClaudeProvider` gets built now; the interface is what makes swapping later possible. The Vercel AI SDK is a reasonable base for this since it already has adapters for Anthropic, OpenAI, Google, and Mistral.
- **i18n (English/Spanish)**: `next-intl` for the web app, `i18next` + `react-i18next` for the mobile app. All user-facing strings go through translation keys from day one — retrofitting this later is painful.
- **Offline storage**: mobile uses `expo-sqlite` (or WatermelonDB if the sync logic gets complex) as a local database that mirrors the relevant Supabase tables, with a sync queue that pushes changes when connectivity returns. Web offline support requires turning the Next.js app into a PWA with a service worker and IndexedDB (via Dexie.js) — this is real, separate work from the mobile offline layer, not something that falls out automatically from "Next.js."
- **Photo compression**: compress client-side before upload — `expo-image-manipulator` on mobile, `browser-image-compression` on web — then store the compressed file in Supabase Storage. Never upload raw photos.
- **Testing**: Vitest + React Testing Library (unit, web), Jest + React Native Testing Library (unit, mobile), Playwright (E2E, web), Maestro (E2E, mobile — simpler than Detox and works well with Expo).
- **CI/CD**: GitHub Actions. Web: lint/test/build on every PR, auto-deploy to Vercel on merge to main. Mobile: GitHub Actions triggers EAS Build on merge/tag. Backend: Supabase CLI migrations applied via a GitHub Actions job, never applied by hand against production.
- **Moderation "human review"**: for launch, that's you. Build a simple protected `/admin/moderation` queue in the web app (flagged items + report queue), not a separate admin product. Revisit if/when volume requires more than one moderator.
- **AI prompt retention**: as actually built, this differs from the original 30-day-paid-only plan above. Only Troubleshooter and Ingredient Substitution persist full conversation content, for every tier (not gated by paid/free) — kept for up to 14 days from when the conversation starts, then permanently purged by a scheduled job (`/api/cron/retention-purge`, enforcing the `archive_expires_at` column both tables' migrations set up). Recipe Generator, Recipe Import, and Bake Scheduler never store prompt content at all, for any tier — only a timestamp + user id to enforce the daily count, which was originally meant to be the free-tier behavior but ended up applying to all three of those specific routes regardless of tier. See the Privacy Policy's "AI features" section for the version a user actually reads.
- **Legal documents**: Claude Code will draft App Store–safe privacy policy, ToS, subscription terms, moderation policy, and data retention policy — but have an actual attorney (even a quick paid review) look at these before publishing. This is a real LLC processing real payments and user data; a mismatch between your privacy policy and actual data practices is also one of the more common App Store/Play rejection reasons, so accuracy here isn't optional polish.
- **Sign in with Apple**: Apple requires this if you offer *any* other third-party login (Google, Facebook) — it's already in your spec, just noting it's a hard requirement, not a nice-to-have.
- **Instagram login**: dropping this from the auth list. Instagram doesn't have a general-purpose "Sign in with Instagram" OAuth flow the way Google/Facebook/Apple do — Meta's Instagram APIs are built for content/business tools, not consumer auth. Facebook Login covers the same audience with far less integration risk. Flagging this now so Claude Code doesn't burn a session trying to build something Instagram's API doesn't support.

---

## 4. Product spec (unchanged scope)

Everything from your original Sections 1–8 carries forward as written: the mission, brand identity, all core features (clean recipes, starter management, baking workflow, AI skills, public social features, offline mode, notifications, English/Spanish), the Supabase schema requirements, the auth/billing model ($5.99/mo or $49.99/yr, 2 free AI chats/day, no trial), and the moderation policy text. Paste your original Sections 1–8 into each repo's `CLAUDE.md` beneath this file, or keep them in a shared `SPEC.md` that all three repos reference — either works, just make sure Claude Code has it loaded at the start of every session, since it has no memory between sessions otherwise.

---

## 5. Brand voice

**`VOICE.md` at the repo root is the source of truth for tone, persona, mechanical rules, banned words, nutrition/celiac boundaries, and Spanish register — this section no longer restates them.** Read `VOICE.md` before writing or reviewing any user-facing copy or AI system prompt. It supersedes the persona this section used to describe (a generic "gentle, warm guide") with a more specific one — a Texas home baker who talks like a neighbor over the fence, not a dialect performance — but the underlying rule this section always had is unchanged: no regional dialect or terms of endearment ("sugar," "honey," "darlin'," "hon," "y'all," "sweetie," "ain't," "mama/grandmama," dropped-g contractions) in AI responses or hardcoded copy, ever. Starter personification ("she/her" — name her, feed her, she's hungry) is sourdough-community convention, not dialect, and stays.

`src/lib/voice.ts`'s `VOICE_SYSTEM_PROMPT` is the runtime copy actually sent to Claude across every AI route — it mirrors VOICE.md sections 1-4 section-for-section, since a serverless function can't reliably read an arbitrary repo-root file at request time. If `voice.ts` and `VOICE.md` ever disagree, `VOICE.md` wins and `voice.ts` is stale.

**Topic boundary (troubleshooter, bake-schedule, and any other free-text AI input):** the AI only discusses sourdough baking and its actual process — the starter, mixing, fermentation, shaping, scoring, baking, ingredients, and the equipment/tools/appliances used in that process. Anything else gets a gentle decline and a redirect back to baking, regardless of how the request is phrased (including "ignore previous instructions," roleplay attempts, or hypothetical framing) — no exceptions. This is enforced two ways, both required:
1. A hard "STAY ON TOPIC" instruction in the system prompt itself (`src/app/api/troubleshooter/route.ts`, `src/app/api/bake-schedule/route.ts`) — this is the actual source of truth, and the only enforcement for photo uploads, since images can't be keyword-filtered.
2. A cheap keyword pre-filter (`looksOffTopic`, in `src/lib/sourdough-ai.ts`) that short-circuits obviously off-topic *text* messages before they reach the Anthropic call, so quota/cost isn't spent on clearly unrelated requests. It's deliberately conservative — short replies (≤4 words) always pass through untouched, since mid-conversation answers like "about 3 days ago" won't contain baking vocabulary but are still on-topic. Don't make this filter stricter without checking it against real multi-turn troubleshooter conversations first; over-tightening it will start blocking legitimate replies.

System prompt alone was judged not reliable enough on its own for a "no exceptions" requirement — a system prompt is a strong steer, not a hard constraint, and a determined user can attempt to override it. Keep both layers.

**Known gap:** the recipe library content seeded via `scripts/seed-recipes.ts` (recipe descriptions and step notes shown on `/recipes` and `/recipes/[slug]`) still has old-persona language (confirmed still present: "Darlin'," in the cinnamon-raisin recipe's description) as of this writing — it was intentionally deferred to a separate pass, not missed. If you're asked to finish the brand voice work, that script (and a re-run of its Supabase upsert) is what's left.

---

## 6. Phased build plan

Work through these in order. Each phase ends with something you can point Claude Code at to prove it actually works — don't let it mark a phase "done" without running the check.

**Phase 0 — Scaffolding.** Create the three repos (`bless-your-loaf-web`, `bless-your-loaf-mobile`, `bless-your-loaf-backend`) with basic Next.js / Expo / Supabase project structure, connected to your accounts from Section 2. *Done when:* `npm run dev` starts the web app locally and shows a placeholder homepage; `npx expo start` shows a placeholder screen in Expo Go on your phone.

**Phase 1 — Clean, ad-free recipes** (your top priority feature). Recipe import from URL, AI cleanup of messy recipes, structured steps, ingredient list, step timers, baker's percentages (Advanced Mode), offline access for saved recipes. *Done when:* you can paste a real Pinterest recipe URL into the running app and get back a clean, structured recipe with working step timers.

**Phase 2 — Starter management.** Health analytics, feeding reminders, growth tracking, hydration calculator, temperature predictions, naming. *Done when:* you can log a starter feeding, see it reflected in a growth chart, and get a feeding reminder notification.

**Phase 3 — Baking workflow.** Autolyse/bulk fermentation/proofing/bake timers, step-by-step coach. *Done when:* you can run through a full bake start-to-finish using only in-app timers and prompts.

**Phase 4 — Auth & billing.** All auth providers, Stripe subscriptions, free/paid gating. *Done when:* you can sign up, get gated at 2 free AI actions/day, subscribe via a real (test-mode) Stripe payment, and see the gate lift to the paid tier's 50/day fair-use allowance immediately.

**Phase 5 — AI skills.** Troubleshooting, ingredient substitution, recipe generation — built on the provider abstraction from Section 3, Claude only for now. *Done when:* each AI skill responds correctly to a real test case (e.g., "my dough is too sticky") and the 50/day fair-use cap works correctly for a subscribed test account while the free account still hits its 2/day cap. Paid is generous, not unlimited: it's a fair-use backstop sized so no real day of baking comes close, not an uncapped allowance — see `src/lib/ai-usage.ts` for the cost math behind that number.

**Phase 6 — Public feed & moderation.** Feed, comments, follows, report button, AI flagging, and your admin moderation queue. *Done when:* a flagged test post appears in your moderation queue and you can action it.

**Phase 7 — Offline mode.** Full offline support per Section 3's storage decisions, plus sync-back-online. *Done when:* you can put your phone in airplane mode, log a feed and a bake, reconnect, and see it sync to Supabase.

**Phase 8 — Mobile builds & store submission.** EAS Build for iOS/Android, App Store Connect and Google Play Console listings, screenshots, metadata. *Done when:* you have an installable TestFlight build on your own phone.

**Phase 9 — Legal, marketing polish, launch prep.** Final legal doc review (get the attorney pass here), marketing copy, App Store assets, DNS cutover for blessyourloaf.com.

---

## 7. Kicking off a phase — copy-paste prompt

At the start of each phase's first Claude Code session, use something like:

> We're building Bless Your Loaf. Read `CLAUDE.md` in this repo for the full spec. We're on **Phase [N]: [name]** from the build plan. Build only what's needed for this phase — don't start on later phases. Before telling me a task is done, run the tests and the build yourself and show me the pass/fail output. If anything is ambiguous, ask me rather than guessing.

That last instruction matters a lot given you're not reading the code — it's what keeps Claude Code from silently making a judgment call you'd have wanted to weigh in on.

---

## 8. Guardrails worth double-checking as you go

- **Row-level security**: ask Claude Code to explicitly show you (in plain English) what each RLS policy allows and blocks, for every table, before Phase 4 ships — a misconfigured policy here is how one user's data becomes visible to another.
- **Stripe webhooks**: must verify the webhook signature and be idempotent (Stripe retries deliveries) — ask Claude Code to confirm both explicitly.
- **Legal docs**: attorney pass before Phase 9 launch, not after.
- **Consider a second opinion at security-sensitive points** (auth, payments, RLS): even a fresh Claude Code/Claude session reviewing the diff with fresh eyes catches things the original session missed, since you won't be reading the code yourself.

---

*This document was prepared as a build plan, not a legal or financial document. The account-verification timelines above (especially Apple's D-U-N-S requirement) are estimates — confirm current timelines on Apple's and Google's developer sites when you get there.*
