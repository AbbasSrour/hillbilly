/* @hillbilly-sync */
import { applyDecorators } from "@nestjs/common";
import { ApiProperty, ApiPropertyOptions } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDefined, NotEquals, ValidateNested } from "class-validator";

import { ToArray } from "@/decorator/transformer/to-array.decorator";
import { Constructor } from "@/types/utils";
import { getSwaggerOptions } from "@/utils/swagger.helper";
import { IsNullable } from "../validator/is-nullable.decorator";
import { IsUndefinable } from "../validator/is-undefinable.decorator";
import { IFieldOptions } from "./field-options";

type IClassFieldOptions = IFieldOptions;

export function ClassField<TClass extends Constructor>(
  getClass: () => TClass,
  options: Omit<ApiPropertyOptions, "type"> & IClassFieldOptions = {},
): PropertyDecorator {
  const classValue = getClass();

  const decorators = [Type(() => classValue), ValidateNested({ each: options.each })];

  if (options.required !== false) {
    decorators.push(IsDefined());
  }

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    decorators.push(
      ApiProperty({
        type: () => getClass(),
        ...getSwaggerOptions(options),
        isArray: options.each,
      }),
    );
  }

  if (options.each) {
    decorators.push(ToArray());
  }

  return applyDecorators(...decorators);
}

export function ClassFieldOptional<TClass extends Constructor>(
  getClass: () => TClass,
  options: Omit<ApiPropertyOptions, "type" | "required"> & IClassFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(IsUndefinable(), ClassField(getClass, { required: false, ...options }));
}
