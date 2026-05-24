import { AbstractDto } from '@/abstract';
import { DateField, StringField } from '@/decorator';
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
