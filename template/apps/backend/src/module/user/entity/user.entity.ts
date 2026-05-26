import { AbstractEntity } from '@/abstract/entity/abstract.entity';
import { UseDto } from '@/decorator/use-dto.decorator';
import {
  Cascade,
  type Opt,
  type Rel,
} from '@mikro-orm/core';
import {
  BeforeCreate,
  BeforeUpdate,
  Check,
  Entity,
  OneToOne,
  Property,
} from '@mikro-orm/decorators/legacy';
import { UserDto, type UserDtoOptions } from '../dto/user.dto';
import { UserSettingsEntity } from './user-settings.entity';

@Entity({ tableName: 'users' })
@Check({ expression: 'email IS NOT NULL OR phone_number IS NOT NULL' })
@UseDto(() => UserDto)
export class UserEntity extends AbstractEntity<UserDto, UserDtoOptions> {
  @Property({ type: 'varchar', length: 255 })
  public name: string;

  @Property({ unique: true, type: 'varchar', length: 480 })
  public email: string;

  @Property({ type: 'boolean', default: false })
  public emailVerified: boolean;

  @Property({ unique: true, nullable: true, type: 'varchar', length: 50 })
  public phoneNumber?: Opt<string>;

  @Property({ type: 'boolean', default: false })
  public phoneNumberVerified: boolean;

  @Property({ type: 'text', nullable: true })
  public avatar?: string;

  @Property({ type: 'varchar', length: 255 })
  public role: string;

  @Property({ type: 'boolean' })
  public banned: boolean;

  @Property({ type: 'text', nullable: true })
  public banReason?: Opt<string>;

  @Property({ type: 'timestamp with time zone', nullable: true })
  public banExpires?: Opt<Date>;

  @OneToOne(
    () => UserSettingsEntity,
    (userSettings) => userSettings.user,
    {
      cascade: [Cascade.ALL],
      deleteRule: 'cascade',
      eager: false,
      nullable: true,
    },
  )
  public settings: Opt<Rel<UserSettingsEntity>>;

  @BeforeCreate()
  @BeforeUpdate()
  async convertEmailToLowercase() {
    if (this.email) {
      this.email = this.email.toLowerCase();
    }
  }
}
