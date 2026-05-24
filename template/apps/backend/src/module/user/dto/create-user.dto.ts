import {
  ClassField,
  EmailFieldOptional,
  PasswordFieldOptional,
  PhoneFieldOptional,
  UUIDField,
} from '@hillbilly/nest/decorator';
import { Type } from 'class-transformer';
import { ValidateIf, ValidateNested } from 'class-validator';
import { CreateProfileDto } from './create-profile.dto';

export class CreateUserDto {
  @ValidateIf((o) => !o.phoneNumber)
  @EmailFieldOptional()
  public readonly email?: string;

  @ValidateIf((o) => !o.email)
  @PhoneFieldOptional()
  public readonly phoneNumber?: string;

  @ValidateIf((o) => !!o.email)
  @PasswordFieldOptional({ minLength: 8 })
  public readonly password?: string;

  @UUIDField()
  public readonly role: Uuid;

  @ClassField(() => CreateProfileDto)
  @ValidateNested()
  @Type(() => CreateProfileDto)
  public readonly profile: CreateProfileDto;
}