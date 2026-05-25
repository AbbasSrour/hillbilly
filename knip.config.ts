import type { KnipConfig } from "knip";

export default {
  workspaces: {
    ".": {
      entry: ["vite.config.ts"],
      project: ["*.config.{ts,js}"],
    },
    "apps/*": {
      entry: ["src/main.ts!", "src/router.tsx!"],
      project: ["src/**/*.{ts,tsx}", "!src/**/*.test.{ts,tsx}", "!src/**/*.spec.{ts,tsx}"],
      ignoreDependencies: [
        "@tanstack/react-router-devtools",
        "@tanstack/react-query-devtools",
        "@testing-library/dom",
        "@testing-library/react",
        "jsdom",
        "vitest",
      ],
    },
    "tools/*": {
      entry: ["src/index.ts"],
      project: ["src/**/*.ts", "!src/**/*.test.ts", "!src/**/*.spec.ts"],
    },
  },
  ignore: ["**/routeTree.gen.ts"],
  ignoreDependencies: [
    "@commitlint/cli",
    "@commitlint/config-conventional",
    "commitizen",
    "cz-conventional-changelog",
    "knip",
    "lint-staged",
    "@release-it/conventional-changelog",
    "release-it",
    "vite-plus",
  ],
  ignoreBinaries: ["oxfmt", "oxlint", "vp"],
  rules: {
    duplicates: "warn",
    enumMembers: "off",
  },
} satisfies KnipConfig;
