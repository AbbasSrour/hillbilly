import { AbstractEntity } from '@/abstract';
import { UseDto } from '@/decorator';
import { Entity, Index, ManyToOne, Property } from '@mikro-orm/decorators/legacy';
import { SessionDto, SessionDtoOptions } from '../dto/session.dto';
import { UserEntity } from '../../user/entity/user.entity';

@Entity({ tableName: 'session' })
@UseDto(() => SessionDto)
export class SessionEntity extends AbstractEntity {
  @Property({ type: 'timestamp with time zone' })
  public expiresAt: Date;

  @Property({ type: 'text', unique: true })
  public token: string;

  @Property({ type: 'text', nullable: true })
  public ipAddress?: string;

  @Property({ type: 'text', nullable: true })
  public userAgent?: string;

  @Property({ type: 'text' })
  @Index({ name: 'session_userId_idx' })
  public userId: string;

  // TODO: fix which will allow to have relations while serializing the return of the query to id instead of object
  //       because betterauth expects them to be ids
  // @ManyToOne(() => UserEntity, {
  //   serializer: (user) => user.id,
  // })
  // public user: UserEntity;

  @Property({ type: 'text', nullable: true })
  public impersonatedBy?: string;
}
