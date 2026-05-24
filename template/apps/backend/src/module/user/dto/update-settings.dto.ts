import { LanguageCode } from '@/constant/language-code.constant';
import { EnumFieldOptional, StringFieldOptional } from '@/decorator';
import { Theme } from '../constant/theme.constant';

export class UpdateSettingsDto {
  @EnumFieldOptional(() => LanguageCode)
  public readonly locale?: LanguageCode;

  @EnumFieldOptional(() => Theme)
  public readonly theme?: Theme;

  @StringFieldOptional()
  public readonly timezone?: string;
}
