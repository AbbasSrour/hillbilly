import { AbstractDto } from '@/abstract/dto/abstract.dto';
import { DateField } from '@/decorator/field/date-field.decorator';
import { StringField, StringFieldOptional } from '@/decorator/field/string-field.decorator';
import type { SessionEntity } from '../entity/session.entity';

export type SessionDtoOptions = object;

export class SessionDto extends AbstractDto {
  @DateField()
  public readonly expiresAt: Date;

  @StringField()
  public readonly token: string;

  @StringFieldOptional()
  public readonly ipAddress?: string;

  @StringFieldOptional()
  public readonly userAgent?: string;

  @StringField()
  public readonly userId: string;

  @StringFieldOptional()
  public readonly impersonatedBy?: string;

  constructor(session: SessionEntity, options?: SessionDtoOptions) {
    super(session);
    this.expiresAt = session.expiresAt;
    this.token = session.token;
    this.ipAddress = session.ipAddress;
    this.userAgent = session.userAgent;
    this.userId = session.userId;
    this.impersonatedBy = session.impersonatedBy;
  }
}
