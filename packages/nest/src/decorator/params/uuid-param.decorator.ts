import { PathParam } from "@/decorator/params/path-param.decorator";
import { ParseUUIDPipe, type PipeTransform } from "@nestjs/common";
import { Type } from "@nestjs/common/interfaces";
import { ApiParamOptions } from "@nestjs/swagger";

/**
 * UUID parameter decorator with pre-configured UUID format
 */
export function UUIDParam(
  property: string,
  options: Partial<Omit<ApiParamOptions, "type" | "format">> = {},
  pipes: (Type<PipeTransform> | PipeTransform)[] = [],
): ParameterDecorator {
  const allPipes = [new ParseUUIDPipe({ version: "4" }), ...pipes];

  return PathParam(
    property,
    {
      ...options,
      type: "string",
      format: "uuid",
    },
    ...allPipes,
  );
}
