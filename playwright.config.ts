import { defineConfig, devices } from '@playwright/test'
import { loadEnvConfig } from '@next/env'

// Loads .env/.env.local/.env.production/.env.production.local in the same order and
// precedence Next.js itself uses for `next build` + `next start` (dev: false) — so admin
// Supabase calls made directly from test files (e2e/support/test-users.ts) talk to the same
// project the app-under-test is running against.
loadEnvConfig(process.cwd(), false)

// 3000 is already occupied by another local Next process on this machine (unrelated to this
// suite) — 3100 keeps the Playwright-managed build fully isolated from it rather than
// fighting over the port or reusing a server that isn't a fresh `npm run build && npm start`.
const PORT = 3100
const baseURL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 60_000,
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Always a local build of this app, started fresh — never blessyourloaf.com, and never a
  // `next dev` server that happened to already be running. NEXT_PUBLIC_APP_URL is pinned to
  // this local baseURL here (an actual process env var wins over anything in .env.local, per
  // Next's env-loading rules) so nothing generated during a test run — a Stripe redirect URL,
  // say — can ever point at production, even though none of these tests exercise that path.
  webServer: {
    command: 'npm run build && npm start',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 300_000,
    env: {
      NEXT_PUBLIC_APP_URL: baseURL,
      PORT: String(PORT),
    },
  },
})
