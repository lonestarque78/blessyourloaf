import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    // The Expo mobile app is a separate project with its own test runner (Jest, run from
    // mobile/) — same boundary as tsconfig.json's "exclude" and eslint's globalIgnores.
    // e2e/ is Playwright's project (run via `npm run test:e2e`), not vitest's — its *.spec.ts
    // files import `test`/`expect` from @playwright/test, which isn't a valid vitest runner.
    exclude: ['**/node_modules/**', 'mobile/**', 'e2e/**'],
  },
})
