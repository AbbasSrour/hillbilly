/* @hillbilly-sync */
import type { ValidationOptions } from "class-validator";
import { registerDecorator } from "class-validator";
import _ from "lodash";
const { isString } = _;

export function IsTmpKey(validationOptions?: ValidationOptions): PropertyDecorator {
  return (object, propertyName) => {
    registerDecorator({
      propertyName: propertyName as string,
      name: "tmpKey",
      target: object.constructor,
      options: validationOptions,
      validator: {
        validate(value: string): boolean {
          return isString(value) && value.startsWith("tmp/");
        },
        defaultMessage(): string {
          return "error.invalidTmpKey";
        },
      },
    });
  };
}
