import { AbstractDto } from '@/abstract/dto/abstract.dto';
import { LanguageCode } from '@/constant/language-code.constant';
import { EnumField } from '@/decorator/field/enum-field.decorator';
import { StringField } from '@/decorator/field/string-field.decorator';
import { Theme } from '../constant/theme.constant';
import { UserSettingsEntity } from '../entity/user-settings.entity';

export type UserSettingsDtoOptions = Partial<{ isActive: boolean }>;

export class UserSettingsDto extends AbstractDto {
  @EnumField(() => LanguageCode)
  locale: LanguageCode;

  @EnumField(() => Theme)
  theme: Theme;

  @StringField()
  timezone: string;

  constructor(userSettings: UserSettingsEntity) {
    super(userSettings);
    this.locale = userSettings.locale;
    this.theme = userSettings.theme;
    this.timezone = userSettings.timezone;
  }
}
