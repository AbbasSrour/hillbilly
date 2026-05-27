import { AbstractDto } from '@/abstract/dto/abstract.dto';
import { ClassField } from '@/decorator/field/class-field.decorator';
import { StringField, StringFieldOptional } from '@/decorator/field/string-field.decorator';
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
