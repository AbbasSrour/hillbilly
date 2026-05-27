import { AbstractEntity } from '@/abstract/entity/abstract.entity';
import { LanguageCode } from '@/constant/language-code.constant';
import { UseDto } from '@/decorator/use-dto.decorator';
import { OptionalProps, type Rel } from '@mikro-orm/core';
import { Entity, Enum, OneToOne, Property } from '@mikro-orm/decorators/legacy';
import { Theme } from '../constant/theme.constant';
import { UserSettingsDto, type UserSettingsDtoOptions } from '../dto/user-settings.dto';
import { UserEntity } from './user.entity';

@Entity({ tableName: 'user_settings' })
@UseDto(() => UserSettingsDto)
export class UserSettingsEntity extends AbstractEntity<UserSettingsDto, UserSettingsDtoOptions> {
  [OptionalProps]: 'locale' | 'theme' | 'timezone';

  @Enum({ items: () => LanguageCode, default: LanguageCode.en_US })
  public locale: LanguageCode = LanguageCode.en_US;

  @Enum({ items: () => Theme, default: Theme.SYSTEM })
  public theme: Theme = Theme.SYSTEM;

  @Property({ default: 'UTC' })
  public timezone = 'UTC';

  @OneToOne(() => UserEntity, {
    deleteRule: 'cascade',
  })
  public user: Rel<UserEntity>;
}
