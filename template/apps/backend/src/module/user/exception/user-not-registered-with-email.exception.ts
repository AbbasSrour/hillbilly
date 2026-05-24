import { BadRequestException } from '@nestjs/common';

export class UserNotRegisteredWithEmailException extends BadRequestException {
  constructor(error?: string) {
    super('error.user.notRegisteredWithEmail', error);
  }
}
