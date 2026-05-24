import { ClsServiceManager } from "nestjs-cls";

import type { LanguageCode } from "@/constant/language-code.constant";
import type { AuthSession, AuthUser } from "@/types/auth";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class ContextProvider {
  private static readonly nameSpace = "request";

  private static readonly authUserKey = "user_key";

  private static readonly sessionKey = "session_key";

  private static readonly languageKey = "language_key";

  private static get<T>(key: string) {
    const store = ClsServiceManager.getClsService();

    return store.get<T>(ContextProvider.getKeyWithNamespace(key));
  }

  private static set(key: string, value: unknown): void {
    const store = ClsServiceManager.getClsService();

    store.set(ContextProvider.getKeyWithNamespace(key), value);
  }

  private static getKeyWithNamespace(key: string): string {
    return `${ContextProvider.nameSpace}.${key}`;
  }

  public static setAuthUser(user: AuthUser): void {
    ContextProvider.set(ContextProvider.authUserKey, user);
  }

  public static getAuthUser(): AuthUser | undefined {
    return ContextProvider.get<AuthUser>(ContextProvider.authUserKey);
  }

  public static setLanguage(language: string): void {
    ContextProvider.set(ContextProvider.languageKey, language);
  }

  public static getLanguage(): LanguageCode | undefined {
    return ContextProvider.get<LanguageCode>(ContextProvider.languageKey);
  }

  public static getSession(): AuthSession | undefined {
    return ContextProvider.get<AuthSession>(ContextProvider.sessionKey);
  }

  public static setSession(session: AuthSession): void {
    ContextProvider.set(ContextProvider.sessionKey, session);
  }
}
