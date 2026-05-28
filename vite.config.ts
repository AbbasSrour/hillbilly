import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "!(template)/**/*": "vp check --fix",
  },
  fmt: {},
  lint: { options: { typeAware: true, typeCheck: true } },
  run: {
    cache: true,
  },
});
