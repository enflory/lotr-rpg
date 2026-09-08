import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  // Story tests walk real scenes with fixed-length cinematics (the 6s
  // ferry crossing); CI's software renderer runs the 960×720 canvas
  // ~25% slower, so 30s left no headroom for the longest test
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  // One Phaser game at a time — parallel WebGL instances against a cold
  // dev server flake out. Wall-clock parallelism comes from splitting the
  // projects below across CI runners instead.
  workers: 1,
  // The dot reporter hides per-test timings, which is how chapterJourney
  // grew to half the e2e run unnoticed. `list` prints a duration per test;
  // the HTML report is uploaded as an artifact when CI fails.
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  // `journey` is the full-route walk — one file, ~7 minutes, as long as
  // every other spec combined. Keeping it a separate project lets CI run
  // the two halves on their own runners.
  projects: [
    { name: 'journey', testMatch: /chapterJourney\.spec\.js/ },
    { name: 'rest', testIgnore: /chapterJourney\.spec\.js/ },
  ],
  use: {
    baseURL: 'http://localhost:5173',
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
