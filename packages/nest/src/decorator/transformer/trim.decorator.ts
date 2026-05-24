import { Transform } from "class-transformer";
import { isArray, map, trim } from "lodash";

const cleanString = (str: string) => {
  return trim(
    str
      .replace(/^\uFEFF/, "") // Remove BOM at the start
      // biome-ignore lint/suspicious/noMisleadingCharacterClass: <explanation>
      .replace(/[\u200B-\u200D\uFEFF]/g, "") // Remove zero-width characters
      .trim()
      .replaceAll(/\s\s+/g, " "),
  );
};

/**
 * @description trim spaces from start and end, replace multiple spaces with one.
 * @example
 * @ApiProperty()
 * @IsString()
 * @Trim()
 * name: string;
 * @returns PropertyDecorator
 * @constructor
 */
export function Trim(): PropertyDecorator {
  return Transform((params) => {
    const value = params.value as string[] | string;

    if (isArray(value)) {
      return map(value, (v) => cleanString(v));
    }

    return cleanString(value);
  });
}
