import { UnprocessableEntityException } from "@nestjs/common";

export class OtpCanceledException extends UnprocessableEntityException {
  constructor(error?: string) {
    super("error.auth.otpCanceled", error);
  }
}
