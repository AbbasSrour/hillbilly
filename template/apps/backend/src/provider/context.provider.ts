import { ClsServiceManager } from 'nestjs-cls';

import type { LanguageCode } from '@/constant/language-code.constant';
import { SessionEntity } from '@/module/auth/entity/session.entity';
import type { UserEntity } from '@/module/user/entity/user.entity';

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class ContextProvider {
  private static readonly nameSpace = 'request';

  private static readonly authUserKey = 'user_key';

  private static readonly sessionKey = 'session_key';

  private static readonly languageKey = 'language_key';

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

  public static setAuthUser(user: UserEntity): void {
    ContextProvider.set(ContextProvider.authUserKey, user);
  }

  public static getAuthUser(): UserEntity | undefined {
    return ContextProvider.get<UserEntity>(ContextProvider.authUserKey);
  }

  public static setLanguage(language: string): void {
    ContextProvider.set(ContextProvider.languageKey, language);
  }

  public static getLanguage(): LanguageCode | undefined {
    return ContextProvider.get<LanguageCode>(ContextProvider.languageKey);
  }

  public static getSession(): SessionEntity | undefined {
    return ContextProvider.get<SessionEntity>(ContextProvider.sessionKey);
  }

  public static setSession(session: SessionEntity): void {
    ContextProvider.set(ContextProvider.sessionKey, session);
  }
}
