/* @hillbilly-sync */
import { applyDecorators } from "@nestjs/common";
import { ApiProperty, ApiPropertyOptions } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsUUID, NotEquals } from "class-validator";

import { FilterField, FilterOperationType } from "@/decorator/field/filter-field.decorator";
import { ToArray } from "../transformer/to-array.decorator";
import { IsNullable } from "../validator/is-nullable.decorator";
import { IsUndefinable } from "../validator/is-undefinable.decorator";
import type { IFieldOptions } from "./field-options";
import { getSwaggerOptions } from "@/utils/swagger.helper";

export function ApiUUIDProperty(
  options: Omit<ApiPropertyOptions, "type" | "format"> & Partial<{ each: boolean }> = {},
): PropertyDecorator {
  const config: ApiPropertyOptions = {
    type: String,
    format: "uuid",
    ...getSwaggerOptions(options),
  };

  if (options.each) {
    config.isArray = true;
  }

  return ApiProperty(config);
}

export function ApiUUIDPropertyOptional(
  options: Omit<ApiPropertyOptions, "type" | "format" | "required"> &
    Partial<{ each: boolean }> = {},
): PropertyDecorator {
  return ApiUUIDProperty({ required: false, ...options });
}

export function UUIDField(
  options: Omit<ApiPropertyOptions, "type" | "format"> & IFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    Type(() => String),
    IsUUID("4", { each: options.each }),
    FilterField({
      defaultOperation: FilterOperationType.EQUALS,
      ...options.filterOptions,
    }),
  ];

  if (options.nullable) {
    decorators.push(IsNullable({ each: options.each }));
  } else {
    decorators.push(NotEquals(null, { each: options.each }));
  }

  if (options.swagger !== false) {
    decorators.push(ApiUUIDProperty(options));
  }

  if (options.each) {
    decorators.push(ToArray());
  }

  return applyDecorators(...decorators);
}

export function UUIDFieldOptional(
  options: Omit<ApiPropertyOptions, "type" | "required"> & IFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(IsUndefinable(), UUIDField({ required: false, ...options }));
}
