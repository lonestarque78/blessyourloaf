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
    exclude: ['**/node_modules/**', 'mobile/**'],
  },
})
