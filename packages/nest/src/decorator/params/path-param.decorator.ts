import { Param, PipeTransform, Type } from "@nestjs/common";
import { ApiParamOptions } from "@nestjs/swagger";
import { DECORATORS } from "@/constant/swagger.constants";
import { isString, omit } from "lodash";

type SwaggerEnumType = object | (string | number)[];

export function getEnumValues(
  enumType: SwaggerEnumType | (() => SwaggerEnumType),
): string[] | number[] {
  if (typeof enumType === "function") {
    return getEnumValues(enumType());
  }

  if (Array.isArray(enumType)) {
    return enumType as string[];
  }

  if (typeof enumType !== "object") {
    return [];
  }

  const numericValues = Object.values(enumType)
    .filter((value) => typeof value === "number")
    .map((value) => value.toString());

  return Object.keys(enumType)
    .filter((key) => !numericValues.includes(key))
    .map((key) => enumType[key]);
}

export function getEnumType(values: (string | number)[]): "string" | "number" {
  const hasString = values.filter(isString).length > 0;
  return hasString ? "string" : "number";
}

export function addEnumSchema(
  paramDefinition: Partial<Record<string, any>>,
  decoratorOptions: Partial<Record<string, any>>,
) {
  const paramSchema: Record<string, unknown> = paramDefinition.schema || {};
  const enumValues = getEnumValues(decoratorOptions.enum);

  paramDefinition.schema = paramSchema;
  paramSchema.enum = enumValues;
  paramSchema.type = getEnumType(enumValues);

  if (decoratorOptions.enumName) {
    paramDefinition.enumName = decoratorOptions.enumName;
  }

  if (decoratorOptions.enumSchema) {
    paramDefinition.enumSchema = decoratorOptions.enumSchema;
  }
}

export const isEnumDefined = <T extends Partial<Record<"enum", unknown>>>(
  obj: Record<string, unknown>,
): obj is T => Boolean(obj.enum);

/**
 * Combines @Param and @ApiParam functionality for path parameters
 *
 * @param property - The parameter name
 * @param paramOptions - Swagger API parameter options
 * @param pipes - Optional transformation pipes
 */
export function PathParam(
  property: string,
  paramOptions: Partial<ApiParamOptions> = {},
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator {
  return (target: object, key: string | symbol, parameterIndex: number) => {
    Param(property, ...pipes)(target, key, parameterIndex);

    const method = target.constructor.prototype[key];
    if (!method) return;

    const param = {
      name: property,
      in: "path",
      required: true,
      ...omit(paramOptions, "enum"),
    };

    if (isEnumDefined(paramOptions)) {
      addEnumSchema(param, paramOptions);
    }

    const parameters = Reflect.getMetadata(DECORATORS.API_PARAMETERS, method) || [];

    Reflect.defineMetadata(DECORATORS.API_PARAMETERS, [...parameters, param], method);
  };
}
