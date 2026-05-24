import { Transform } from "class-transformer";
import { parsePhoneNumberWithError } from "libphonenumber-js";

export function PhoneNumberSerializer(): PropertyDecorator {
  return Transform((params) => {
    try {
      return parsePhoneNumberWithError(params.value as string).number;
    } catch (e) {
      return params.value;
    }
  });
}
