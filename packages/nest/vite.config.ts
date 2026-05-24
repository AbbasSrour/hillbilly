import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: [
      "src/index.ts",
      "src/abstract/index.ts",
      "src/constant/index.ts",
      "src/decorator/index.ts",
      "src/exception/index.ts",
      "src/filter/index.ts",
      "src/guard/index.ts",
      "src/interceptor/index.ts",
      "src/interface/index.ts",
      "src/middleware/index.ts",
      "src/package/crypto/index.ts",
      "src/package/pulse/index.ts",
      "src/package/translation/index.ts",
      "src/package/twilio/index.ts",
      "src/package/validation/index.ts",
      "src/pipe/index.ts",
      "src/provider/index.ts",
      "src/types/index.ts",
      "src/utils/index.ts",
      "src/utils/boilerplate.polyfill.ts",
    ],
    dts: {
      resolver: "tsc",
    },
    format: ["esm"],
    sourcemap: false,
    outDir: "dist",
    clean: true,
    unbundle: true,
    deps: {
      skipNodeModulesBundle: true,
    },
  },
});
