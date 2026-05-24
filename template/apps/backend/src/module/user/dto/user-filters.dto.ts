import {
  BooleanFieldOptional,
  FilterOperationType,
  UUIDFieldOptional,
} from '@/decorator';

export class UserFiltersDto {
  @UUIDFieldOptional({
    filterOptions: {
      field: 'role',
      operation: FilterOperationType.EQUALS,
    },
  })
  public readonly role?: Uuid;

  @BooleanFieldOptional()
  public readonly isBlocked?: boolean;

  @BooleanFieldOptional({
    filterOptions: {
      field: 'settings.isEmailVerified',
    },
  })
  public readonly isEmailVerified?: boolean;
}