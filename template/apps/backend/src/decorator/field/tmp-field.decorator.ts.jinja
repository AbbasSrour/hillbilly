import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { NotEquals } from 'class-validator';
import { getSwaggerOptions } from '@/utils/swagger.helper';
import { IsNullable } from '../validator/is-nullable.decorator';
import { IsTmpKey } from '../validator/is-tmpkey.decorator';
import { IsUndefinable } from '../validator/is-undefinable.decorator';
import { IStringFieldOptions, StringField } from './string-field.decorator';

export function TmpKeyField(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [StringField(options), IsTmpKey({ each: options.each })];

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
        isArray: options.each,
      }),
    );
  }

  return applyDecorators(...decorators);
}

export function TmpKeyFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(IsUndefinable(), TmpKeyField({ required: false, ...options }));
}
