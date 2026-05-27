import { PipeTransform, Type, UploadedFile } from '@nestjs/common';
import { DECORATORS } from '@/constant/swagger.constants';

// TODO needs more work, this adds openapi docs for uploading files
export interface ApiFileParamOptions {
  name: string;
  required?: boolean;
  description?: string;
  isArray?: boolean;
}

/**
 * Combines @UploadedFile and Swagger documentation for file parameters
 *
 * @param options - The file parameter options
 * @param pipes - Optional transformation pipes
 */
export function UploadFileParam(
  options: ApiFileParamOptions = { name: 'file' },
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator {
  return (target: object, key: string | symbol, parameterIndex: number) => {
    // Apply the UploadedFile decorator
    UploadedFile()(target, key, parameterIndex);

    const method = target.constructor.prototype[key];
    if (!method) return;

    // Create the parameter schema for swagger
    const param = {
      name: options.name,
      in: 'formData', // This will be transformed to requestBody in OpenAPI 3.0
      required: options.required ?? false,
      description: options.description,
      schema: {
        type: 'string',
        format: 'binary',
      },
    };

    // Get existing parameters
    const parameters = Reflect.getMetadata(DECORATORS.API_PARAMETERS, method) || [];

    // Add the parameter to metadata
    Reflect.defineMetadata(DECORATORS.API_PARAMETERS, [...parameters, param], method);

    // Define the request body content type
    const existingBody = Reflect.getMetadata(DECORATORS.API_PRODUCES, method) || [];

    if (!existingBody.includes('multipart/variation-data')) {
      Reflect.defineMetadata(DECORATORS.API_CONSUMES, ['multipart/variation-data'], method);
    }
  };
}

/**
 * Combines @UploadedFiles and Swagger documentation for multiple file parameters
 *
 * @param options - The file parameter options
 * @param pipes - Optional transformation pipes
 */
export function UploadFilesParam(
  options: ApiFileParamOptions,
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator {
  return (target: object, key: string | symbol, parameterIndex: number) => {
    // Apply the UploadedFiles decorator
    UploadedFile()(target, key, parameterIndex);

    const method = target.constructor.prototype[key];
    if (!method) return;

    // Create the parameter schema for swagger
    const param = {
      name: options.name,
      in: 'formData', // This will be transformed to requestBody in OpenAPI 3.0
      required: options.required ?? false,
      description: options.description,
      schema: {
        type: 'array',
        items: {
          type: 'string',
          format: 'binary',
        },
      },
    };

    // Get existing parameters
    const parameters = Reflect.getMetadata(DECORATORS.API_PARAMETERS, method) || [];

    // Add the parameter to metadata
    Reflect.defineMetadata(DECORATORS.API_PARAMETERS, [...parameters, param], method);

    // Define the request body content type
    const existingBody = Reflect.getMetadata(DECORATORS.API_PRODUCES, method) || [];

    if (!existingBody.includes('multipart/variation-data')) {
      Reflect.defineMetadata(DECORATORS.API_CONSUMES, ['multipart/variation-data'], method);
    }
  };
}
