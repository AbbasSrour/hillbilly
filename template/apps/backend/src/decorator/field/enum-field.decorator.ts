import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsEnum, NotEquals } from 'class-validator';

import { FilterField, FilterOperationType } from '@/decorator/field/filter-field.decorator';
import { GeneratorProvider } from '@/provider/generator.provider';
import { getSwaggerOptions } from '@/utils/swagger.helper';
import { ToArray } from '../transformer/to-array.decorator';
import { IsNullable } from '../validator/is-nullable.decorator';
import { IsUndefinable } from '../validator/is-undefinable.decorator';
import { IFieldOptions } from './field-options';

type IEnumFieldOptions = IFieldOptions;

type ApiPropertyEnumType = never[] | Record<string, never> | object;

export function ApiEnumProperty<TEnum extends ApiPropertyEnumType>(
  getEnum: () => TEnum,
  options: Omit<ApiPropertyOptions, 'type'> & { each?: boolean } = {},
): PropertyDecorator {
  const enumValue = getEnum();

  return ApiProperty({
    enum: enumValue,
    enumName: GeneratorProvider.getVariableName(getEnum),
    ...getSwaggerOptions(options),
    isArray: options.each,
  });
}

export function ApiEnumPropertyOptional<TEnum extends ApiPropertyEnumType>(
  getEnum: () => TEnum,
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & {
    each?: boolean;
  } = {},
): PropertyDecorator {
  return ApiEnumProperty(getEnum, { required: false, ...options });
}

export function EnumField<TEnum extends object>(
  getEnum: () => TEnum,
  options: Omit<ApiPropertyOptions, 'type' | 'enum' | 'enumName' | 'isArray'> &
    IEnumFieldOptions = {},
): PropertyDecorator {
  const enumValue = getEnum();
  const decorators = [
    IsEnum(enumValue, { each: options.each }),
    FilterField({
      defaultOperation: FilterOperationType.EQUALS,
      ...options,
    }),
  ];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.each) {
    decorators.push(ToArray());
  }

  if (options.swagger !== false) {
    decorators.push(ApiEnumProperty(getEnum, options));
  }

  return applyDecorators(...decorators);
}

export function EnumFieldOptional<TEnum extends object>(
  getEnum: () => TEnum,
  options: Omit<ApiPropertyOptions, 'type' | 'required' | 'enum' | 'enumName'> &
    IEnumFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(IsUndefinable(), EnumField(getEnum, { required: false, ...options }));
}
