import { UnauthorizedException as NestUnauthorizedException } from '@nestjs/common';

export class UnauthorizedException extends NestUnauthorizedException {
  constructor(message = 'error.auth.unauthorized') {
    super(message);
  }
}
