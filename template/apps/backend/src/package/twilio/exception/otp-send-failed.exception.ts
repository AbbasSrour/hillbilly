/* @hillbilly-sync */
import { InternalServerErrorException } from "@nestjs/common";

export class OtpSendFailedException extends InternalServerErrorException {
  constructor(error?: string) {
    super("error.auth.otpSendFailed", error);
  }
}
