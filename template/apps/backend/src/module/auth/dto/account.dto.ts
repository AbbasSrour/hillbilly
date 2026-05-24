import { AbstractDto } from '@/abstract';
import { DateFieldOptional, StringField, StringFieldOptional } from '@/decorator';
import type { AccountEntity } from '../entity/account.entity';

export type AccountDtoOptions = object;

export class AccountDto extends AbstractDto {
  @StringField()
  public readonly accountId: string;

  @StringField()
  public readonly providerId: string;

  @StringField()
  public readonly userId: string;

  @StringFieldOptional()
  public readonly accessToken?: string;

  @StringFieldOptional()
  public readonly refreshToken?: string;

  @StringFieldOptional()
  public readonly idToken?: string;

  @DateFieldOptional()
  public readonly accessTokenExpiresAt?: Date;

  @DateFieldOptional()
  public readonly refreshTokenExpiresAt?: Date;

  @StringFieldOptional()
  public readonly scope?: string;

  @StringFieldOptional()
  public readonly password?: string;

  constructor(account: AccountEntity, options?: AccountDtoOptions) {
    super(account);
    this.accountId = account.accountId;
    this.providerId = account.providerId;
    this.userId = account.userId;
    this.accessToken = account.accessToken;
    this.refreshToken = account.refreshToken;
    this.idToken = account.idToken;
    this.accessTokenExpiresAt = account.accessTokenExpiresAt;
    this.refreshTokenExpiresAt = account.refreshTokenExpiresAt;
    this.scope = account.scope;
    this.password = account.password;
  }
}
