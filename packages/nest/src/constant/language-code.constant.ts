import type { EntityMetadata, Platform } from "@mikro-orm/core";

export const LANGUAGE_CODE_NATIVE_ENUM_NAME = "language_code";

export interface LanguageCodeRegistry {}

export type LanguageCode = keyof LanguageCodeRegistry extends never
  ? string
  : keyof LanguageCodeRegistry;

let languageCodes: readonly string[] = [];

export type LanguageCodeNativeEnumName =
  | string
  | false
  | ((platform: Platform) => string | false | undefined);

export interface LanguageCodeConfig {
  nativeEnumName?: LanguageCodeNativeEnumName;
}

let languageCodeConfig: LanguageCodeConfig = {
  nativeEnumName: LANGUAGE_CODE_NATIVE_ENUM_NAME,
};

export function configureLanguageCodes<const T extends readonly string[]>(
  codes: T,
  config: LanguageCodeConfig = {},
): T {
  languageCodes = codes;
  languageCodeConfig = { ...languageCodeConfig, ...config };

  return codes;
}

export function getLanguageCodes(): readonly string[] {
  if (languageCodes.length === 0) {
    throw new Error(
      "Language codes are not configured. Call configureLanguageCodes(...) before MikroORM discovery.",
    );
  }

  return languageCodes;
}

export function getLanguageCodeEnum(): Record<string, string> {
  return Object.fromEntries(getLanguageCodes().map((code) => [code, code]));
}

export function getSupportedLanguageCount(): number {
  return getLanguageCodes().length;
}

export function getLanguageCodeNativeEnumName(platform?: Platform): string | undefined {
  const { nativeEnumName } = languageCodeConfig;

  if (typeof nativeEnumName === "function") {
    if (!platform) {
      return undefined;
    }

    const resolvedNativeEnumName = nativeEnumName(platform);

    return resolvedNativeEnumName === false ? undefined : resolvedNativeEnumName;
  }

  return nativeEnumName === false ? undefined : nativeEnumName;
}

export function applyLanguageCodeEnumMetadata(meta: EntityMetadata, platform: Platform): void {
  const nativeEnumName = getLanguageCodeNativeEnumName(platform);
  const languageCodeProperty = meta.properties.languageCode;

  if (!languageCodeProperty?.enum) {
    return;
  }

  if (nativeEnumName) {
    languageCodeProperty.nativeEnumName = nativeEnumName;
  } else {
    delete languageCodeProperty.nativeEnumName;
  }
}
