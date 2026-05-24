/* @hillbilly-sync */
import { applyDecorators } from "@nestjs/common";
import { ApiProperty, ApiPropertyOptions } from "@nestjs/swagger";
import { IsPhoneNumber, NotEquals } from "class-validator";

import { getSwaggerOptions } from "@/utils/swagger.helper";
import { PhoneNumberSerializer } from "../transformer/phone-number-serializer.decorator";
import { IsNullable } from "../validator/is-nullable.decorator";
import { IsUndefinable } from "../validator/is-undefinable.decorator";
import { IFieldOptions } from "./field-options";
import { FilterField, FilterOperationType } from "./filter-field.decorator";

export function PhoneField(
  options: Omit<ApiPropertyOptions, "type"> & IFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    IsPhoneNumber(),
    PhoneNumberSerializer(),
    FilterField({
      defaultOperation: FilterOperationType.CONTAINS,
      ...options,
    }),
  ];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    decorators.push(
      ApiProperty({
        type: String,
        ...getSwaggerOptions(options),
      }),
    );
  }

  return applyDecorators(...decorators);
}

export function PhoneFieldOptional(
  options: Omit<ApiPropertyOptions, "type" | "required"> & IFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(IsUndefinable(), PhoneField({ required: false, ...options }));
}
