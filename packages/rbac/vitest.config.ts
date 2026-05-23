import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: "./",
    environment: "node",

    // Default includes all test types
    include: ["test/**/*.spec.ts", "test/**/*.integration-spec.ts", "test/**/*.e2e-spec.ts"],

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "./coverage",
      exclude: [
        "node_modules/",
        "dist/",
        "test/",
        "**/*.spec.ts",
        "**/*.integration-spec.ts",
        "**/*.e2e-spec.ts",
      ],
    },

    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
