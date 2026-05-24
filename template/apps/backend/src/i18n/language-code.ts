import { configureLanguageCodes } from "@hillbilly/nest/constant";

export const languageCodes = configureLanguageCodes(["en_US", "ar_LB"] as const, {
  nativeEnumName: "language_code",
});

declare module "@hillbilly/nest/constant" {
  interface LanguageCodeRegistry {
    en_US: true;
    ar_LB: true;
  }
}

export type AppLanguageCode = (typeof languageCodes)[number];
