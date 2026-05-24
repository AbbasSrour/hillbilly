/* @hillbilly-sync */
import { LanguageCode } from '@/constant/language-code.constant';
import { EnumField } from '@/decorator/field/enum-field.decorator';
import { StringField } from '@/decorator/field/string-field.decorator';

export class CreateTranslationDto {
  @EnumField(() => LanguageCode)
  languageCode!: LanguageCode;

  @StringField()
  text!: string;
}
