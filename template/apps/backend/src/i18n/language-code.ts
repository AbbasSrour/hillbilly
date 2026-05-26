import { LanguageCode } from "@/constant/language-code.constant";

export const languageCodes = [LanguageCode.en_US, LanguageCode.ar_LB] as const;

export type AppLanguageCode = (typeof languageCodes)[number];
