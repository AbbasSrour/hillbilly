import { applyDecorators } from '@nestjs/common';
import { ApiPropertyOptions } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsPositive, Max, Min, NotEquals } from 'class-validator';

import { getSwaggerOptions } from '@/utils/swagger.helper';
import { ToArray } from '../transformer/to-array.decorator';
import { IsNullable } from '../validator/is-nullable.decorator';
import { IsUndefinable } from '../validator/is-undefinable.decorator';
import { IFieldOptions } from './field-options';
import { FilterField, FilterOperationType } from './filter-field.decorator';

interface INumberFieldOptions extends IFieldOptions {
  min?: number;
  max?: number;
  int?: boolean;
  isPositive?: boolean;
}

export function NumberField(
  options: Omit<ApiPropertyOptions, 'type'> & INumberFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    Type(() => Number),
    FilterField({
      defaultOperation: FilterOperationType.EQUALS,
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
        type: Number,
        ...getSwaggerOptions(options),
        isArray: options.each,
      }),
    );
  }

  if (options.each) {
    decorators.push(ToArray());
  }

  if (options.int) {
    decorators.push(IsInt({ each: options.each }));
  } else {
    decorators.push(IsNumber({}, { each: options.each }));
  }

  if (typeof options.min === 'number') {
    decorators.push(Min(options.min, { each: options.each }));
  }

  if (typeof options.max === 'number') {
    decorators.push(Max(options.max, { each: options.each }));
  }

  if (options.isPositive) {
    decorators.push(IsPositive({ each: options.each }));
  }

  return applyDecorators(...decorators);
}

export function NumberFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & INumberFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(IsUndefinable(), NumberField({ required: false, ...options }));
}
