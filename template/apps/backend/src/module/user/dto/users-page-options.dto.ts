import { PageOptionsDto } from '@/abstract';
import { EnumFieldOptional } from '@/decorator';

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