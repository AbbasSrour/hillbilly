import { InternalServerErrorException } from '@nestjs/common';

export class OtpVerificationFailedException extends InternalServerErrorException {
  constructor(error?: string) {
    super('error.auth.otpVerificationFailed', error);
  }
}
