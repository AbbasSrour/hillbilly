import { AbstractDto } from '@hillbilly/nest/abstract';
import { type LanguageCode, getLanguageCodeEnum } from '@hillbilly/nest/constant';
import { EnumField, StringField } from '@hillbilly/nest/decorator';
import { Theme } from '../constant/theme.constant';
import { UserSettingsEntity } from '../entity/user-settings.entity';

export type UserSettingsDtoOptions = Partial<{ isActive: boolean }>;

export class UserSettingsDto extends AbstractDto {
  @EnumField(() => getLanguageCodeEnum())
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