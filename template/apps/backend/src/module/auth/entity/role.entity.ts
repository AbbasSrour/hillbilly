import { AbstractEntity } from '@hillbilly/nest/abstract';
import { UseDto } from '@hillbilly/nest/decorator';
import { Collection } from '@mikro-orm/core';
import { Entity, ManyToMany, Property } from '@mikro-orm/decorators/legacy';
import { RoleDto, RoleDtoOptions } from '../dto/role.dto';
import { PermissionEntity } from './permission.entity';

@Entity({ tableName: 'roles' })
@UseDto(() => RoleDto)
export class RoleEntity extends AbstractEntity<RoleDto, RoleDtoOptions> {
  @Property({ unique: true, type: 'varchar', length: 255 })
  public name: string;

  @Property({ type: 'text', nullable: true })
  public description?: string;

  // @OneToMany(
  //   () => UserEntity,
  //   (user) => user.role,
  // )
  // public users = new Collection<UserEntity>(this);

  @ManyToMany(() => PermissionEntity)
  public permissions = new Collection<PermissionEntity>(this);
}
