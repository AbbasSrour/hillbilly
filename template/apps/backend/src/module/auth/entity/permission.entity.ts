import { AbstractEntity } from '@hillbilly/nest/abstract';
import { UseDto } from '@hillbilly/nest/decorator';
import { Collection } from '@mikro-orm/core';
import { Entity, ManyToMany, Property } from '@mikro-orm/decorators/legacy';
import {
  PermissionDto,
  PermissionDtoOptions,
} from '../dto/permission.dto';
import { RoleEntity } from './role.entity';

@Entity({ tableName: 'permissions' })
@UseDto(() => PermissionDto)
export class PermissionEntity extends AbstractEntity<
  PermissionDto,
  PermissionDtoOptions
> {
  @Property({ unique: true, type: 'varchar', length: 255 })
  public name: string;

  @Property({ unique: true, type: 'varchar', length: 255 })
  public code: string;

  @Property({ type: 'text', nullable: true })
  public description?: string;

  @ManyToMany(
    () => RoleEntity,
    (role) => role.permissions,
  )
  public roles = new Collection<RoleEntity>(this);
}
