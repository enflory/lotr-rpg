import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  // Story tests walk real scenes with fixed-length cinematics (the 6s
  // ferry crossing); CI's software renderer runs the 960×720 canvas
  // ~25% slower, so 30s left no headroom for the longest test
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  // One Phaser game at a time — parallel WebGL instances against a cold
  // dev server flake out
  workers: 1,
  use: {
    baseURL: 'http://localhost:5173',
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
