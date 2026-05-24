import { getLanguageCodeEnum, type LanguageCode } from "@/constant/language-code.constant";
import { EnumField } from "@/decorator/field/enum-field.decorator";
import { StringField } from "@/decorator/field/string-field.decorator";

export class CreateTranslationDto {
  @EnumField(() => getLanguageCodeEnum())
  languageCode!: LanguageCode;

  @StringField()
  text!: string;
}
