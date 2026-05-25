import { FilterField, FilterOperationType } from "@/decorator/field/filter-field.decorator";
import { applyDecorators } from "@nestjs/common";
import { ApiProperty, ApiPropertyOptions } from "@nestjs/swagger";
import { IsBoolean, NotEquals } from "class-validator";
import { getSwaggerOptions } from "@/utils/swagger.helper";
import { ToBoolean } from "../transformer/to-boolean.decorator";
import { IsNullable } from "../validator/is-nullable.decorator";
import { IsUndefinable } from "../validator/is-undefinable.decorator";
import { IFieldOptions } from "./field-options";

type IBooleanFieldOptions = IFieldOptions;

export function ApiBooleanProperty(
  options: Omit<ApiPropertyOptions, "type"> = {},
): PropertyDecorator {
  return ApiProperty({ type: Boolean, ...(options as ApiPropertyOptions) });
}

export function ApiBooleanPropertyOptional(
  options: Omit<ApiPropertyOptions, "type" | "required"> = {},
): PropertyDecorator {
  return ApiBooleanProperty({ required: false, ...options });
}

export function BooleanField(
  options: Omit<ApiPropertyOptions, "type"> & IBooleanFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    ToBoolean(),
    IsBoolean(),
    FilterField({
      operation: FilterOperationType.EQUALS,
      ...options.filterOptions,
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
        type: Boolean,
        ...getSwaggerOptions(options),
      }),
    );
  }

  return applyDecorators(...decorators);
}

export function BooleanFieldOptional(
  options: Omit<ApiPropertyOptions, "type" | "required"> & IBooleanFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(IsUndefinable(), BooleanField({ required: false, ...options }));
}
