import { ForbiddenException } from '@nestjs/common';

export class AdminProtectedException extends ForbiddenException {
  constructor(error?: string) {
    super('error.user.adminProtection', error || '');
  }
}
