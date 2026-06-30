import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// minimal Vitest setup — just enough to unit-test the pure Pokéathlon fusion helpers.
// resolves the `@showdex/*` path alias the same way tsconfig.json does.
export default defineConfig({
  resolve: {
    alias: {
      '@showdex': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
