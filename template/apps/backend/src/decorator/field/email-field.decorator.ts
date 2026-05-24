/* @hillbilly-sync */
import { applyDecorators } from "@nestjs/common";
import { ApiProperty, ApiPropertyOptions } from "@nestjs/swagger";
import { IsEmail, NotEquals } from "class-validator";

import { FilterField, FilterOperationType } from "@/decorator/field/filter-field.decorator";
import { IsNullable } from "../validator/is-nullable.decorator";
import { IsUndefinable } from "../validator/is-undefinable.decorator";
import { IStringFieldOptions, StringField } from "./string-field.decorator";
import { getSwaggerOptions } from "@/utils/swagger.helper";

export function EmailField(
  options: Omit<ApiPropertyOptions, "type"> & IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    IsEmail(),
    StringField({
      toLowerCase: true,
      ...options,
    }),
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

export function EmailFieldOptional(
  options: Omit<ApiPropertyOptions, "type"> & IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(IsUndefinable(), EmailField({ required: false, ...options }));
}
