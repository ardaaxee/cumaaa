import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { serviceWorkerPlugin } from './scripts/sw-plugin.ts';

export default defineConfig({
  base: './',
  plugins: [react(), serviceWorkerPlugin()],
  build: {
    target: 'es2020',
    sourcemap: false,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/utils/**', 'src/store/**', 'src/services/**'],
      exclude: ['src/services/ai.ts', 'src/services/photoStore.ts'],
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 70 },
    },
  },
});
