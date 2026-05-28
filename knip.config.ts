import type { KnipConfig } from "knip";

export default {
  entry: ["src/index.ts"],
  project: ["src/**/*.ts", "!src/**/*.spec.ts"],
  ignore: ["**/routeTree.gen.ts"],
  ignoreDependencies: [
    "@commitlint/cli",
    "@commitlint/config-conventional",
    "commitizen",
    "cz-conventional-changelog",
    "knip",
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
