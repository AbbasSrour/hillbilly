import { PageOptionsDto } from '@hillbilly/nest/abstract';
import { EnumFieldOptional } from '@hillbilly/nest/decorator';

export enum UserSort {
  ID = 'id',
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export class UsersPageOptionsDto extends PageOptionsDto<UserSort> {
  @EnumFieldOptional(() => UserSort)
  public override readonly sort?: UserSort = UserSort.CREATED_AT;
}