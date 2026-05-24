import { AbstractDto } from '@/abstract';
import { ClassField, StringField, StringFieldOptional } from '@/decorator';
import { Rel } from '@mikro-orm/core';
import { PermissionDto } from './permission.dto';
import { RoleEntity } from '../entity/role.entity';

export type RoleDtoOptions = object;

export class RoleDto extends AbstractDto {
  @StringField()
  public readonly name: string;

  @StringFieldOptional()
  public readonly description?: string;

  @ClassField(() => PermissionDto, { isArray: true, each: true })
  public readonly permissions: Rel<PermissionDto>[];

  constructor(role: RoleEntity, options: RoleDtoOptions) {
    super(role);

    this.name = role.name;
    this.description = role.description;
    this.permissions = role.permissions.toDtos();
  }
}
