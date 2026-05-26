import { AbstractDto } from '@/abstract/dto/abstract.dto';
import { BooleanField } from '@/decorator/field/boolean-field.decorator';
import { ClassField } from '@/decorator/field/class-field.decorator';
import { EmailFieldOptional } from '@/decorator/field/email-field.decorator';
import { PhoneFieldOptional } from '@/decorator/field/phone-field.decorator';
import { StringField } from '@/decorator/field/string-field.decorator';
import type { Rel } from '@mikro-orm/core';
import { UserSettingsDto } from './user-settings.dto';
import type { UserEntity } from '../entity/user.entity';

export type UserDtoOptions = object;

export class UserDto extends AbstractDto {
  @EmailFieldOptional()
  public readonly email?: string;

  @PhoneFieldOptional()
  public readonly phoneNumber?: string;

  @StringField()
  public readonly role: string;

  @BooleanField()
  public readonly isBlocked: boolean;

  @ClassField(() => UserSettingsDto)
  public readonly settings: Rel<UserSettingsDto>;

  constructor(user: UserEntity, options?: UserDtoOptions) {
    super(user);
    this.role = user.role;
    this.email = user.email;
    this.phoneNumber = user.phoneNumber;
    this.settings = user.settings?.toDto();
  }
}
