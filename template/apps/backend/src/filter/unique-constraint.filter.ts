import { STATUS_CODES } from "node:http";

import { UniqueConstraintViolationException } from "@mikro-orm/core";
import type { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import { Catch, HttpStatus } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import type { Response } from "express";
import _ from "lodash";
const { camelCase } = _;

@Catch(UniqueConstraintViolationException)
export class UniqueConstraintViolationFilter implements ExceptionFilter<UniqueConstraintViolationException> {
  constructor(public reflector: Reflector) {}

  catch(
    exception: UniqueConstraintViolationException & { constraint: string },
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.CONFLICT;

    const [table, field] = exception.constraint?.split("_") ?? [];
    const tableName = camelCase(table);
    const fieldName = camelCase(`unique_${field}`);
    const errorMessage =
      table && field ? `error.${tableName}.${fieldName}` : `error.${exception.constraint}`;

    const errorType = STATUS_CODES[status];

    response.status(status).json({
      statusCode: status,
      error: errorType,
      message: errorMessage,
    });
  }
}
