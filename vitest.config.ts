import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

// Isolated test config — kept separate from vite.config.ts so the production
// build pipeline (PWA, Tailwind) is never pulled into the test run.
export default defineConfig({
  test: {
    environment: 'node', // pure-logic tests; no DOM needed
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
