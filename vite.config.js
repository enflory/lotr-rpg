import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
  },
  test: {
    // Keep Vitest out of e2e/ — those are Playwright specs
    include: ['tests/**/*.test.js'],
  },
});
