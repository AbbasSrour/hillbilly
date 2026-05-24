/* @hillbilly-sync */
import { Type, applyDecorators } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from "@nestjs/swagger";

import { PageMetaDto } from "@/abstract/dto/page-meta.dto";
import { PageDto } from "@/abstract/dto/page.dto";

export function ApiPageOkResponse<T extends Type>(options: {
  type: T;
  description?: string;
}): MethodDecorator {
  return applyDecorators(
    ApiExtraModels(PageDto),
    ApiExtraModels(options.type),
    ApiOkResponse({
      description: options.description,
      schema: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: getSchemaPath(options.type) },
          },
          meta: {
            $ref: getSchemaPath(PageMetaDto),
          },
        },
        required: ["data", "meta"],
      },
    }),
  );
}
