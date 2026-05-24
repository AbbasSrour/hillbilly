import { AbstractDto } from '@hillbilly/nest/abstract';
import type { PermissionKeys } from '@constant/permissions.constant';
import { permissionKeys } from '@constant/permissions.constant';
import { StringField, StringFieldOptional } from '@hillbilly/nest/decorator';
import { PermissionEntity } from '../entity/permission.entity';

export type PermissionDtoOptions = object;

export class PermissionDto extends AbstractDto {
  @StringField()
  public readonly name: string;

  @StringField({
    enum: permissionKeys,
  })
  public readonly code: PermissionKeys;

  @StringFieldOptional()
  public readonly description?: string;

  constructor(permission: PermissionEntity, options: PermissionDtoOptions) {
    super(permission);

    this.name = permission.name;
    this.code = permission.code as PermissionKeys;
    this.description = permission.description;
  }
}
