import { PageOptionsDto } from '@/abstract/dto/page-options.dto';
import { EnumFieldOptional } from '@/decorator/field/enum-field.decorator';

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
