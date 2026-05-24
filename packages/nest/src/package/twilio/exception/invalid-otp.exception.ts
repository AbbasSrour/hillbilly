import { UnprocessableEntityException } from "@nestjs/common";

export class InvalidOtpException extends UnprocessableEntityException {
  constructor(error?: string) {
    super("error.auth.invalidOtp", error);
  }
}
