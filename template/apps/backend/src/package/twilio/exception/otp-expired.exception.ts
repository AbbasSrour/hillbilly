/* @hillbilly-sync */
import { UnprocessableEntityException } from "@nestjs/common";

export class OtpExpiredException extends UnprocessableEntityException {
  constructor(error?: string) {
    super("error.auth.otpExpired", error);
  }
}
