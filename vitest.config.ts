import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Tests für die reine Rechenlogik (src/lib/**). Kein Browser nötig.
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
