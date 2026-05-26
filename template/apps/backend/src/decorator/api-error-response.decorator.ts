import { applyDecorators, type HttpException, type Type } from '@nestjs/common';
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';

import { ErrorDto } from '@/abstract/dto/error.dto';

const DECORATORS_API_RESPONSE = 'swagger/apiResponse';

const STATUS_DESCRIPTIONS: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  500: 'Internal Server Error',
};

const errorDtoCache = new Map<string, Type<ErrorDto>>();

function getOrCreateErrorDto(ExceptionClass: Type<HttpException>): Type<ErrorDto> {
  const className = ExceptionClass.name;

  if (errorDtoCache.has(className)) {
    // biome-ignore lint/style/noNonNullAssertion: Checked above
    return errorDtoCache.get(className)!;
  }

  const instance = new ExceptionClass();
  const status = instance.getStatus();
  const response = instance.getResponse();
  const error = (response as { error?: string }).error || instance.message;

  class SpecificErrorDto extends ErrorDto {
    @ApiProperty({
      type: 'number',
      enum: [status],
    })
    declare statusCode: number;

    @ApiProperty({
      type: 'string',
      enum: [instance.message],
    })
    declare message: string;

    @ApiProperty({
      type: 'string',
      enum: [error],
    })
    declare error: string;
  }

  // Rename the class to match the exception (critical for Swagger schema naming)
  Object.defineProperty(SpecificErrorDto, 'name', { value: className });

  errorDtoCache.set(className, SpecificErrorDto);
  return SpecificErrorDto;
}

export function ApiErrorResponse(...exceptions: Type<HttpException>[]): MethodDecorator {
  const errorDtos = exceptions.map((ex) => getOrCreateErrorDto(ex));

  return applyDecorators(
    ApiExtraModels(ErrorDto, ...errorDtos),
    (target: object, key: string | symbol, descriptor: PropertyDescriptor) => {
      const statusMap = new Map<number, Type<ErrorDto>[]>();

      for (let i = 0; i < exceptions.length; i++) {
        try {
          const ExceptionClass = exceptions[i]!;
          const DtoClass = errorDtos[i]!;
          const instance = new ExceptionClass();
          const status = instance.getStatus();

          if (!statusMap.has(status)) {
            statusMap.set(status, []);
          }
          statusMap.get(status)!.push(DtoClass);
        } catch (e) {
          console.warn('Could not extract metadata', e);
        }
      }

      const existingResponses =
        Reflect.getMetadata(DECORATORS_API_RESPONSE, descriptor.value) || {};

      for (const [status, dtoClasses] of statusMap.entries()) {
        const newSchemas = dtoClasses.map((DtoClass) => ({
          $ref: getSchemaPath(DtoClass),
        }));

        const existingResponse = existingResponses[status.toString()];

        if (existingResponse) {
          const content = existingResponse.content || {};
          const jsonContent = content['application/json'] || {};
          const schema = jsonContent.schema || {};

          // biome-ignore lint/suspicious/noExplicitAny: Swagger metadata is untyped
          let combinedOneOf: any[] = [];

          if (schema.oneOf) {
            combinedOneOf = [...schema.oneOf, ...newSchemas];
          } else if (schema.$ref || schema.properties) {
            combinedOneOf = [schema, ...newSchemas];
          } else {
            combinedOneOf = newSchemas;
          }

          existingResponses[status.toString()] = {
            // Use existing description or default to a generic one
            description: existingResponse.description || 'Error',
            content: {
              ...content,
              'application/json': {
                ...jsonContent,
                schema: {
                  oneOf: combinedOneOf,
                },
              },
            },
          };
        } else {
          existingResponses[status.toString()] = {
            description: STATUS_DESCRIPTIONS[status] || 'Error',
            content: {
              'application/json': {
                schema: {
                  oneOf: newSchemas,
                },
              },
            },
          };
        }
      }

      Reflect.defineMetadata(DECORATORS_API_RESPONSE, existingResponses, descriptor.value);
    },
  );
}
