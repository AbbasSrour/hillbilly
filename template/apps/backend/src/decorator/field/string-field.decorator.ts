import { applyDecorators } from "@nestjs/common";
import { ApiProperty, ApiPropertyOptions } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsString, MaxLength, MinLength, NotEquals } from "class-validator";

import { Trim } from "@/decorator/transformer/trim.decorator";
import { getSwaggerOptions } from "@/utils/swagger.helper";
import { ToLowerCase } from "../transformer/to-lowercase.decorator";
import { ToUpperCase } from "../transformer/to-uppercase.decorator";
import { IsNullable } from "../validator/is-nullable.decorator";
import { IsUndefinable } from "../validator/is-undefinable.decorator";
import type { IFieldOptions } from "./field-options";
import { FilterField, FilterOperationType } from "./filter-field.decorator";

export interface IStringFieldOptions extends IFieldOptions {
  minLength?: number;
  maxLength?: number;
  toLowerCase?: boolean;
  toUpperCase?: boolean;
  trim?: boolean;
}

export function StringField(
  options: Omit<ApiPropertyOptions, "type"> & IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    Type(() => String),
    IsString({ each: options.each }),
    FilterField({
      defaultOperation: FilterOperationType.CONTAINS,
      ...options,
    }),
  ];

  if (options.nullable) {
    decorators.push(IsNullable({ each: options.each }));
  } else {
    decorators.push(NotEquals(null, { each: options.each }));
  }

  if (options.swagger !== false) {
    decorators.push(
      ApiProperty({
        type: String,
        ...getSwaggerOptions(options),
        isArray: options.each,
      }),
    );
  }

  if (!options.required) {
    const minLength = options.minLength ?? 1;
    decorators.push(MinLength(minLength, { each: options.each }));
  }

  if (options.maxLength) {
    decorators.push(MaxLength(options.maxLength, { each: options.each }));
  }

  if (options.toLowerCase) {
    decorators.push(ToLowerCase());
  }

  if (options.toUpperCase) {
    decorators.push(ToUpperCase());
  }

  if (options.trim) {
    decorators.push(Trim());
  }

  return applyDecorators(...decorators);
}

export function StringFieldOptional(
  options: Omit<ApiPropertyOptions, "type" | "required"> & IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    // TODO move to separate transformer
    Transform((params) => {
      return !params.value && typeof params.value === "string" && params.value.length === 0
        ? undefined
        : params.value;
    }),
    IsUndefinable(),
    StringField({ required: false, ...options }),
  );
}
