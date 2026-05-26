import { LanguageCode } from '@/constant/language-code.constant';
import { EnumFieldOptional } from '@/decorator/field/enum-field.decorator';
import { StringFieldOptional } from '@/decorator/field/string-field.decorator';
import { Theme } from '../constant/theme.constant';

export class CreateSettingsDto {
  @EnumFieldOptional(() => LanguageCode)
  public readonly locale?: LanguageCode;

  @EnumFieldOptional(() => Theme)
  public readonly theme?: Theme;

  @StringFieldOptional()
  public readonly timezone?: string;
}
