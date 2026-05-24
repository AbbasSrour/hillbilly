import { BetterAuthInstance } from '../type/auth';
import { Injectable } from '@nestjs/common';
import { AuthService as BetterAuthService } from '@thallesp/nestjs-better-auth';

/**
 * AuthService - Exposes typed BetterAuth API and helper methods
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly betterAuth: BetterAuthService<BetterAuthInstance>,
  ) {}

  public get api() {
    return this.betterAuth.api;
  }

  public get instance() {
    return this.betterAuth.instance;
  }
}
