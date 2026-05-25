import { ApiPropertyOptions } from "@nestjs/swagger";
import _ from "lodash";
const { omit } = _;

const NON_SWAGGER_PROPERTIES = [
  "swagger",
  "filterOptions",
  "groups",
  "each",
  "toLowerCase",
  "toUpperCase",
  "trim",
  "int",
  "isPositive",
  "min",
  "max",
];

export function getSwaggerOptions(options: object): ApiPropertyOptions {
  return omit(options, NON_SWAGGER_PROPERTIES);
}
