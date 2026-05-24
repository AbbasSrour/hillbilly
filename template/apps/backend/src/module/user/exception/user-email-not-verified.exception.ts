import { ForbiddenException } from '@nestjs/common';

export class UserEmailNotVerifiedException extends ForbiddenException {
  constructor(error?: string) {
    super('error.user.emailNotVerified', error);
  }
}
