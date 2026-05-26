import { Order } from '@/constant/order.constant';
import { EnumFieldOptional } from '@/decorator/field/enum-field.decorator';
import { NumberFieldOptional } from '@/decorator/field/number-field.decorator';
import { StringFieldOptional } from '@/decorator/field/string-field.decorator';

export enum DefaultSortOptions {
  ID = 'id',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export class PageOptionsDto<T extends string = string> {
  @EnumFieldOptional(() => Order, {
    default: Order.ASC,
  })
  public readonly order: Order = Order.ASC;

  @EnumFieldOptional(() => DefaultSortOptions)
  public readonly sort?: T = DefaultSortOptions.CREATED_AT as T;

  @NumberFieldOptional({
    minimum: 1,
    default: 1,
    int: true,
  })
  public readonly page: number = 1;

  @NumberFieldOptional({
    minimum: 1,
    maximum: 50,
    default: 10,
    int: true,
  })
  public readonly take: number = 10;

  public get skip(): number {
    return (this.page - 1) * this.take;
  }

  @StringFieldOptional()
  public readonly q?: string;
}
