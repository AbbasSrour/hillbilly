import "../i18n/language-code";

import { applyLanguageCodeEnumMetadata } from "@hillbilly/nest/constant";
import { defineConfig } from "@mikro-orm/postgresql";
import { ExampleTranslationEntity } from "../module/example/entity/example-translation.entity";

export default defineConfig({
  entities: [ExampleTranslationEntity],
  dbName: process.env.DATABASE_NAME ?? "app",
  host: process.env.DATABASE_HOST ?? "localhost",
  port: Number(process.env.DATABASE_PORT ?? 5432),
  user: process.env.DATABASE_USER ?? "postgres",
  password: process.env.DATABASE_PASSWORD ?? "postgres",
  discovery: {
    onMetadata: applyLanguageCodeEnumMetadata,
  },
});
