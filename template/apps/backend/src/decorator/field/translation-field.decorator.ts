/* @hillbilly-sync */
import { supportedLanguageCount } from '@/constant/language-code.constant';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { RequireField } from '@/types/utils';
import { getSwaggerOptions } from '@/utils/swagger.helper';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  NotEquals,
  ValidateNested,
} from 'class-validator';
import { IsNullable } from '../validator/is-nullable.decorator';
import { IsUndefinable } from '../validator/is-undefinable.decorator';
import { IFieldOptions } from './field-options';

export function TranslationsField(
  options: RequireField<Omit<ApiPropertyOptions, 'isArray'>, 'type'> &
    IFieldOptions,
): PropertyDecorator {
  const decorators = [
    ArrayMinSize(supportedLanguageCount),
    ArrayMaxSize(supportedLanguageCount),
    ValidateNested({
      each: true,
    }),
    Type(() => options.type as FunctionConstructor),
  ];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    decorators.push(
      ApiProperty({
        isArray: true,
        ...getSwaggerOptions(options),
      }),
    );
  }

  return applyDecorators(...decorators);
}

export function TranslationsFieldOptional(
  options: RequireField<Omit<ApiPropertyOptions, 'isArray'>, 'type'> &
    IFieldOptions,
): PropertyDecorator {
  return applyDecorators(
    IsUndefinable(),
    TranslationsField({ required: false, ...options }),
  );
}
