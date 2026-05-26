import { AbstractEntity } from '@/abstract/entity/abstract.entity';
import { UseDto } from '@/decorator/use-dto.decorator';
import { Cascade } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, Property } from '@mikro-orm/decorators/legacy';
import { AccountDto } from '../dto/account.dto';
import { UserEntity } from '../../user/entity/user.entity';

@Entity({ tableName: 'accounts' })
@UseDto(() => AccountDto)
export class AccountEntity extends AbstractEntity {
  @Property({ type: 'text' })
  public accountId: string;

  @Property({ type: 'text' })
  public providerId: string;

  @Property({ type: 'text' })
  @Index({ name: 'account_userId_idx' })
  public userId!: string;

  // @ManyToOne(() => UserEntity, {
  //   cascade: [Cascade.ALL],
  //   deleteRule: 'cascade',
  // })
  // public user: UserEntity;

  @Property({ type: 'text', nullable: true })
  accessToken?: string;

  @Property({ type: 'text', nullable: true })
  refreshToken?: string;

  @Property({ type: 'text', nullable: true })
  idToken?: string;

  @Property({ type: 'timestamp with time zone', nullable: true })
  accessTokenExpiresAt?: Date;

  @Property({ type: 'timestamp with time zone', nullable: true })
  refreshTokenExpiresAt?: Date;

  @Property({ type: 'text', nullable: true })
  scope?: string;

  @Property({ type: 'text', nullable: true })
  password?: string;
}
