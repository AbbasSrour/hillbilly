import { type LanguageCode, getLanguageCodeEnum } from '@hillbilly/nest/constant';
import { EnumFieldOptional, StringFieldOptional } from '@hillbilly/nest/decorator';
import { Theme } from '../constant/theme.constant';

export class UpdateSettingsDto {
  @EnumFieldOptional(() => getLanguageCodeEnum())
  public readonly locale?: LanguageCode;

  @EnumFieldOptional(() => Theme)
  public readonly theme?: Theme;

  @StringFieldOptional()
  public readonly timezone?: string;
}