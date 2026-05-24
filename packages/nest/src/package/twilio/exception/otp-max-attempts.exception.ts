import { HttpException, HttpStatus } from "@nestjs/common";

export class OtpMaxAttemptsException extends HttpException {
  constructor(error?: string) {
    super("error.auth.otpMaxAttempts", HttpStatus.TOO_MANY_REQUESTS, {
      cause: error,
    });
  }
}
