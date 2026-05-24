import { AbstractEntity } from '@hillbilly/nest/abstract';
import { UseDto } from '@hillbilly/nest/decorator';
// import { UseDto } from '@hillbilly/nest/decorator';
import { Entity, Index, Property } from '@mikro-orm/decorators/legacy';
import { VerificationDto } from '../dto/verification.dto';

@Entity({ tableName: 'verification' })
@UseDto(() => VerificationDto)
export class VerificationEntity extends AbstractEntity {
  @Index()
  @Property({ type: 'text' })
  public identifier: string;

  @Property({ type: 'text' })
  public value: string;

  @Property({ type: 'timestamp with time zone' })
  public expiresAt: Date;
}
