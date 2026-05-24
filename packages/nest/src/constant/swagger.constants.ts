/**
 * Local re-exports of @nestjs/swagger internal constants and types
 * that aren't available through the public API.
 *
 * These match the actual swagger metadata keys and OpenAPI types
 * used by NestJS Swagger internally.
 */

export const DECORATORS = {
  API_OPERATION: "swagger/apiOperation",
  API_RESPONSE: "swagger/apiResponse",
  API_PRODUCES: "swagger/apiProduces",
  API_CONSUMES: "swagger/apiConsumes",
  API_TAGS: "swagger/apiUseTags",
  API_PARAMETERS: "swagger/apiParameters",
  API_MODEL_PROPERTIES: "swagger/apiModelProperties",
  API_MODEL_PROPERTIES_ARRAY: "swagger/apiModelPropertiesArray",
  API_EXTRA_MODELS: "swagger/apiExtraModels",
  API_EXCLUDE_ENDPOINT: "swagger/apiExcludeEndpoint",
} as const;

// Minimal OpenAPI types used by swagger decorator internals
export interface SchemaObject {
  type?: string;
  format?: string;
  properties?: Record<string, SchemaObject | ReferenceObject>;
  required?: string[];
  [key: string]: unknown;
}

export interface ReferenceObject {
  $ref: string;
}
