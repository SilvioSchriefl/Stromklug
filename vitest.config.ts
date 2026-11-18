import { defineConfig } from 'vitest/config';

// Tests für die reine Rechenlogik (src/lib/**). Kein Browser nötig.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
