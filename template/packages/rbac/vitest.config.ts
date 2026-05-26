import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.spec.ts', 'test/**/*.integration-spec.ts', 'test/**/*.e2e-spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'test/',
        '**/*.spec.ts',
        '**/*.integration-spec.ts',
        '**/*.e2e-spec.ts',
      ],
    },
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
