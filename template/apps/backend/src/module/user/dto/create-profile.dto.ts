import { DateFieldOptional } from '@/decorator/field/date-field.decorator';
import { StringField, StringFieldOptional } from '@/decorator/field/string-field.decorator';

export class CreateProfileDto {
  @StringField()
  public readonly firstName: string;

  @StringField()
  public readonly lastName: string;

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