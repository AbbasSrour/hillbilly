import { AbstractDto } from '@/abstract/dto/abstract.dto';
import { DateField } from '@/decorator/field/date-field.decorator';
import { StringField } from '@/decorator/field/string-field.decorator';
import type { VerificationEntity } from '../entity/verification.entity';

export type VerificationDtoOptions = object;

export class VerificationDto extends AbstractDto {
  @StringField()
  public readonly identifier: string;

  @StringField()
  public readonly value: string;

  @DateField()
  public readonly expiresAt: Date;

  constructor(
    verification: VerificationEntity,
    options?: VerificationDtoOptions,
  ) {
    super(verification);
    this.identifier = verification.identifier;
    this.value = verification.value;
    this.expiresAt = verification.expiresAt;
  }
}
