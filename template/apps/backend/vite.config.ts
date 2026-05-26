import swc from 'unplugin-swc';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  esbuild: {
    target: 'node22',
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  test: {
    globals: true,
    root: './',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        'test/',
        '**/*.spec.ts',
        '**/*.integration-spec.ts',
        '**/*.e2e-spec.ts',
        '**/*.interface.ts',
        '**/*.dto.ts',
        '**/*.entity.ts',
        '**/*.config.*',
        '**/migrations/**',
        '**/generated/**',
      ],
    },
    projects: [
      {
        extends: true,
        test: {
          name: { label: 'unit', color: 'blue' },
          include: ['src/**/*.spec.ts'],
          exclude: ['node_modules', 'dist', 'test', '**/*.integration-spec.ts', '**/*.e2e-spec.ts'],
          setupFiles: ['./vitest.setup.ts'],
          isolate: false,
          pool: 'threads',
          testTimeout: 10_000,
          hookTimeout: 10_000,
        },
      },
      {
        extends: true,
        test: {
          name: { label: 'integration', color: 'yellow' },
          include: ['src/**/*.integration-spec.ts', 'test/**/*.integration-spec.ts'],
          exclude: ['node_modules', 'dist', '**/*.spec.ts', '**/*.e2e-spec.ts'],
          setupFiles: ['./vitest.setup.ts'],
          isolate: true,
          pool: 'forks',
          poolOptions: { forks: { singleFork: false } },
          testTimeout: 20_000,
          hookTimeout: 20_000,
          sequence: { concurrent: true },
        },
      },
      {
        extends: true,
        test: {
          name: { label: 'e2e', color: 'green' },
          include: ['test/**/*.e2e-spec.ts'],
          exclude: ['node_modules', 'dist', 'src/**/*.spec.ts', '**/*.integration-spec.ts'],
          setupFiles: ['./vitest.setup.ts'],
          globalSetup: ['./test/setup/global-setup.ts'],
          isolate: true,
          pool: 'forks',
          poolOptions: { forks: { singleFork: true } },
          testTimeout: 30_000,
          hookTimeout: 60_000,
          sequence: { concurrent: false },
        },
      },
    ],
  },
});
