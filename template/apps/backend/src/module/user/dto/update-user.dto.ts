import {
  ClassFieldOptional,
  EmailFieldOptional,
  PhoneFieldOptional,
  UUIDFieldOptional,
} from '@/decorator';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { UpdateProfileDto } from './update-profile.dto';

export class UpdateUserDto {
  @EmailFieldOptional()
  public readonly email?: string;

  @PhoneFieldOptional()
  public readonly phoneNumber?: string;

  @UUIDFieldOptional()
  public readonly role?: Uuid;

  @ClassFieldOptional(() => UpdateProfileDto)
  @ValidateNested()
  @Type(() => UpdateProfileDto)
  public readonly profile?: UpdateProfileDto;
}