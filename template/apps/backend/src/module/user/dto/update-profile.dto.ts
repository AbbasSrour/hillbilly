import { DateFieldOptional, StringFieldOptional } from '@hillbilly/nest/decorator';

export class UpdateProfileDto {
  @StringFieldOptional()
  public readonly firstName?: string;

  @StringFieldOptional()
  public readonly lastName?: string;

  @DateFieldOptional({ nullable: true })
  public readonly birthDate?: Date;

  @StringFieldOptional({ nullable: true })
  public readonly gender?: string;

  @StringFieldOptional({ nullable: true })
  public readonly avatar?: string;

  @StringFieldOptional({ nullable: true })
  public readonly allergies?: string;

  @StringFieldOptional({ nullable: true })
  public readonly medicalNotes?: string;

  @StringFieldOptional({ nullable: true })
  public readonly specialNeeds?: string;
}