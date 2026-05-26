import { ClassField } from '@/decorator/field/class-field.decorator';
import { EmailFieldOptional } from '@/decorator/field/email-field.decorator';
import { PasswordFieldOptional } from '@/decorator/field/password-field.decorator';
import { PhoneFieldOptional } from '@/decorator/field/phone-field.decorator';
import { UUIDField } from '@/decorator/field/uuid-field.decorator';
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
