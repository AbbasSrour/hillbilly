import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, NotEquals } from 'class-validator';

import { FilterField, FilterOperationType } from '@/decorator/field/filter-field.decorator';
import { getSwaggerOptions } from '@/utils/swagger.helper';
import { IsNullable } from '../validator/is-nullable.decorator';
import { IsUndefinable } from '../validator/is-undefinable.decorator';
import { IFieldOptions } from './field-options';

export function DateField(
  options: Omit<ApiPropertyOptions, 'type'> & IFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    Type(() => Date),
    IsDate(),
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
        type: Date,
        ...getSwaggerOptions(options),
      }),
    );
  }

  return applyDecorators(...decorators);
}

export function DateFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & IFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(IsUndefinable(), DateField({ ...options, required: false }));
}
